import { error } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import { eq, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { account, installations, userInstallations, userSettings } from '$lib/server/db/schema';

export function requireUser() {
	const event = getRequestEvent();

	if (!event.locals.user) {
		error(401, 'You must be signed in to access RepoMind.');
	}

	return event.locals.user;
}

export async function linkInstallationToUser(userId: string, installationId: string) {
	await db
		.insert(userInstallations)
		.values({
			id: crypto.randomUUID(),
			userId,
			installationId
		})
		.onConflictDoNothing();
}

export async function autoLinkPersonalInstallations(userId: string, username?: string | null) {
	const [githubAccount, settings] = await Promise.all([
		db.query.account.findFirst({
			where: (table, { and, eq }) =>
				and(eq(table.userId, userId), eq(table.providerId, 'github'))
		}),
		db.query.userSettings.findFirst({
			where: (table, { eq }) => eq(table.userId, userId),
			columns: { githubUsername: true }
		})
	]);

	const loginCandidates = Array.from(
		new Set(
			[username, settings?.githubUsername]
				.map((value) => value?.trim())
				.filter((value): value is string => Boolean(value))
		)
	);
	const normalizedLoginCandidates = Array.from(
		new Set(loginCandidates.map((value) => value.toLowerCase()))
	);
	const githubAccountId = githubAccount?.accountId ? Number(githubAccount.accountId) : Number.NaN;

	if (!normalizedLoginCandidates.length && !Number.isSafeInteger(githubAccountId)) {
		return;
	}

	const loginClause =
		normalizedLoginCandidates.length === 1
			? sql`lower(${installations.githubLogin}) = ${normalizedLoginCandidates[0]}`
			: normalizedLoginCandidates.length > 1
				? or(
						...normalizedLoginCandidates.map(
							(login) => sql`lower(${installations.githubLogin}) = ${login}`
						)
					)
				: undefined;

	const ownershipClause = Number.isSafeInteger(githubAccountId)
		? loginClause
			? or(eq(installations.githubAccountId, githubAccountId), loginClause)
			: eq(installations.githubAccountId, githubAccountId)
		: loginClause;

	if (!ownershipClause) {
		return;
	}

	const ownedInstallations = await db
		.select({ id: installations.id })
		.from(installations)
		.where(ownershipClause);

	for (const installation of ownedInstallations) {
		await linkInstallationToUser(userId, installation.id);
	}
}

export async function requireInstallationAccess(installationId: string) {
	const user = requireUser();

	const installation = await db.query.installations.findFirst({
		where: (table, { eq }) => eq(table.id, installationId)
	});

	if (!installation) {
		error(404, 'Installation not found.');
	}

	await autoLinkPersonalInstallations(user.id, user.username);

	const link = await db.query.userInstallations.findFirst({
		where: (table, { and, eq }) =>
			and(eq(table.userId, user.id), eq(table.installationId, installationId))
	});

	if (!link) {
		error(403, 'You do not have access to this installation.');
	}

	return { user, installation };
}

export function requireTaskSecret(request: Request, expectedSecret?: string) {
	const authorization = request.headers.get('authorization');

	if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
		error(401, 'Unauthorized');
	}
}
