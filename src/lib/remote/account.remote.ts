import { command, query } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import { userSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/session';
import { hasGitHubOAuthConfig } from '$lib/server/auth';

const userSettingsSchema = v.object({
	streakReminders: v.boolean(),
	githubUsername: v.optional(v.union([v.string(), v.null()]), null),
	reminderEmail: v.optional(v.union([v.string(), v.null()]), null),
	timezone: v.string(),
	targetHour: v.pipe(v.number(), v.minValue(0), v.maxValue(23))
});

export const getAccountSettings = query(async () => {
	const currentUser = requireUser();

	const settings = await db.query.userSettings.findFirst({
		where: (table, { eq }) => eq(table.userId, currentUser.id)
	});

	return {
		user: currentUser,
		settings,
		hasGitHubOAuth: hasGitHubOAuthConfig()
	};
});

export const updateAccountSettings = command(userSettingsSchema, async (input) => {
	const currentUser = requireUser();

	await db
		.insert(userSettings)
		.values({
			id: crypto.randomUUID(),
			userId: currentUser.id,
			streakReminders: input.streakReminders,
			githubUsername: input.githubUsername ?? null,
			reminderEmail: input.reminderEmail ?? null,
			timezone: input.timezone,
			targetHour: input.targetHour
		})
		.onConflictDoUpdate({
			target: userSettings.userId,
			set: {
				streakReminders: input.streakReminders,
				githubUsername: input.githubUsername ?? null,
				reminderEmail: input.reminderEmail ?? null,
				timezone: input.timezone,
				targetHour: input.targetHour,
				updatedAt: new Date()
			}
		});
});
