<script lang="ts">
	import { AlertTriangle, CheckCircle2, MinusCircle } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Table from '$lib/components/ui/table/index.js';

	interface LogEntry {
		id: string;
		eventType: string;
		action: string;
		status: 'success' | 'error' | 'skipped' | string;
		repoFullName: string;
		resourceNumber?: number | null;
		resourceUrl?: string | null;
		errorMessage?: string | null;
		createdAt: string | Date;
	}

	let { logs } = $props<{ logs: LogEntry[] }>();

	const statusConfig = {
		success: {
			icon: CheckCircle2,
			className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
		},
		error: { icon: AlertTriangle, className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
		skipped: { icon: MinusCircle, className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' }
	} as const;

	function getStatusConfig(status: string) {
		if (status in statusConfig) {
			return statusConfig[status as keyof typeof statusConfig];
		}

		return statusConfig.skipped;
	}

	function formatTimestamp(value: string | Date) {
		return new Date(value).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="overflow-hidden rounded-3xl border border-border/70 bg-card/80 backdrop-blur-sm">
	<Table.Root>
		<Table.Header>
			<Table.Row class="border-border/70">
				<Table.Head>Event</Table.Head>
				<Table.Head>Repository</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head class="text-right">When</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each logs as log (log.id)}
				{@const config = getStatusConfig(log.status)}
				<Table.Row class="border-border/60">
					<Table.Cell>
						<p class="font-medium">{log.eventType}</p>
						<p class="text-xs text-muted-foreground">{log.action}</p>
					</Table.Cell>
					<Table.Cell>
						<div class="space-y-1">
							<p>{log.repoFullName}</p>
							{#if log.resourceUrl}
								<a
									class="text-xs text-primary underline-offset-4 hover:underline"
									href={log.resourceUrl}
									target="_blank"
									rel="noreferrer"
								>
									Open #{log.resourceNumber}
								</a>
							{/if}
						</div>
					</Table.Cell>
					<Table.Cell>
						<Badge class={config.className}>
							<config.icon class="mr-1 size-3.5" />
							{log.status}
						</Badge>
						{#if log.errorMessage}
							<p class="mt-1 text-xs text-muted-foreground">{log.errorMessage}</p>
						{/if}
					</Table.Cell>
					<Table.Cell class="text-right text-sm text-muted-foreground"
						>{formatTimestamp(log.createdAt)}</Table.Cell
					>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
