import { command, query } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import { appSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/session';
import { fetchStaleIssuesForInstallation } from '$lib/server/queries/stale-issues';
import { sendStaleDigest } from '$lib/server/email';
import { env } from '$env/dynamic/private';

const settingsSchema = v.object({
	installationId: v.string(),
	autoTriage: v.boolean(),
	summarizePrs: v.boolean(),
	remindStaleIssues: v.boolean(),
	staleDaysThreshold: v.pipe(v.number(), v.minValue(3), v.maxValue(90)),
	maintainerEmail: v.optional(v.union([v.string(), v.null()]), null),
	emailDigestHour: v.pipe(v.number(), v.minValue(0), v.maxValue(23))
});

export const getInstallationSettings = query(v.string(), async (installationId) => {
	requireUser();
	return db.query.appSettings.findFirst({
		where: (table, { eq }) => eq(table.installationId, installationId)
	});
});

export const updateInstallationSettings = command(settingsSchema, async (input) => {
	requireUser();
	await db
		.update(appSettings)
		.set({
			autoTriage: input.autoTriage,
			summarizePrs: input.summarizePrs,
			remindStaleIssues: input.remindStaleIssues,
			staleDaysThreshold: input.staleDaysThreshold,
			maintainerEmail: input.maintainerEmail,
			emailDigestHour: input.emailDigestHour,
			updatedAt: new Date()
		})
		.where(eq(appSettings.installationId, input.installationId));
});

export const runStaleIssueScan = command(v.string(), async (installationId) => {
	requireUser();

	const settings = await db.query.appSettings.findFirst({
		where: (table, { eq }) => eq(table.installationId, installationId)
	});

	if (!settings?.maintainerEmail) {
		return { emailed: false, issues: 0, reason: 'Maintainer email is not configured.' };
	}

	const issues = await fetchStaleIssuesForInstallation(
		installationId,
		settings.staleDaysThreshold,
		25
	);

	if (!issues.length) {
		return { emailed: false, issues: 0, reason: 'No stale issues found.' };
	}

	await sendStaleDigest({
		to: settings.maintainerEmail,
		repoFullName: issues[0]?.repoFullName ?? installationId,
		issues,
		threshold: settings.staleDaysThreshold,
		dashboardUrl: `${env.PUBLIC_APP_URL ?? env.BETTER_AUTH_URL ?? 'http://localhost:5173'}/dashboard/${installationId}/settings`
	});

	return { emailed: true, issues: issues.length };
});
