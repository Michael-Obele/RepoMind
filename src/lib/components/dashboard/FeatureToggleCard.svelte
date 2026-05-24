<script lang="ts">
	import type { Component } from 'svelte';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';

	let {
		title,
		description,
		icon: Icon,
		checked = $bindable(false)
	} = $props<{
		title: string;
		description: string;
		icon: Component;
		checked?: boolean;
	}>();
</script>

<Card class="rounded-4xl border border-border/70 bg-card/90 shadow-sm backdrop-blur-sm">
	<CardHeader class="flex flex-row items-start justify-between gap-4">
		<div class="space-y-3">
			<div class="inline-flex rounded-2xl bg-primary/10 p-2 text-primary">
				<Icon class="size-5" />
			</div>
			<div>
				<CardTitle class="text-base">{title}</CardTitle>
				<CardDescription class="mt-1 max-w-md text-sm leading-6">{description}</CardDescription>
			</div>
		</div>
		<Switch bind:checked />
	</CardHeader>
</Card>
