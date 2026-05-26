import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { appSettings } from '$lib/server/db/schema';
import { createWebhookLog } from '$lib/server/audit';
import { getInstallationOctokit } from '$lib/server/github';
import { triageIssue } from '$lib/server/ai';
import { sendIssueAlert } from '$lib/server/email';

const labelPalette: Record<string, string> = {
	bug: 'd73a4a',
	feature: '1d76db',
	question: '8957e5',
	docs: '0e8a16',
	security: 'b60205'
};

async function ensureLabelsExist(
	owner: string,
	repo: string,
	labels: string[],
	installationId: string
) {
	const octokit = await getInstallationOctokit(installationId);

	for (const label of labels) {
		try {
			await octokit.rest.issues.getLabel({ owner, repo, name: label });
		} catch (error) {
			const status = (error as { status?: number }).status;

			if (status === 404) {
				await octokit.rest.issues.createLabel({
					owner,
					repo,
					name: label,
					color: labelPalette[label] ?? '6b7280'
				});
			}
		}
	}
}

async function sendIssueAlertIfConfigured(options: {
	installationId: string;
	repoFullName: string;
	issueNumber: number;
	issueTitle: string;
	issueBody?: string | null;
	issueUrl: string;
	authorLogin?: string | null;
	labels: string[];
	dashboardUrl: string;
	startedAt: number;
}) {
	const rule = await db.query.issueAlertRules.findFirst({
		where: (table, { and, eq }) =>
			and(
				eq(table.installationId, options.installationId),
				eq(table.repoFullName, options.repoFullName),
				eq(table.enabled, true)
			)
	});

	if (!rule || !rule.recipientEmails.length) {
		return;
	}

	try {
		await sendIssueAlert({
			to: rule.recipientEmails,
			repoFullName: options.repoFullName,
			issueNumber: options.issueNumber,
			issueTitle: options.issueTitle,
			issueBody: options.issueBody,
			issueUrl: options.issueUrl,
			authorLogin: options.authorLogin,
			labels: options.labels,
			dashboardUrl: options.dashboardUrl
		});

		await createWebhookLog({
			installationId: options.installationId,
			eventType: 'issues.opened',
			action: 'issue_alert_sent',
			status: 'success',
			repoFullName: options.repoFullName,
			resourceNumber: options.issueNumber,
			resourceUrl: options.issueUrl,
			errorMessage: `Sent issue alert to ${rule.recipientEmails.join(', ')}.`,
			durationMs: Date.now() - options.startedAt
		});
	} catch (error) {
		await createWebhookLog({
			installationId: options.installationId,
			eventType: 'issues.opened',
			action: 'issue_alert_failed',
			status: 'error',
			repoFullName: options.repoFullName,
			resourceNumber: options.issueNumber,
			resourceUrl: options.issueUrl,
			errorMessage: error instanceof Error ? error.message : 'Unknown issue alert error',
			durationMs: Date.now() - options.startedAt
		});
	}
}

export async function handleIssueOpened(payload: {
	installation: { id: number };
	repository: { owner: { login: string }; name: string; full_name: string };
	issue: {
		number: number;
		title: string;
		body?: string | null;
		html_url: string;
		user?: { login?: string };
	};
}) {
	const startedAt = Date.now();
	const installationId = String(payload.installation.id);
	const settings = await db.query.appSettings.findFirst({
		where: (table, { eq }) => eq(table.installationId, installationId)
	});
	const dashboardBaseUrl =
		process.env.PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? 'http://localhost:5173';
	let appliedLabels: string[] = [];

	if (!settings?.autoTriage) {
		await createWebhookLog({
			installationId,
			eventType: 'issues.opened',
			action: 'triage_skipped',
			status: 'skipped',
			repoFullName: payload.repository.full_name,
			resourceNumber: payload.issue.number,
			resourceUrl: payload.issue.html_url,
			errorMessage: 'Auto-triage is disabled.',
			durationMs: Date.now() - startedAt
		});
	} else {
		const availableLabels = settings.labelSet?.length
			? settings.labelSet
			: ['bug', 'feature', 'question', 'docs', 'security'];
		const triage = await triageIssue({
			title: payload.issue.title,
			body: payload.issue.body,
			availableLabels
		});

		if (triage.confidence < 0.5 || triage.labels.length === 0) {
			await createWebhookLog({
				installationId,
				eventType: 'issues.opened',
				action: 'triage_skipped',
				status: 'skipped',
				repoFullName: payload.repository.full_name,
				resourceNumber: payload.issue.number,
				resourceUrl: payload.issue.html_url,
				aiModel: triage.model,
				tokensUsed: triage.tokensUsed,
				errorMessage: triage.reasoning,
				durationMs: Date.now() - startedAt
			});
		} else {
			const octokit = await getInstallationOctokit(installationId);
			await ensureLabelsExist(
				payload.repository.owner.login,
				payload.repository.name,
				triage.labels,
				installationId
			);
			await octokit.rest.issues.addLabels({
				owner: payload.repository.owner.login,
				repo: payload.repository.name,
				issue_number: payload.issue.number,
				labels: triage.labels
			});
			appliedLabels = triage.labels;

			await createWebhookLog({
				installationId,
				eventType: 'issues.opened',
				action: 'labels_applied',
				status: 'success',
				repoFullName: payload.repository.full_name,
				resourceNumber: payload.issue.number,
				resourceUrl: payload.issue.html_url,
				aiModel: triage.model,
				tokensUsed: triage.tokensUsed,
				durationMs: Date.now() - startedAt
			});
		}
	}

	await sendIssueAlertIfConfigured({
		installationId,
		repoFullName: payload.repository.full_name,
		issueNumber: payload.issue.number,
		issueTitle: payload.issue.title,
		issueBody: payload.issue.body,
		issueUrl: payload.issue.html_url,
		authorLogin: payload.issue.user?.login,
		labels: appliedLabels,
		dashboardUrl: `${dashboardBaseUrl}/dashboard/${installationId}/settings`,
		startedAt
	});
}
