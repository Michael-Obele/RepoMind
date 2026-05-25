<script lang="ts">
	import {
		AlarmClock,
		ArrowRight,
		Bot,
		GitPullRequest,
		Mail,
		ShieldCheck,
		Tags,
		Webhook,
		Workflow
	} from '@lucide/svelte';
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

	const trustSignals = [
		'Integrates with GitHub',
		'Webhook signatures verified',
		'Installation-level controls',
		'Support and policy surfaces ready'
	];

	const jobs = [
		{
			title: 'PR summaries',
			problem:
				'Reviewers skip dense pull requests when they do not understand the shape of the change.',
			response: 'RepoMind posts a concise architectural summary the moment a pull request opens.',
			icon: GitPullRequest
		},
		{
			title: 'Issue triage',
			problem:
				'Unlabeled issues stall because nobody can quickly route them to the right workflow.',
			response:
				'RepoMind categorizes incoming issues into explainable, narrow labels instead of broad AI noise.',
			icon: Tags
		},
		{
			title: 'Reminder flows',
			problem:
				'Stale issues and contributor streaks quietly decay when nobody notices inactivity soon enough.',
			response: 'RepoMind sends maintainers proactive reminders before work or habits go cold.',
			icon: AlarmClock
		}
	];

	const operationalSteps = [
		{
			title: 'Install the GitHub App',
			description:
				'Use the GitHub installation flow and let RepoMind scope itself to the repositories you choose.'
		},
		{
			title: 'Let the webhook sync complete',
			description:
				'RepoMind verifies signatures, records the installation, and prepares the dashboard state.'
		},
		{
			title: 'Tune the automations',
			description:
				'Enable or disable summaries, triage, stale digests, and commit streak reminders per installation.'
		}
	];

	const credibilityCards = $derived([
		{
			title: 'Operationally narrow',
			description:
				'RepoMind focuses on three maintainer jobs instead of trying to replace the review process.',
			icon: Workflow
		},
		{
			title: 'Explainable by default',
			description:
				'Automation stays scoped enough that maintainers can audit what changed and why.',
			icon: ShieldCheck
		},
		{
			title: 'AI provider ready',
			description: data.aiProvider.statusText,
			icon: Bot
		}
	]);
</script>

<section class="overflow-hidden">
	<div class="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
		<div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
			<div>
				<Badge class="border border-primary/15 bg-primary/8 text-primary">
					Integrates with GitHub
				</Badge>
				<h1
					class="mt-6 max-w-4xl font-heading text-5xl font-semibold tracking-tight text-foreground md:text-7xl"
				>
					A focused GitHub App for maintainers who need faster review, clearer triage, and fewer
					forgotten issues.
				</h1>
				<p class="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
					RepoMind summarizes pull requests, labels incoming issues, and sends reminder flows that
					help teams keep repositories moving without adding a heavy platform layer.
				</p>

				<div class="mt-8 flex flex-wrap gap-3">
					<Button href="https://github.com/apps/repo-mind/installations/new">
						Install on GitHub
						<ArrowRight class="size-4" />
					</Button>
					<Button href="/setup" variant="outline">Review setup flow</Button>
				</div>

				<div class="mt-10 flex flex-wrap gap-3">
					{#each trustSignals as signal (signal)}
						<div
							class="rounded-full border border-border/70 bg-card/75 px-4 py-2 text-sm text-muted-foreground"
						>
							{signal}
						</div>
					{/each}
				</div>
			</div>

			<div
				class="rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-2xl shadow-black/25 backdrop-blur-md md:p-8"
			>
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-sm font-medium text-foreground">Why teams install RepoMind</p>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							Open-source maintainers usually do not need more dashboards. They need the review and
							backlog work to stay understandable.
						</p>
					</div>
					<div class="rounded-2xl border border-primary/20 bg-primary/12 p-3 text-primary">
						<ShieldCheck class="size-5" />
					</div>
				</div>

				<div class="mt-6 grid gap-4">
					{#each credibilityCards as card (card.title)}
						<div class="rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
							<div class="flex items-start gap-3">
								<div class="rounded-2xl bg-primary/10 p-2 text-primary">
									<card.icon class="size-5" />
								</div>
								<div>
									<p class="font-medium text-foreground">{card.title}</p>
									<p class="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-6 rounded-[1.5rem] border border-primary/15 bg-primary/10 p-5">
					<p class="text-sm font-medium text-foreground">Developer Program posture</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						RepoMind ships with install, setup, privacy, and terms surfaces so the public site can
						support a real GitHub integration lifecycle rather than a placeholder marketing page.
					</p>
				</div>
			</div>
		</div>

		<section class="mt-20" aria-labelledby="core-jobs-heading">
			<div class="max-w-3xl">
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Core jobs</p>
				<h2
					id="core-jobs-heading"
					class="mt-3 font-heading text-3xl tracking-tight text-foreground md:text-4xl"
				>
					Three maintainer problems. Three narrow automations.
				</h2>
				<p class="mt-4 text-base leading-7 text-muted-foreground">
					RepoMind is intentionally opinionated. Each feature exists to reduce maintainers' parsing
					overhead without turning the product into a noisy AI control panel.
				</p>
			</div>

			<div class="mt-8 grid gap-4 lg:grid-cols-3">
				{#each jobs as job (job.title)}
					<Card
						class="rounded-[1.75rem] border border-border/70 bg-card/70 shadow-lg shadow-black/15"
					>
						<CardHeader class="gap-4">
							<div class="inline-flex w-fit rounded-2xl bg-primary/10 p-3 text-primary">
								<job.icon class="size-5" />
							</div>
							<div>
								<CardTitle class="text-xl">{job.title}</CardTitle>
								<p class="mt-2 text-sm leading-6 text-muted-foreground">{job.problem}</p>
							</div>
						</CardHeader>
						<CardContent>
							<p class="text-sm leading-6 text-foreground">{job.response}</p>
						</CardContent>
					</Card>
				{/each}
			</div>
		</section>

		<section
			class="mt-20 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
			aria-labelledby="operations-heading"
		>
			<div
				class="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-xl shadow-black/15 md:p-8"
			>
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Install flow</p>
				<h2
					id="operations-heading"
					class="mt-3 font-heading text-3xl tracking-tight text-foreground"
				>
					Operationally small, installation by installation.
				</h2>
				<p class="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
					The product should feel useful quickly: install the GitHub App, let the webhook sync
					finish, then tune the handful of automations that matter.
				</p>

				<div class="mt-8 grid gap-4">
					{#each operationalSteps as step, index (step.title)}
						<div class="flex gap-4 rounded-[1.5rem] border border-border/70 bg-background/65 p-4">
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
							>
								{index + 1}
							</div>
							<div>
								<p class="font-medium text-foreground">{step.title}</p>
								<p class="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="grid gap-4">
				<div
					class="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-xl shadow-black/15"
				>
					<div class="flex items-start gap-3">
						<div class="rounded-2xl bg-primary/10 p-2 text-primary">
							<Webhook class="size-5" />
						</div>
						<div>
							<p class="font-medium text-foreground">Proof before polish</p>
							<p class="mt-2 text-sm leading-6 text-muted-foreground">
								The public product shape already includes setup, policy, and dashboard access
								surfaces because RepoMind is meant to operate as a real GitHub integration, not a
								waitlist site.
							</p>
						</div>
					</div>
				</div>

				<div
					class="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-xl shadow-black/15"
				>
					<div class="flex items-start gap-3">
						<div class="rounded-2xl bg-primary/10 p-2 text-primary">
							<Mail class="size-5" />
						</div>
						<div>
							<p class="font-medium text-foreground">Supportable by default</p>
							<p class="mt-2 text-sm leading-6 text-muted-foreground">
								Privacy, terms, and setup are not afterthoughts. They are part of the installation
								trust story users need before they grant repository access.
							</p>
						</div>
					</div>
				</div>

				<div
					class="rounded-[2rem] border border-primary/15 bg-primary/10 p-6 shadow-xl shadow-black/10"
				>
					<p class="text-sm font-medium text-foreground">Ready to evaluate the integration?</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						Start with the installation flow, then review the setup and policy pages that support
						the product's public footprint.
					</p>
					<div class="mt-5 flex flex-wrap gap-3">
						<Button href="https://github.com/apps/repo-mind/installations/new">
							Install on GitHub
							<ArrowRight class="size-4" />
						</Button>
						<Button href="/privacy" variant="outline">Review privacy</Button>
						<Button href="/terms" variant="outline">Review terms</Button>
					</div>
				</div>
			</div>
		</section>
	</div>
</section>
