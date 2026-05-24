import { db } from '$lib/server/db';
import { webhookLogs } from '$lib/server/db/schema';

interface WebhookLogInput {
	installationId: string;
	eventType: string;
	action: string;
	status: 'success' | 'error' | 'skipped';
	repoFullName: string;
	resourceNumber?: number | null;
	resourceUrl?: string | null;
	aiModel?: string | null;
	tokensUsed?: number | null;
	errorMessage?: string | null;
	durationMs?: number | null;
}

export async function createWebhookLog(input: WebhookLogInput) {
	await db.insert(webhookLogs).values({
		id: crypto.randomUUID(),
		installationId: input.installationId,
		eventType: input.eventType,
		action: input.action,
		status: input.status,
		repoFullName: input.repoFullName,
		resourceNumber: input.resourceNumber ?? null,
		resourceUrl: input.resourceUrl ?? null,
		aiModel: input.aiModel ?? null,
		tokensUsed: input.tokensUsed ?? null,
		errorMessage: input.errorMessage ?? null,
		durationMs: input.durationMs ?? null
	});
}
