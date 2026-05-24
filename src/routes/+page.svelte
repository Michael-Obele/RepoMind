<script lang="ts">
	import { Bell, Bot, Shield, Sparkles, Webhook } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';

	let { data } = $props<{
		data: {
			aiProvider: {
				statusText: string;
			};
		};
	}>();

	const features = [
		{
			title: 'AI PR summaries',
			description: 'Posts a concise architectural overview the moment a pull request opens.',
			icon: Sparkles
		},
		{
			title: 'Issue triage',
			description: 'Turns raw incoming issues into labeled work with explainable confidence.',
			icon: Webhook
		},
		{
			title: 'Reminder engine',
			description:
				'Delivers stale issue digests and commit streak reminders before work goes stale.',
			icon: Bell
		}
	];
</script>

<section
	class="overflow-hidden bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)]"
>
	<div class="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
		<div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
			<div>
				<Badge class="border border-primary/15 bg-primary/8 text-primary"
					>GitHub Developer Program candidate</Badge
				>
				<h1
					class="mt-6 max-w-4xl font-heading text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl"
				>
					A focused GitHub App for teams buried under open issues and unread pull requests.
				</h1>
				<p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
					RepoMind keeps repositories moving by summarizing pull requests, auto-triaging issues, and
					nudging maintainers before work or streaks quietly die.
				</p>
				<div class="mt-8 flex flex-wrap gap-3">
					<Button href="/login">Open the dashboard</Button>
					<Button href="https://github.com/apps/repo-mind/installations/new" variant="outline"
						>Install on GitHub</Button
					>
				</div>
				<div class="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
					<div class="flex items-center gap-2">
						<Shield class="size-4 text-primary" /> Verified webhook signatures
					</div>
					<div class="flex items-center gap-2">
						<Bot class="size-4 text-primary" />
						{data.aiProvider.statusText}
					</div>
					<div class="flex items-center gap-2">
						<Webhook class="size-4 text-primary" /> Installation-level controls
					</div>
				</div>
			</div>

			<div
				class="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-2xl shadow-indigo-100 backdrop-blur-sm md:p-8"
			>
				<div class="grid gap-4">
					<Card
						class="rounded-[1.5rem] border border-slate-200/70 bg-slate-950 text-white shadow-none"
					>
						<CardHeader>
							<CardTitle class="text-xl">Why it exists</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3 text-sm text-zinc-300">
							<p>
								Maintainers burn time parsing PRs, sorting unlabeled issues, and remembering which
								work needs a nudge.
							</p>
							<p>
								RepoMind narrows its scope to those three jobs and keeps configuration shallow
								enough that an install can be useful immediately.
							</p>
						</CardContent>
					</Card>
					<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
						{#each features as feature (feature.title)}
							<div class="rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-sm">
								<div class="inline-flex rounded-2xl bg-primary/10 p-2 text-primary">
									<feature.icon class="size-5" />
								</div>
								<p class="mt-4 font-medium text-slate-900">{feature.title}</p>
								<p class="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="mt-16 grid gap-4 md:grid-cols-3">
			<div
				class="rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-sm"
			>
				<p class="font-medium text-slate-900">Production app shape</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					SvelteKit 5, Better Auth, Drizzle, Octokit, Resend, and AI providers are wired for the
					full plan.
				</p>
			</div>
			<div
				class="rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-sm"
			>
				<p class="font-medium text-slate-900">Marketplace-ready surfaces</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					Landing, privacy, terms, setup, dashboard, automation settings, and audit logs are all
					part of the app shell.
				</p>
			</div>
			<div
				class="rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-sm"
			>
				<p class="font-medium text-slate-900">Maintainer-first constraints</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					RepoMind stays opinionated, lightweight, and focused on zero-config value for open-source
					projects.
				</p>
			</div>
		</div>
	</div>
</section>
