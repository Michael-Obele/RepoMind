<script lang="ts">
	import { ArrowRight, BookOpen, BrainCog } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let { aiStatusText = 'AI ready' } = $props<{ aiStatusText?: string }>();

	const productLinks = [
		{ href: '/', label: 'Overview' },
		{ href: '/setup', label: 'Setup guide' },
		{ href: '/login', label: 'Dashboard access' }
	];

	const policyLinks = [
		{ href: '/privacy', label: 'Privacy' },
		{ href: '/terms', label: 'Terms' }
	];
</script>

<footer
	class="border-t border-border/70 bg-card/80 text-foreground backdrop-blur-sm dark:bg-[linear-gradient(180deg,rgba(9,12,24,0.76),rgba(5,7,15,0.98))]"
>
	<div class="mx-auto max-w-7xl px-4 py-12 md:px-8">
		<div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
			<div class="space-y-5">
				<div class="flex items-center gap-3">
					<div
						class="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/12 text-primary"
					>
						<BrainCog class="size-5" />
					</div>
					<div>
						<p class="text-xs tracking-[0.26em] text-primary uppercase">RepoMind</p>
						<p class="text-sm text-muted-foreground">Focused automation for GitHub maintainers</p>
					</div>
				</div>

				<p class="max-w-2xl text-sm leading-7 text-muted-foreground">
					Summaries for new pull requests, explainable issue triage, and reminder flows that stay
					narrow enough to audit.
				</p>

				<div class="flex flex-wrap gap-3 text-sm text-muted-foreground">
					<div class="rounded-full border border-border/70 bg-secondary/40 px-3 py-2">
						Webhook signatures verified
					</div>
					<div class="rounded-full border border-border/70 bg-secondary/40 px-3 py-2">
						Better Auth + Drizzle
					</div>
					<div class="rounded-full border border-border/70 bg-secondary/40 px-3 py-2">
						{aiStatusText}
					</div>
				</div>
			</div>

			<div class="rounded-[2rem] border border-primary/15 bg-primary/10 p-6 backdrop-blur-sm">
				<p class="text-sm font-medium text-foreground">Next step</p>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">
					Install the GitHub App, let the installation webhook provision settings, then configure
					summaries and reminders from the dashboard.
				</p>
				<div class="mt-5 flex flex-wrap gap-3">
					<Button href="https://github.com/apps/repo-mind/installations/new"
						>Install app<ArrowRight class="size-4" /></Button
					>
					<Button href="/setup" variant="outline">Read setup<BookOpen class="size-4" /></Button>
				</div>
			</div>
		</div>

		<Separator class="my-8 bg-border" />

		<div class="grid gap-6 md:grid-cols-3">
			<div>
				<p class="text-sm font-medium text-foreground">Product</p>
				<div class="mt-3 space-y-2 text-sm text-muted-foreground">
					{#each productLinks as link (link.href)}
						<a href={link.href} class="block transition-colors hover:text-foreground"
							>{link.label}</a
						>
					{/each}
				</div>
			</div>

			<div>
				<p class="text-sm font-medium text-foreground">Policies</p>
				<div class="mt-3 space-y-2 text-sm text-muted-foreground">
					{#each policyLinks as link (link.href)}
						<a href={link.href} class="block transition-colors hover:text-foreground"
							>{link.label}</a
						>
					{/each}
				</div>
			</div>
		</div>
	</div>
</footer>
