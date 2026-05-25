<script lang="ts">
	import { ArrowRight, Clock3, GitBranch, ShieldCheck, Webhook, Workflow } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	type SetupInstallation = {
		id: string;
		githubLogin: string;
		accountType: string;
		repositoryCount: number;
		suspendedAt: string | Date | null;
	};

	type SetupPageData = {
		installation: SetupInstallation | null;
		installationId: string | null;
		setupAction: string | null;
	};

	let { data } = $props<{ data: SetupPageData }>();

	const dashboardHref = $derived(
		data.installation ? `/dashboard/${data.installation.id}` : '/dashboard'
	);
	const setupLabel = $derived(data.setupAction ? data.setupAction.replace(/_/g, ' ') : 'install');

	const setupSteps = [
		{
			title: 'Install the GitHub App',
			description:
				'GitHub redirects here with installation context so RepoMind can confirm the account and hand off to the dashboard.',
			icon: GitBranch
		},
		{
			title: 'Wait for webhook confirmation',
			description:
				'RepoMind verifies the installation webhook, records the install, and prepares the installation-specific dashboard state.',
			icon: Webhook
		},
		{
			title: 'Tune the narrow automations',
			description:
				'After the sync finishes, configure PR summaries, issue triage, stale digests, and streak reminders per installation.',
			icon: Workflow
		}
	];

	const setupSignals = [
		{
			title: 'Redirect-aware',
			description:
				'The page uses GitHub installation redirect parameters to show the next likely step.',
			icon: ShieldCheck
		},
		{
			title: 'Calm waiting state',
			description:
				'If the database record is not ready yet, the page explains that webhook delivery may still be in flight.',
			icon: Clock3
		},
		{
			title: 'Installation-specific handoff',
			description:
				'Once available, the next CTA points directly to the installation dashboard instead of a generic landing page.',
			icon: ArrowRight
		}
	];
</script>

<section class="overflow-hidden">
	<div class="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
		<div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
			<div>
				<Badge class="border border-primary/15 bg-primary/8 text-primary">Setup handoff</Badge>
				<h1
					class="mt-6 max-w-4xl font-heading text-4xl font-semibold tracking-tight text-foreground md:text-6xl"
				>
					{#if data.installation}
						Installation connected and ready for dashboard tuning.
					{:else if data.installationId}
						GitHub redirected correctly. RepoMind is waiting for the installation sync.
					{:else}
						Finish connecting RepoMind after the GitHub App install.
					{/if}
				</h1>
				<p class="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
					This page receives GitHub's post-install redirect and turns it into a clear next step.
					RepoMind uses the installation context here while webhook delivery and installation state
					settle.
				</p>

				{#if data.installationId}
					<div class="mt-6 flex flex-wrap gap-2">
						<Badge class="border border-primary/15 bg-primary/10 text-primary">
							Installation {data.installationId}
						</Badge>
						<Badge variant="outline" class="border-border/70 text-muted-foreground">
							Setup action: {setupLabel}
						</Badge>
						{#if data.installation}
							<Badge variant="outline" class="border-border/70 text-muted-foreground">
								@{data.installation.githubLogin}
							</Badge>
						{/if}
					</div>
				{/if}

				<div class="mt-8 flex flex-wrap gap-3">
					<Button href={dashboardHref}>
						Open dashboard
						<ArrowRight class="size-4" />
					</Button>
					<Button href="https://github.com/apps/repo-mind/installations/new" variant="outline">
						Install on GitHub
					</Button>
				</div>
			</div>

			<div
				class="rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-2xl shadow-black/15 backdrop-blur-md md:p-8"
			>
				<p class="text-sm font-medium text-foreground">What this page is doing</p>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">
					Setup exists to make the installation feel trustworthy, even while GitHub redirects and
					webhook delivery are still converging.
				</p>

				<div class="mt-6 grid gap-4">
					{#each setupSignals as signal (signal.title)}
						<div class="rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
							<div class="flex items-start gap-3">
								<div class="rounded-2xl bg-primary/10 p-2 text-primary">
									<signal.icon class="size-5" />
								</div>
								<div>
									<p class="font-medium text-foreground">{signal.title}</p>
									<p class="mt-2 text-sm leading-6 text-muted-foreground">
										{signal.description}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<section class="mt-20" aria-labelledby="setup-path-heading">
			<div class="max-w-3xl">
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Setup path</p>
				<h2
					id="setup-path-heading"
					class="mt-3 font-heading text-3xl tracking-tight text-foreground md:text-4xl"
				>
					A short handoff from GitHub install to installation dashboard.
				</h2>
				<p class="mt-4 text-base leading-7 text-muted-foreground">
					RepoMind keeps this flow narrow on purpose so maintainers can understand what happened,
					what is still pending, and where to go next.
				</p>
			</div>

			<div class="mt-8 grid gap-4 lg:grid-cols-3">
				{#each setupSteps as step (step.title)}
					<div
						class="rounded-[1.75rem] border border-border/70 bg-card/70 p-6 shadow-lg shadow-black/10"
					>
						<div class="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
							<step.icon class="size-5" />
						</div>
						<p class="mt-4 text-lg font-medium text-foreground">{step.title}</p>
						<p class="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
					</div>
				{/each}
			</div>
		</section>

		<section
			class="mt-20 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
			aria-labelledby="installation-status-heading"
		>
			<div>
				{#if data.installation}
					<div
						class="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/8 p-8 shadow-xl shadow-black/10"
					>
						<p class="text-xs tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
							Installation ready
						</p>
						<h2
							id="installation-status-heading"
							class="mt-3 font-heading text-3xl tracking-tight text-foreground"
						>
							RepoMind found installation {data.installation.id}
						</h2>
						<p class="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
							GitHub has already delivered the installation record for @{data.installation
								.githubLogin}. You can open the installation dashboard now and start tuning the
							automations for that account.
						</p>
						<div class="mt-5 flex flex-wrap gap-2">
							<Badge variant="outline" class="border-emerald-500/30 text-foreground">
								{data.installation.accountType}
							</Badge>
							<Badge variant="outline" class="border-emerald-500/30 text-foreground">
								{data.installation.repositoryCount} repositories
							</Badge>
							{#if data.installation.suspendedAt}
								<Badge variant="outline" class="border-amber-500/30 text-foreground">
									Installation suspended
								</Badge>
							{/if}
						</div>
						<div class="mt-6 flex flex-wrap gap-3">
							<Button href={dashboardHref}>Open installation dashboard</Button>
							<Button href="/dashboard" variant="outline">Back to overview</Button>
						</div>
					</div>
				{:else if data.installationId}
					<div
						class="rounded-[2rem] border border-amber-500/20 bg-amber-500/8 p-8 shadow-xl shadow-black/10"
					>
						<p class="text-xs tracking-[0.24em] text-amber-700 uppercase dark:text-amber-300">
							Waiting on sync
						</p>
						<h2
							id="installation-status-heading"
							class="mt-3 font-heading text-3xl tracking-tight text-foreground"
						>
							The redirect arrived. The installation record is still catching up.
						</h2>
						<p class="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
							GitHub sent installation {data.installationId}, but RepoMind has not synced it into
							the local database yet. That usually means the installation webhook is still being
							processed.
						</p>
						<div class="mt-6 flex flex-wrap gap-3">
							<Button href="/dashboard">Go to dashboard</Button>
							<Button href="/setup" variant="outline">Reload setup page</Button>
						</div>
					</div>
				{:else}
					<div
						class="rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-xl shadow-black/10"
					>
						<p class="text-xs tracking-[0.24em] text-primary uppercase">Setup context missing</p>
						<h2
							id="installation-status-heading"
							class="mt-3 font-heading text-3xl tracking-tight text-foreground"
						>
							Install RepoMind from GitHub to generate the handoff state.
						</h2>
						<p class="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
							If you open setup directly without GitHub redirect parameters, RepoMind can still send
							you to the dashboard or back to the installation flow.
						</p>
						<div class="mt-6 flex flex-wrap gap-3">
							<Button href="https://github.com/apps/repo-mind/installations/new">
								Install on GitHub
							</Button>
							<Button href="/dashboard" variant="outline">Go to dashboard</Button>
						</div>
					</div>
				{/if}
			</div>

			<div class="grid gap-4">
				<div
					class="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-xl shadow-black/10"
				>
					<p class="font-medium text-foreground">Before you leave setup</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						Make sure the webhook route is reachable, GitHub App secrets are configured, and the
						installation dashboard reflects the repositories you intended to grant access to.
					</p>
				</div>

				<div
					class="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-xl shadow-black/10"
				>
					<p class="font-medium text-foreground">Trust surfaces</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						The public installation story is backed by policy pages and a scoped dashboard flow so
						teams can review how RepoMind behaves before relying on it.
					</p>
					<div class="mt-5 flex flex-wrap gap-3">
						<Button href="/privacy" variant="outline">Review privacy</Button>
						<Button href="/terms" variant="outline">Review terms</Button>
						<Button href="/" variant="outline">Back to home</Button>
					</div>
				</div>
			</div>
		</section>
	</div>
</section>
