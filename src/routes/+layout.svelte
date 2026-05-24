<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteNavbar from '$lib/components/SiteNavbar.svelte';

	let { children, data } = $props<{
		children: () => unknown;
		data: {
			aiProvider: {
				badgeText: string;
				statusText: string;
			};
		};
	}>();

	const hidePublicChromePrefixes = ['/account', '/dashboard'];
	const showPublicChrome = $derived(
		!hidePublicChromePrefixes.some((prefix) => page.url.pathname.startsWith(prefix))
	);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if showPublicChrome}
	<div class="flex min-h-screen flex-col bg-background">
		<SiteNavbar currentPath={page.url.pathname} />
		<main class="min-h-screen flex-1">{@render children()}</main>
		<SiteFooter aiStatusText={data.aiProvider.statusText} />
	</div>
{:else}
	{@render children()}
{/if}
