import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { appSettings, installations } from '$lib/server/db/schema';

interface InstallationAccount {
	id: number;
	login: string;
	type: string;
}

interface InstallationPayload {
	id: number;
	account: InstallationAccount;
	repository_selection?: string;
	single_file_name?: string | null;
	suspended_at?: string | null;
}

export async function upsertInstallation(payload: InstallationPayload, repositoryCount = 0) {
	await db
		.insert(installations)
		.values({
			id: String(payload.id),
			githubAccountId: payload.account.id,
			githubLogin: payload.account.login,
			accountType: payload.account.type,
			repositoryCount,
			suspendedAt: payload.suspended_at ? new Date(payload.suspended_at) : null
		})
		.onConflictDoUpdate({
			target: installations.id,
			set: {
				githubAccountId: payload.account.id,
				githubLogin: payload.account.login,
				accountType: payload.account.type,
				repositoryCount,
				suspendedAt: payload.suspended_at ? new Date(payload.suspended_at) : null,
				updatedAt: new Date()
			}
		});

	await db
		.insert(appSettings)
		.values({ id: crypto.randomUUID(), installationId: String(payload.id) })
		.onConflictDoNothing();
}

export async function markInstallationSuspended(installationId: string, suspendedAt: Date | null) {
	await db
		.update(installations)
		.set({ suspendedAt, updatedAt: new Date() })
		.where(eq(installations.id, installationId));
}

export async function deleteInstallation(installationId: string) {
	await db.delete(installations).where(eq(installations.id, installationId));
}

export async function updateInstallationRepositoryCount(
	installationId: string,
	repositoryCount: number
) {
	await db
		.update(installations)
		.set({ repositoryCount, updatedAt: new Date() })
		.where(eq(installations.id, installationId));
}
