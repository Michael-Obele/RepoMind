<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<section class="mx-auto max-w-5xl space-y-8 px-4 py-12 md:px-8">
	<div class="rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-xl shadow-black/5">
		<p class="text-xs uppercase tracking-[0.24em] text-primary">Setup</p>
		<h1 class="mt-3 font-heading text-4xl tracking-tight">Finish connecting RepoMind</h1>
		<p class="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">This page is the post-install landing area for your GitHub App. Once the installation webhook lands, RepoMind creates default settings for the new account and the dashboard surfaces them immediately.</p>
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

	<Button href="/dashboard">Go to dashboard</Button>
</section>