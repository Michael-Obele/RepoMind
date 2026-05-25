<script lang="ts">
	import { Sparkles } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { badgeText = 'AI-ready workflow assistant' } = $props<{ badgeText?: string }>();
</script>

<header
	class="sticky top-0 z-20 border-b border-border/70 bg-background/60 px-4 py-3 backdrop-blur md:px-8"
>
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<Sidebar.Trigger />
			<div>
				<p class="text-xs tracking-[0.24em] text-primary uppercase">RepoMind</p>
				<p class="text-sm text-muted-foreground">
					GitHub maintainer automation, triage, and reminders
				</p>
			</div>
		</div>
		<div class="hidden items-center gap-3 md:flex">
			<div
				class="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-2 text-sm text-muted-foreground"
			>
				<Sparkles class="size-4 text-primary" />
				<span>{badgeText}</span>
			</div>
			<Button href="/account" variant="outline">Account</Button>
		</div>
	</div>
</header>
