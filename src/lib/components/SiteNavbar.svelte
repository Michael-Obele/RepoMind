<script lang="ts">
	import { ArrowRight, BookOpen, Bot, Mail, Menu, Sparkles } from '@lucide/svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { cn } from '$lib/utils.js';

	let { currentPath } = $props<{ currentPath: string }>();

	const links = [
		{ href: '/', label: 'Overview' },
		{ href: '/setup', label: 'Setup' },
		{ href: '/privacy', label: 'Privacy' },
		{ href: '/terms', label: 'Terms' }
	];

	const authHref = $derived(currentPath === '/login' ? '/dashboard' : '/login');
	const authLabel = $derived(currentPath === '/login' ? 'Open dashboard' : 'Log in');
</script>

<header class="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
	<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
		<a href="/" class="flex min-w-0 items-center gap-3">
			<div
				class="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/12 text-primary shadow-lg shadow-primary/10"
			>
				<Bot class="size-5" />
			</div>
			<div class="min-w-0">
				<p class="text-xs tracking-[0.26em] text-primary uppercase">RepoMind</p>
				<p class="truncate text-sm text-muted-foreground">GitHub automation for maintainers</p>
			</div>
		</a>

		<nav class="hidden items-center gap-2 md:flex">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class={cn(
						'rounded-full px-4 py-2 text-sm transition-colors',
						currentPath === link.href
							? 'bg-primary text-primary-foreground shadow-lg shadow-primary/15'
							: 'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground'
					)}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="hidden items-center gap-3 md:flex">
			<div
				class="rounded-full border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground"
			>
				<span class="inline-flex items-center gap-2">
					<Sparkles class="size-4 text-primary" />
					PR summaries, triage, reminders
				</span>
			</div>
			<ThemeToggle />
			<Button href="https://github.com/apps/repo-mind/installations/new" variant="outline"
				>Install app</Button
			>
			<Button href={authHref}>{authLabel}<ArrowRight class="size-4" /></Button>
		</div>

		<div class="flex items-center gap-2 md:hidden">
			<ThemeToggle />
			<Sheet.Root>
				<Sheet.Trigger
					class={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'md:hidden')}
					aria-label="Open navigation"
				>
					<Menu class="size-5" />
				</Sheet.Trigger>
				<Sheet.Content
					side="right"
					class="w-88 border-l border-border bg-popover/95 px-0 text-popover-foreground"
				>
					<Sheet.Header class="border-b border-border px-5 pb-4">
						<Sheet.Title class="flex items-center gap-3 text-lg">
							<div
								class="flex size-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/12 text-primary"
							>
								<Bot class="size-5" />
							</div>
							RepoMind
						</Sheet.Title>
						<Sheet.Description class="text-sm text-muted-foreground">
							Navigate the public product surfaces and jump into the dashboard.
						</Sheet.Description>
					</Sheet.Header>

					<div class="space-y-6 px-5 py-6">
						<nav class="space-y-2">
							{#each links as link (link.href)}
								<a
									href={link.href}
									class={cn(
										'flex items-center justify-between rounded-3xl border px-4 py-3 text-sm transition-colors',
										currentPath === link.href
											? 'border-primary/25 bg-primary text-primary-foreground shadow-lg shadow-primary/15'
											: 'border-border/70 bg-card/70 text-foreground hover:border-primary/20 hover:bg-accent/80'
									)}
								>
									<span>{link.label}</span>
									<ArrowRight class="size-4" />
								</a>
							{/each}
						</nav>

						<div class="grid gap-3">
							<ThemeToggle class="w-full" />
							<Button href={authHref} class="w-full justify-between"
								>{authLabel}<ArrowRight class="size-4" /></Button
							>
							<Button
								href="https://github.com/apps/repo-mind/installations/new"
								variant="outline"
								class="w-full justify-between">Install on GitHub<BookOpen class="size-4" /></Button
							>
							<Button
								href="mailto:hello@repomind.app"
								variant="ghost"
								class="w-full justify-between">Contact<Mail class="size-4" /></Button
							>
						</div>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</header>
