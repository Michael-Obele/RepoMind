import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { installations, webhookDeliveries } from '$lib/server/db/schema';
import { createWebhookLog } from '$lib/server/audit';
import { getGitHubWebhooks, hasGitHubAppConfig } from '$lib/server/github';
import {
	deleteInstallation,
	markInstallationSuspended,
	updateInstallationRepositoryCount,
	upsertInstallation
} from '$lib/server/handlers/installation';
import { handleIssueOpened } from '$lib/server/handlers/issue-triage';
import { handlePullRequestOpened } from '$lib/server/handlers/pull-request';

type GitHubWebhookPayload = Record<string, unknown> & {
	action?: string;
	installation?: { id: number; suspended_at?: string | null };
	repository?: { full_name: string };
	repositories?: unknown[];
	repositories_added?: unknown[];
	repositories_removed?: unknown[];
	issue?: { number: number; html_url: string };
	pull_request?: { number: number; html_url: string };
	installation_repositories?: unknown[];
	account?: { login?: string };
};

async function dispatchWebhook(eventName: string, payload: GitHubWebhookPayload) {
	const action = payload.action;

	switch (eventName) {
		case 'installation': {
			if (!payload.installation) {
				return;
			}

			if (action === 'created') {
				await upsertInstallation(
					payload.installation as {
						id: number;
						account: { id: number; login: string; type: string };
						suspended_at?: string | null;
					},
					payload.repositories?.length ?? 0
				);
			}

			if (action === 'deleted') {
				await deleteInstallation(String(payload.installation.id));
			}

			if (action === 'suspend') {
				await markInstallationSuspended(
					String(payload.installation.id),
					payload.installation.suspended_at
						? new Date(payload.installation.suspended_at)
						: new Date()
				);
			}

			if (action === 'unsuspend') {
				await markInstallationSuspended(String(payload.installation.id), null);
			}

			return;
		}

		case 'installation_repositories': {
			if (!payload.installation) {
				return;
			}

			const installationId = String(payload.installation.id);
			const existingInstallation = await db.query.installations.findFirst({
				where: (table, { eq }) => eq(table.id, installationId)
			});

			const nextCount = Math.max(
				0,
				(existingInstallation?.repositoryCount ?? 0) +
					(payload.repositories_added?.length ?? 0) -
					(payload.repositories_removed?.length ?? 0)
			);

			await updateInstallationRepositoryCount(installationId, nextCount);
			return;
		}

		case 'issues': {
			if (action === 'opened') {
				await handleIssueOpened(payload as Parameters<typeof handleIssueOpened>[0]);
			}
			return;
		}

		case 'pull_request': {
			if (action === 'opened') {
				await handlePullRequestOpened(payload as Parameters<typeof handlePullRequestOpened>[0]);
			}
			return;
		}
	}
}

export const POST = async ({ request }) => {
	if (!hasGitHubAppConfig()) {
		return json({ error: 'GitHub App configuration is incomplete.' }, { status: 503 });
	}

	const signature = request.headers.get('x-hub-signature-256');
	const eventName = request.headers.get('x-github-event');
	const delivery = request.headers.get('x-github-delivery');

	if (!signature || !eventName || !delivery) {
		return json({ error: 'Missing required GitHub webhook headers.' }, { status: 400 });
	}

	const body = await request.text();
	const isValid = await getGitHubWebhooks().verify(body, signature);

	if (!isValid) {
		return json({ error: 'Invalid GitHub webhook signature.' }, { status: 401 });
	}

	const payload = JSON.parse(body) as GitHubWebhookPayload;
	const insertedDelivery = await db
		.insert(webhookDeliveries)
		.values({
			deliveryId: delivery,
			eventType: eventName,
			installationId: payload.installation?.id ? String(payload.installation.id) : null
		})
		.onConflictDoNothing()
		.returning({ deliveryId: webhookDeliveries.deliveryId });

	if (!insertedDelivery.length) {
		return json({ accepted: true, delivery, duplicate: true }, { status: 202 });
	}

	queueMicrotask(() => {
		void dispatchWebhook(eventName, payload).catch(async (error) => {
			const installationId = payload.installation?.id;

			if (installationId) {
				try {
					await createWebhookLog({
						installationId: String(installationId),
						eventType: `${eventName}.${payload.action ?? 'received'}`,
						action: 'handler_failed',
						status: 'error',
						repoFullName: payload.repository?.full_name ?? payload.account?.login ?? 'unknown',
						resourceNumber: payload.issue?.number ?? payload.pull_request?.number ?? null,
						resourceUrl: payload.issue?.html_url ?? payload.pull_request?.html_url ?? null,
						errorMessage: error instanceof Error ? error.message : 'Unknown webhook error'
					});
				} catch (logError) {
					console.error(
						'[RepoMind] Failed to log webhook error:',
						logError instanceof Error ? logError.message : logError,
						'| Original error:',
						error instanceof Error ? error.message : error
					);
				}
			} else {
				console.error(
					'[RepoMind] Webhook handler failed without installation context:',
					error instanceof Error ? error.message : error
				);
			}
		});
	});

	return json({ accepted: true, delivery }, { status: 202 });
};
