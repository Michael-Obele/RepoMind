<script lang="ts">
	import { Bell, ChartColumn, Shield, Webhook } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { getDashboardOverview } from '$lib/remote';

	const overview = await getDashboardOverview();

	const metricCards = [
		{ label: 'Installations', value: overview.metrics.installations, icon: Shield },
		{ label: 'Active installs', value: overview.metrics.activeInstallations, icon: Webhook },
		{ label: 'Repositories', value: overview.metrics.repositories, icon: ChartColumn },
		{ label: 'Logged events', value: overview.metrics.loggedEvents, icon: Bell }
	];
</script>

<section class="space-y-8">
	<div class="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
		<div
			class="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-md md:p-8"
		>
			<p class="text-xs tracking-[0.28em] text-primary uppercase">Control center</p>
			<h1
				class="mt-4 max-w-xl font-heading text-4xl font-semibold tracking-tight text-white md:text-5xl"
			>
				Keep GitHub maintenance moving without turning your dashboard into a second job.
			</h1>
			<p class="mt-4 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
				Review webhook activity, inspect every connected installation, and tune automation for
				summaries, triage, and reminders from one surface.
			</p>
			<div class="mt-6 flex flex-wrap gap-3">
				<Button href="https://github.com/apps/repo-mind/installations/new">Install on GitHub</Button
				>
				<Button href="/account" variant="outline">Manage reminders</Button>
			</div>
		</div>

		<Card
			class="rounded-[2rem] border border-white/10 bg-black/30 text-white shadow-xl shadow-black/20 backdrop-blur-sm"
		>
			<CardHeader>
				<CardTitle class="text-lg">What the app does</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4 text-sm text-zinc-300">
				<div class="rounded-3xl border border-white/10 bg-white/5 p-4">
					<p class="font-medium text-white">PR summaries</p>
					<p class="mt-1">Posts an architectural review summary when a pull request opens.</p>
				</div>
				<div class="rounded-3xl border border-white/10 bg-white/5 p-4">
					<p class="font-medium text-white">Issue triage</p>
					<p class="mt-1">Applies labels like bug, feature, docs, security, and question.</p>
				</div>
				<div class="rounded-3xl border border-white/10 bg-white/5 p-4">
					<p class="font-medium text-white">Reminders</p>
					<p class="mt-1">Sends stale issue digests and personal streak alerts on schedule.</p>
				</div>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		{#each metricCards as metric (metric.label)}
			<Card
				class="rounded-[1.75rem] border border-white/10 bg-white/5 shadow-lg shadow-black/10 backdrop-blur-sm"
			>
				<CardContent class="flex items-center justify-between p-5">
					<div>
						<p class="text-sm text-muted-foreground">{metric.label}</p>
						<p class="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
					</div>
					<div class="rounded-2xl bg-primary/12 p-3 text-primary">
						<metric.icon class="size-5" />
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<div class="space-y-4">
		<div class="flex items-center justify-between gap-3">
			<div>
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Installations</p>
				<h2 class="mt-2 font-heading text-2xl text-white">Connected accounts</h2>
			</div>
			<Badge class="border border-white/10 bg-white/5 text-white"
				>{overview.installations.length} total</Badge
			>
		</div>

		<div class="grid gap-4 xl:grid-cols-2">
			{#each overview.installations as installation (installation.id)}
				<Card
					class="rounded-[1.75rem] border border-white/10 bg-white/5 shadow-lg shadow-black/10 backdrop-blur-sm"
				>
					<CardHeader class="space-y-4">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div>
								<CardTitle class="text-xl text-white">{installation.githubLogin}</CardTitle>
								<p class="mt-1 text-sm text-zinc-300">
									{installation.accountType} account with {installation.repositoryCount} repositories
									connected
								</p>
							</div>
							<Badge
								class={installation.suspendedAt
									? 'bg-amber-500/10 text-amber-300'
									: 'bg-emerald-500/10 text-emerald-300'}
							>
								{installation.suspendedAt ? 'Suspended' : 'Active'}
							</Badge>
						</div>
						<div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
							<Badge
								class={installation.autoTriage
									? 'bg-primary/10 text-primary'
									: 'bg-white/5 text-zinc-300'}>Issue triage</Badge
							>
							<Badge
								class={installation.summarizePrs
									? 'bg-primary/10 text-primary'
									: 'bg-white/5 text-zinc-300'}>PR summaries</Badge
							>
							<Badge
								class={installation.remindStaleIssues
									? 'bg-primary/10 text-primary'
									: 'bg-white/5 text-zinc-300'}>Stale digests</Badge
							>
						</div>
					</CardHeader>
					<CardContent class="flex flex-wrap items-center justify-between gap-3 pt-0">
						<p class="text-sm text-zinc-300">
							{installation.totalLogs} logged event{installation.totalLogs === 1 ? '' : 's'} so far
						</p>
						<div class="flex flex-wrap gap-2">
							<Button href={`/dashboard/${installation.id}`} variant="secondary"
								>View activity</Button
							>
							<Button href={`/dashboard/${installation.id}/settings`} variant="outline"
								>Configure</Button
							>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>
