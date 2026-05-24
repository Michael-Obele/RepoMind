import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { installations } from '$lib/server/db/schema';
import * as v from 'valibot';

const setupQuerySchema = v.object({
	installationId: v.optional(v.pipe(v.string(), v.regex(/^\d+$/))),
	setupAction: v.optional(v.string())
});

export const load: PageServerLoad = async ({ url }) => {
	const parsedQuery = v.safeParse(setupQuerySchema, {
		installationId: url.searchParams.get('installation_id') ?? undefined,
		setupAction: url.searchParams.get('setup_action') ?? undefined
	});

	const installationId = parsedQuery.success ? parsedQuery.output.installationId ?? null : null;
	const setupAction = parsedQuery.success ? parsedQuery.output.setupAction ?? null : null;

	const installation = installationId
		? await db
			.select({
				id: installations.id,
				githubLogin: installations.githubLogin,
				accountType: installations.accountType,
				repositoryCount: installations.repositoryCount,
				suspendedAt: installations.suspendedAt
			})
			.from(installations)
			.where(eq(installations.id, installationId))
			.then((rows) => rows[0] ?? null)
		: null;

	return {
		installation,
		installationId,
		setupAction
	};
};