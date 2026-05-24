import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { appSettings } from '$lib/server/db/schema';
import { createWebhookLog } from '$lib/server/audit';
import { getInstallationOctokit } from '$lib/server/github';
import { triageIssue } from '$lib/server/ai';

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

export async function handleIssueOpened(payload: {
	installation: { id: number };
	repository: { owner: { login: string }; name: string; full_name: string };
	issue: { number: number; title: string; body?: string | null; html_url: string };
}) {
	const startedAt = Date.now();
	const installationId = String(payload.installation.id);
	const settings = await db.query.appSettings.findFirst({
		where: (table, { eq }) => eq(table.installationId, installationId)
	});

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
		return;
	}

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
		return;
	}

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
