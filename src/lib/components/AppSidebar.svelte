<script lang="ts">
	import { page } from '$app/state';
	import { Bell, Bot, LayoutDashboard, Settings, UserRound, Webhook } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { user } = $props<{
		user: {
			name?: string | null;
			email: string;
			username?: string | null;
		};
	}>();

	const items = [
		{ label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'Automation', href: '/dashboard', icon: Webhook },
		{ label: 'Reminders', href: '/account', icon: Bell },
		{ label: 'Account', href: '/account', icon: UserRound }
	];

	let currentPath = $derived(page.url.pathname);
</script>

<Sidebar.Root
	variant="inset"
	collapsible="icon"
	class="border-r border-sidebar-border/70 bg-sidebar/95"
>
	<Sidebar.Header class="px-2 pt-4">
		<div class="rounded-3xl border border-sidebar-border/70 bg-sidebar-accent/60 px-3 py-3">
			<div class="flex items-center gap-3">
				<div class="rounded-2xl bg-primary/12 p-2 text-primary">
					<Bot class="size-5" />
				</div>
				<div class="min-w-0 group-data-[collapsible=icon]:hidden">
					<p class="font-heading text-base font-semibold tracking-tight">RepoMind</p>
					<p class="text-xs text-muted-foreground">Maintainer automation cockpit</p>
				</div>
			</div>
		</div>
	</Sidebar.Header>

	<Sidebar.Content class="px-2 py-4">
		<Sidebar.Group>
			<Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.href + item.label)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={currentPath === item.href || currentPath.startsWith(`${item.href}/`)}
								tooltipContent={item.label}
							>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
			<Sidebar.GroupLabel>What runs here</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<div
					class="space-y-2 rounded-3xl border border-sidebar-border/70 bg-sidebar-accent/40 p-3 text-xs text-muted-foreground"
				>
					<div class="flex items-center gap-2 text-foreground">
						<Webhook class="size-4 text-primary" />
						<span>GitHub webhook receiver</span>
					</div>
					<div class="flex items-center gap-2 text-foreground">
						<Bell class="size-4 text-primary" />
						<span>Stale issue and streak reminders</span>
					</div>
					<div class="flex items-center gap-2 text-foreground">
						<Settings class="size-4 text-primary" />
						<span>Per-installation AI controls</span>
					</div>
				</div>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="px-2 pb-4">
		<div
			class="rounded-3xl border border-sidebar-border/70 bg-sidebar-accent/50 px-3 py-3 group-data-[collapsible=icon]:hidden"
		>
			<p class="truncate text-sm font-medium">{user.name ?? user.username ?? 'RepoMind user'}</p>
			<p class="truncate text-xs text-muted-foreground">{user.email}</p>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
