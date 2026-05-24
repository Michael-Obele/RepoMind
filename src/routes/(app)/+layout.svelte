<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import AppNavbar from '$lib/components/AppNavbar.svelte';
	import AppSidebar from '$lib/components/AppSidebar.svelte';

	let { data, children } = $props<{
		data: {
			user: {
				name?: string | null;
				email: string;
				username?: string | null;
			};
			aiProvider: {
				badgeText: string;
				statusText: string;
			};
		};
		children: () => unknown;
	}>();
</script>

<div
	class="dark min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_28%),linear-gradient(180deg,#0b1120_0%,#09090b_100%)] text-foreground"
>
	<Sidebar.Provider>
		<AppSidebar user={data.user} />
		<Sidebar.Inset class="flex min-h-screen flex-col bg-transparent">
			<AppNavbar badgeText={data.aiProvider.badgeText} />

			<main class="flex-1 px-4 py-6 md:px-8 md:py-8">
				{@render children()}
			</main>

			<AppFooter aiStatusText={data.aiProvider.statusText} />
		</Sidebar.Inset>
	</Sidebar.Provider>
</div>
