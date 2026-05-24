<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	type SetupInstallation = {
		id: string;
		githubLogin: string;
		accountType: string;
		repositoryCount: number;
		suspendedAt: string | Date | null;
	};

	type SetupPageData = {
		installation: SetupInstallation | null;
		installationId: string | null;
		setupAction: string | null;
	};

	let { data } = $props<{ data: SetupPageData }>();

	const dashboardHref = $derived(data.installation ? `/dashboard/${data.installation.id}` : '/dashboard');
	const setupLabel = $derived(data.setupAction ? data.setupAction.replace(/_/g, ' ') : 'install');
</script>

<section class="mx-auto max-w-5xl space-y-8 px-4 py-12 md:px-8">
	<div class="rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-xl shadow-black/5">
		<p class="text-xs uppercase tracking-[0.24em] text-primary">Setup</p>
		<h1 class="mt-3 font-heading text-4xl tracking-tight">Finish connecting RepoMind</h1>
		<p class="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
			This page handles GitHub's post-install redirect, including the `installation_id` and
			`setup_action` query parameters. RepoMind uses them to show the next step while the webhook
			sync catches up.
		</p>
		{#if data.installationId}
			<div class="mt-5 flex flex-wrap items-center gap-2">
				<Badge class="bg-primary/10 text-primary">Installation {data.installationId}</Badge>
				<Badge variant="outline" class="border-border/70 text-muted-foreground">
					Setup action: {setupLabel}
				</Badge>
			</div>
		{/if}
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		<div class="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-lg shadow-black/5">
			<p class="font-medium">1. Verify environment</p>
			<p class="mt-2 text-sm text-muted-foreground">Make sure GitHub App secrets, Better Auth values, database credentials, and mail credentials are present.</p>
		</div>
		<div class="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-lg shadow-black/5">
			<p class="font-medium">2. Deliver webhooks</p>
			<p class="mt-2 text-sm text-muted-foreground">GitHub should deliver <code>installation</code>, <code>issues</code>, and <code>pull_request</code> events to the webhook route.</p>
		</div>
		<div class="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-lg shadow-black/5">
			<p class="font-medium">3. Tune automation</p>
			<p class="mt-2 text-sm text-muted-foreground">Open the dashboard to toggle summaries, triage, stale issue digests, and commit streak reminders.</p>
		</div>
	</div>

	{#if data.installation}
		<div class="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 p-8 shadow-xl shadow-black/5">
			<p class="text-xs uppercase tracking-[0.24em] text-emerald-300">Installation ready</p>
			<h2 class="mt-3 font-heading text-3xl tracking-tight text-white">
				RepoMind found installation {data.installation.id}
			</h2>
			<p class="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">
				GitHub has already delivered the installation record for @{data.installation.githubLogin}.
				You can open the installation dashboard now, or wait for the webhook sync to finish if the
				app is still warming up.
			</p>
			<div class="mt-6 flex flex-wrap gap-3">
				<Button href={dashboardHref}>Open installation dashboard</Button>
				<Button href="/dashboard" variant="outline">Back to overview</Button>
			</div>
		</div>
	{:else if data.installationId}
		<div class="rounded-[2rem] border border-amber-500/20 bg-amber-500/5 p-8 shadow-xl shadow-black/5">
			<p class="text-xs uppercase tracking-[0.24em] text-amber-300">Waiting on sync</p>
			<h2 class="mt-3 font-heading text-3xl tracking-tight text-white">
				We received the installation redirect
			</h2>
			<p class="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">
				GitHub sent installation {data.installationId}, but RepoMind has not synced it into the
				local database yet. That usually means the webhook is still in flight.
			</p>
			<div class="mt-6 flex flex-wrap gap-3">
				<Button href="/dashboard">Go to dashboard</Button>
				<Button href="/setup" variant="outline">Reload setup page</Button>
			</div>
		</div>
	{/if}

	<div class="flex flex-wrap gap-3">
		<Button href={dashboardHref}>Go to dashboard</Button>
		<Button href="/" variant="outline">Back to home</Button>
	</div>
</section>