import { query } from '$app/server';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { appSettings, installations, webhookLogs } from '$lib/server/db/schema';
import { requireUser } from '$lib/server/session';
import * as v from 'valibot';

export const getDashboardOverview = query(async () => {
	requireUser();

	const rows = await db
		.select({
			id: installations.id,
			githubLogin: installations.githubLogin,
			accountType: installations.accountType,
			repositoryCount: installations.repositoryCount,
			suspendedAt: installations.suspendedAt,
			autoTriage: appSettings.autoTriage,
			summarizePrs: appSettings.summarizePrs,
			remindStaleIssues: appSettings.remindStaleIssues,
			staleDaysThreshold: appSettings.staleDaysThreshold,
			totalLogs: sql<number>`count(${webhookLogs.id})`.mapWith(Number)
		})
		.from(installations)
		.leftJoin(appSettings, eq(appSettings.installationId, installations.id))
		.leftJoin(webhookLogs, eq(webhookLogs.installationId, installations.id))
		.groupBy(installations.id, appSettings.id)
		.orderBy(desc(installations.createdAt));

	const metrics = {
		installations: rows.length,
		activeInstallations: rows.filter((row) => !row.suspendedAt).length,
		repositories: rows.reduce((total, row) => total + (row.repositoryCount ?? 0), 0),
		loggedEvents: rows.reduce((total, row) => total + (row.totalLogs ?? 0), 0)
	};

	return { metrics, installations: rows };
});

export const getInstallationDetail = query(v.string(), async (installationId) => {
	requireUser();

	const installation = await db.query.installations.findFirst({
		where: (table, { eq }) => eq(table.id, installationId),
		with: { settings: true }
	});

	const logs = await db.query.webhookLogs.findMany({
		where: (table, { eq }) => eq(table.installationId, installationId),
		orderBy: (table, { desc }) => desc(table.createdAt),
		limit: 20
	});

	return { installation, logs };
});
