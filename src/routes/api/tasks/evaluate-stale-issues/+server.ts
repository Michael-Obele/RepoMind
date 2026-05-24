import { json } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { createWebhookLog } from '$lib/server/audit';
import { db } from '$lib/server/db';
import { appSettings, installations } from '$lib/server/db/schema';
import { sendStaleDigest } from '$lib/server/email';
import { fetchStaleIssuesForInstallation } from '$lib/server/queries/stale-issues';
import { requireTaskSecret } from '$lib/server/session';

export const POST = async ({ request }) => {
	requireTaskSecret(request, env.INTERNAL_TASK_SECRET);

	const rows = await db
		.select({
			installationId: installations.id,
			githubLogin: installations.githubLogin,
			maintainerEmail: appSettings.maintainerEmail,
			staleDaysThreshold: appSettings.staleDaysThreshold
		})
		.from(appSettings)
		.innerJoin(installations, eq(installations.id, appSettings.installationId))
		.where(and(eq(appSettings.remindStaleIssues, true), isNull(installations.suspendedAt)));

	const results = {
		checked: 0,
		emailed: 0,
		skipped: 0,
		errors: [] as string[]
	};

	for (const row of rows) {
		if (!row.maintainerEmail) {
			results.skipped += 1;
			continue;
		}

		results.checked += 1;

		try {
			const issues = await fetchStaleIssuesForInstallation(
				row.installationId,
				row.staleDaysThreshold,
				25
			);

			if (!issues.length) {
				results.skipped += 1;
				await createWebhookLog({
					installationId: row.installationId,
					eventType: 'cron.stale_issues',
					action: 'digest_skipped',
					status: 'skipped',
					repoFullName: row.githubLogin,
					errorMessage: 'No stale issues found.'
				});
				continue;
			}

			await sendStaleDigest({
				to: row.maintainerEmail,
				repoFullName: row.githubLogin,
				issues,
				threshold: row.staleDaysThreshold,
				dashboardUrl: `${env.PUBLIC_APP_URL ?? env.BETTER_AUTH_URL ?? 'http://localhost:5173'}/dashboard/${row.installationId}/settings`
			});

			results.emailed += 1;
			await createWebhookLog({
				installationId: row.installationId,
				eventType: 'cron.stale_issues',
				action: 'digest_sent',
				status: 'success',
				repoFullName: row.githubLogin,
				errorMessage: `Sent ${issues.length} issue reminder${issues.length === 1 ? '' : 's'}.`
			});
		} catch (error) {
			results.errors.push(
				`${row.installationId}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
			await createWebhookLog({
				installationId: row.installationId,
				eventType: 'cron.stale_issues',
				action: 'digest_failed',
				status: 'error',
				repoFullName: row.githubLogin,
				errorMessage: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	return json(results);
};
