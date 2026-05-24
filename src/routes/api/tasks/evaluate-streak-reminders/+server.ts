import { json } from '@sveltejs/kit';
import { and, eq, isNotNull } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { userSettings } from '$lib/server/db/schema';
import { sendStreakReminder } from '$lib/server/email';
import { requireTaskSecret } from '$lib/server/session';

function getLocalDateParts(date: Date, timezone: string) {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		hour12: false
	}).formatToParts(date);

	const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';

	return {
		dateLabel: `${get('year')}-${get('month')}-${get('day')}`,
		hour: Number(get('hour'))
	};
}

async function hasCommittedToday(username: string, timezone: string) {
	const response = await fetch(`https://api.github.com/users/${username}/events/public`, {
		headers: {
			'User-Agent': 'RepoMind'
		}
	});

	if (!response.ok) {
		throw new Error(`GitHub public events returned ${response.status}`);
	}

	const events = (await response.json()) as Array<{ type: string; created_at: string }>;
	const today = getLocalDateParts(new Date(), timezone).dateLabel;

	return events.some(
		(event) =>
			event.type === 'PushEvent' &&
			getLocalDateParts(new Date(event.created_at), timezone).dateLabel === today
	);
}

export const POST = async ({ request }) => {
	requireTaskSecret(request, env.INTERNAL_TASK_SECRET);

	const configs = await db.query.userSettings.findMany({
		where: (table, { and, eq, isNotNull }) =>
			and(
				eq(table.streakReminders, true),
				isNotNull(table.githubUsername),
				isNotNull(table.reminderEmail)
			)
	});

	const results = {
		checked: 0,
		emailed: 0,
		skipped: 0,
		errors: [] as string[]
	};

	for (const config of configs) {
		const { dateLabel, hour } = getLocalDateParts(new Date(), config.timezone);

		if (hour !== config.targetHour || config.lastReminderSentDate === dateLabel) {
			results.skipped += 1;
			continue;
		}

		results.checked += 1;

		try {
			const committed = await hasCommittedToday(config.githubUsername ?? '', config.timezone);

			if (!committed) {
				await sendStreakReminder({
					to: config.reminderEmail ?? '',
					githubUsername: config.githubUsername ?? '',
					dateLabel
				});

				results.emailed += 1;
			}

			await db
				.update(userSettings)
				.set({
					lastCheckedDate: dateLabel,
					lastReminderSentDate: committed ? config.lastReminderSentDate : dateLabel,
					updatedAt: new Date()
				})
				.where(eq(userSettings.id, config.id));
		} catch (error) {
			results.errors.push(
				`${config.githubUsername}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	return json(results);
};
