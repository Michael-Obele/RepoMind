import { relations } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { account, session, user, verification } from './auth.schema';

const defaultLabelSet = ['bug', 'feature', 'question', 'docs', 'security'] as const;

export const installations = pgTable(
	'installation',
	{
		id: text('id').primaryKey(),
		githubAccountId: integer('github_account_id').notNull(),
		githubLogin: text('github_login').notNull(),
		accountType: text('account_type').notNull(),
		repositoryCount: integer('repository_count').notNull().default(0),
		accessToken: text('access_token'),
		tokenExpiresAt: timestamp('token_expires_at'),
		suspendedAt: timestamp('suspended_at'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('installation_github_login_idx').on(table.githubLogin),
		index('installation_account_type_idx').on(table.accountType)
	]
);

export const appSettings = pgTable('app_settings', {
	id: text('id').primaryKey(),
	installationId: text('installation_id')
		.notNull()
		.unique()
		.references(() => installations.id, { onDelete: 'cascade' }),
	autoTriage: boolean('auto_triage').notNull().default(true),
	summarizePrs: boolean('summarize_prs').notNull().default(true),
	labelSet: jsonb('label_set')
		.$type<string[]>()
		.notNull()
		.default([...defaultLabelSet]),
	remindStaleIssues: boolean('remind_stale_issues').notNull().default(true),
	staleDaysThreshold: integer('stale_days_threshold').notNull().default(14),
	maintainerEmail: text('maintainer_email'),
	emailDigestHour: integer('email_digest_hour').notNull().default(0),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
});

export const webhookLogs = pgTable(
	'webhook_log',
	{
		id: text('id').primaryKey(),
		installationId: text('installation_id')
			.notNull()
			.references(() => installations.id, { onDelete: 'cascade' }),
		eventType: text('event_type').notNull(),
		action: text('action').notNull(),
		status: text('status').notNull(),
		repoFullName: text('repo_full_name').notNull(),
		resourceNumber: integer('resource_number'),
		resourceUrl: text('resource_url'),
		aiModel: text('ai_model'),
		tokensUsed: integer('tokens_used'),
		errorMessage: text('error_message'),
		durationMs: integer('duration_ms'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [
		index('webhook_log_installation_created_idx').on(table.installationId, table.createdAt),
		index('webhook_log_event_type_idx').on(table.eventType)
	]
);

export const userSettings = pgTable(
	'user_settings',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: 'cascade' }),
		streakReminders: boolean('streak_reminders').notNull().default(false),
		githubUsername: text('github_username'),
		reminderEmail: text('reminder_email'),
		timezone: text('timezone').notNull().default('UTC'),
		targetHour: integer('target_hour').notNull().default(20),
		lastCheckedDate: text('last_checked_date'),
		lastReminderSentDate: text('last_reminder_sent_date'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('user_settings_github_username_idx').on(table.githubUsername)]
);

export const installationRelations = relations(installations, ({ one, many }) => ({
	settings: one(appSettings, {
		fields: [installations.id],
		references: [appSettings.installationId]
	}),
	webhookLogs: many(webhookLogs)
}));

export const appSettingsRelations = relations(appSettings, ({ one }) => ({
	installation: one(installations, {
		fields: [appSettings.installationId],
		references: [installations.id]
	})
}));

export const webhookLogRelations = relations(webhookLogs, ({ one }) => ({
	installation: one(installations, {
		fields: [webhookLogs.installationId],
		references: [installations.id]
	})
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
	user: one(user, {
		fields: [userSettings.userId],
		references: [user.id]
	})
}));

export { account, session, user, verification };
