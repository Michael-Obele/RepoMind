<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import ActivityLog from '$lib/components/dashboard/ActivityLog.svelte';
	import { getInstallationDetail } from '$lib/remote';

	type InstallationDetail = Awaited<ReturnType<typeof getInstallationDetail>>;

	let pageProps = $props<{ params: { id: string } }>();
	let detail = $state<InstallationDetail | null>(null);

	$effect(() => {
		void (async () => {
			detail = await getInstallationDetail(pageProps.params.id);
		})();
	});
</script>

{#if !detail}
	<section
		class="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white shadow-xl shadow-black/10 backdrop-blur-sm"
	>
		<h1 class="font-heading text-3xl">Loading installation</h1>
		<p class="mt-3 text-zinc-300">
			RepoMind is hydrating the installation detail and recent activity.
		</p>
	</section>
{:else if !detail.installation}
	<section
		class="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white shadow-xl shadow-black/10 backdrop-blur-sm"
	>
		<h1 class="font-heading text-3xl">Installation not found</h1>
		<p class="mt-3 text-zinc-300">
			This installation is not in the local RepoMind database yet. Install the GitHub App and wait
			for the webhook sync.
		</p>
		<div class="mt-6">
			<Button href="/dashboard">Back to dashboard</Button>
		</div>
	</section>
{:else}
	<section class="space-y-6">
		<div
			class="flex flex-wrap items-end justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-sm"
		>
			<div>
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Installation detail</p>
				<h1 class="mt-3 font-heading text-4xl text-white">{detail.installation.githubLogin}</h1>
				<p class="mt-3 max-w-2xl text-zinc-300">
					{detail.installation.accountType} account with {detail.installation.repositoryCount} repositories
					connected. Use the settings page to tune AI behavior and reminder cadence.
				</p>
			</div>
			<div class="flex gap-2">
				<Button href={`/dashboard/${pageProps.params.id}/settings`}>Open settings</Button>
				<Button href="/dashboard" variant="outline">All installations</Button>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-3">
			<Card class="rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-sm">
				<CardHeader>
					<CardTitle class="text-white">Repository count</CardTitle>
				</CardHeader>
				<CardContent class="text-3xl font-semibold text-white"
					>{detail.installation.repositoryCount}</CardContent
				>
			</Card>
			<Card class="rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-sm">
				<CardHeader>
					<CardTitle class="text-white">PR summaries</CardTitle>
				</CardHeader>
				<CardContent class="text-lg text-zinc-200"
					>{detail.installation.settings?.summarizePrs ? 'Enabled' : 'Disabled'}</CardContent
				>
			</Card>
			<Card class="rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-sm">
				<CardHeader>
					<CardTitle class="text-white">Stale reminders</CardTitle>
				</CardHeader>
				<CardContent class="text-lg text-zinc-200"
					>{detail.installation.settings?.remindStaleIssues ? 'Enabled' : 'Disabled'}</CardContent
				>
			</Card>
		</div>

		<div class="space-y-3">
			<div>
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Recent activity</p>
				<h2 class="mt-2 font-heading text-2xl text-white">Webhook history</h2>
			</div>
			<ActivityLog logs={detail.logs} />
		</div>
	</section>
{/if}
