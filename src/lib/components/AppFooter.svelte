<script lang="ts">
	import { Bot, ExternalLink } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let { aiStatusText = 'AI ready' } = $props<{ aiStatusText?: string }>();
</script>

<footer class="mt-8 border-t border-white/10 bg-black/20 px-4 py-5 backdrop-blur-sm md:px-8">
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div class="flex items-center gap-3 text-sm text-zinc-300">
			<div class="rounded-2xl bg-primary/12 p-2 text-primary">
				<Bot class="size-4" />
			</div>
			<div>
				<p class="font-medium text-white">RepoMind dashboard</p>
				<p>Manage installs, reminders, and automation from one workspace. {aiStatusText}.</p>
			</div>
		</div>
		<div class="flex flex-wrap gap-3">
			<Button href="/privacy" variant="ghost">Privacy</Button>
			<Button href="/terms" variant="ghost">Terms</Button>
			<Button href="https://github.com/apps/repomind/installations/new" variant="outline">
				Install app
				<ExternalLink class="size-4" />
			</Button>
		</div>
	</div>
</footer>
