import { command, query } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import { appSettings, issueAlertRules } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireInstallationAccess } from '$lib/server/session';
import { fetchStaleIssuesForInstallation } from '$lib/server/queries/stale-issues';
import { sendStaleDigest } from '$lib/server/email';
import { env } from '$env/dynamic/private';
import { listInstallationRepositories } from '$lib/server/github';

const labelSetSchema = v.pipe(v.array(v.string()), v.minLength(1));

const issueAlertRuleSchema = v.object({
	repoFullName: v.pipe(v.string(), v.minLength(1)),
	enabled: v.boolean(),
	recipientEmails: v.pipe(v.array(v.pipe(v.string(), v.email())), v.minLength(1))
});

const settingsSchema = v.object({
	installationId: v.string(),
	autoTriage: v.boolean(),
	summarizePrs: v.boolean(),
	remindStaleIssues: v.boolean(),
	staleDaysThreshold: v.pipe(v.number(), v.minValue(3), v.maxValue(90)),
	maintainerEmail: v.optional(v.union([v.string(), v.null()]), null),
	emailDigestHour: v.pipe(v.number(), v.minValue(0), v.maxValue(23)),
	labelSet: labelSetSchema,
	issueAlertRules: v.array(issueAlertRuleSchema)
});

function normalizeLabelSet(labels: string[]) {
	return Array.from(new Set(labels.map((label) => label.trim().toLowerCase()).filter(Boolean)));
}

function normalizeRecipientEmails(emails: string[]) {
	return Array.from(new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean)));
}

export const getInstallationSettings = query(v.string(), async (installationId) => {
	await requireInstallationAccess(installationId);

	const [settings, repositories, rules] = await Promise.all([
		db.query.appSettings.findFirst({
			where: (table, { eq }) => eq(table.installationId, installationId)
		}),
		listInstallationRepositories(installationId),
		db.query.issueAlertRules.findMany({
			where: (table, { eq }) => eq(table.installationId, installationId),
			orderBy: (table, { asc }) => asc(table.repoFullName)
		})
	]);

	if (!settings) {
		return null;
	}

	return {
		...settings,
		availableRepositories: repositories,
		issueAlertRules: rules
	};
});

export const updateInstallationSettings = command(settingsSchema, async (input) => {
	await requireInstallationAccess(input.installationId);

	const availableRepositories = await listInstallationRepositories(input.installationId);
	const availableRepoNames = new Set(
		availableRepositories.map((repository) => repository.fullName)
	);
	const nextLabelSet = normalizeLabelSet(input.labelSet);

	if (!nextLabelSet.length) {
		throw new Error('Provide at least one label for auto-triage.');
	}

	const nextIssueAlertRules = input.issueAlertRules.map((rule) => {
		if (!availableRepoNames.has(rule.repoFullName)) {
			throw new Error(`Repository is not available to this installation: ${rule.repoFullName}`);
		}

		const recipientEmails = normalizeRecipientEmails(rule.recipientEmails);

		if (!recipientEmails.length) {
			throw new Error(`Provide at least one recipient for ${rule.repoFullName}.`);
		}

		return {
			id: crypto.randomUUID(),
			installationId: input.installationId,
			repoFullName: rule.repoFullName,
			enabled: rule.enabled,
			recipientEmails
		};
	});

	await db.transaction(async (tx) => {
		await tx
			.update(appSettings)
			.set({
				autoTriage: input.autoTriage,
				summarizePrs: input.summarizePrs,
				remindStaleIssues: input.remindStaleIssues,
				staleDaysThreshold: input.staleDaysThreshold,
				maintainerEmail: input.maintainerEmail,
				emailDigestHour: input.emailDigestHour,
				labelSet: nextLabelSet,
				updatedAt: new Date()
			})
			.where(eq(appSettings.installationId, input.installationId));

		await tx
			.delete(issueAlertRules)
			.where(eq(issueAlertRules.installationId, input.installationId));

		if (nextIssueAlertRules.length) {
			await tx.insert(issueAlertRules).values(nextIssueAlertRules);
		}
	});
});

export const runStaleIssueScan = command(v.string(), async (installationId) => {
	await requireInstallationAccess(installationId);

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
