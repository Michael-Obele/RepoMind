<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Bot, GitPullRequest, Scale, TriangleAlert } from '@lucide/svelte';

	const termsSignals = [
		{
			title: 'Maintainer-assistance only',
			description:
				'RepoMind is designed to assist repository workflows, not replace human review or repository governance.',
			icon: GitPullRequest
		},
		{
			title: 'Third-party dependencies',
			description:
				'The service depends on GitHub, AI providers, and email vendors, which can affect timing and availability.',
			icon: Bot
		},
		{
			title: 'Responsible use required',
			description:
				'Teams should not rely on automated outputs in contexts where human review is required by policy or law.',
			icon: Scale
		}
	];
</script>

<section class="overflow-hidden">
	<div class="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
		<div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
			<div>
				<Badge class="border border-primary/15 bg-primary/8 text-primary">Terms</Badge>
				<h1
					class="mt-6 max-w-4xl font-heading text-4xl font-semibold tracking-tight text-foreground md:text-6xl"
				>
					Terms for using RepoMind as a GitHub maintainer workflow tool.
				</h1>
				<p class="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
					RepoMind is intentionally narrow. These terms set expectations for how automation should
					be reviewed, where third-party services can affect results, and which responsibilities
					remain with the maintainer.
				</p>
			</div>

			<div
				class="rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-2xl shadow-black/15 backdrop-blur-md md:p-8"
			>
				<div class="flex items-start gap-3">
					<div class="rounded-2xl bg-primary/10 p-2 text-primary">
						<TriangleAlert class="size-5" />
					</div>
					<div>
						<p class="text-sm font-medium text-foreground">Operating assumption</p>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							RepoMind can speed up review and triage, but maintainers remain responsible for
							checking outputs before relying on them.
						</p>
					</div>
				</div>

				<div class="mt-6 grid gap-4">
					{#each termsSignals as signal (signal.title)}
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

		<section class="mt-20 grid gap-4 lg:grid-cols-2" aria-labelledby="terms-details-heading">
			<div class="rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-xl shadow-black/10">
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Review responsibility</p>
				<h2
					id="terms-details-heading"
					class="mt-3 font-heading text-3xl tracking-tight text-foreground"
				>
					Automation should remain reviewable
				</h2>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					RepoMind is provided as a maintainer-assistance tool. You are responsible for reviewing
					automated labels, summaries, and reminder flows before relying on them for repository
					decisions.
				</p>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					If your repository requires manual approval, legal review, or stricter governance,
					RepoMind should be used only within those existing review controls.
				</p>
			</div>

			<div class="rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-xl shadow-black/10">
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Service dependencies</p>
				<h2 class="mt-3 font-heading text-3xl tracking-tight text-foreground">
					Availability depends on external providers
				</h2>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					RepoMind depends on GitHub for webhook delivery and installation state, AI providers for
					summary and triage generation, and email vendors for reminder delivery.
				</p>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					Temporary disruption, latency, or quota issues in those services can delay or degrade
					automation outputs.
				</p>
			</div>

			<div class="rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-xl shadow-black/10">
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Acceptable use</p>
				<h2 class="mt-3 font-heading text-3xl tracking-tight text-foreground">
					Do not use the product where unchecked automation is inappropriate
				</h2>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					Do not configure RepoMind in environments where automated comments, labels, or reminder
					messages would violate repository policy, employment obligations, contractual
					requirements, or legal duties without a human review step.
				</p>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					The product is built to reduce maintainer overhead, not to remove accountability from
					repository operators.
				</p>
			</div>

			<div
				class="rounded-[2rem] border border-primary/15 bg-primary/10 p-8 shadow-xl shadow-black/10"
			>
				<p class="text-sm font-medium text-foreground">Need the related policy context?</p>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">
					Read privacy and setup alongside these terms to understand how installation state, stored
					data, and automation responsibilities connect across the public product surface.
				</p>
				<div class="mt-5 flex flex-wrap gap-3">
					<Button href="/privacy" variant="outline">Review privacy</Button>
					<Button href="/setup" variant="outline">Review setup</Button>
					<Button href="/" variant="outline">Back to home</Button>
				</div>
			</div>
		</section>
	</div>
</section>
