<script lang="ts">
	import { Database, Mail, ShieldCheck, Webhook } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	const privacySignals = [
		{
			title: 'Minimum account data',
			description:
				'RepoMind keeps the minimum information needed to authenticate dashboard users and map GitHub installations to the product.',
			icon: ShieldCheck
		},
		{
			title: 'Webhook processing',
			description:
				'Webhook payloads are handled to summarize pull requests, triage issues, and record activity that explains product behavior.',
			icon: Webhook
		},
		{
			title: 'Email delivery only when configured',
			description:
				'Reminder emails use Resend only when maintainers explicitly configure reminder recipients and delivery flows.',
			icon: Mail
		}
	];
</script>

<section class="overflow-hidden">
	<div class="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
		<div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
			<div>
				<Badge class="border border-primary/15 bg-primary/8 text-primary">Privacy</Badge>
				<h1
					class="mt-6 max-w-4xl font-heading text-4xl font-semibold tracking-tight text-foreground md:text-6xl"
				>
					Privacy policy for RepoMind's GitHub installation workflow.
				</h1>
				<p class="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
					RepoMind is designed to keep operational data understandable. This page summarizes what
					the product stores, why it stores it, and which providers are involved when the
					integration runs.
				</p>
			</div>

			<div
				class="rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-2xl shadow-black/15 backdrop-blur-md md:p-8"
			>
				<div class="flex items-start gap-3">
					<div class="rounded-2xl bg-primary/10 p-2 text-primary">
						<Database class="size-5" />
					</div>
					<div>
						<p class="text-sm font-medium text-foreground">Privacy posture</p>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">
							RepoMind stores enough data to authenticate users, link GitHub installations, and
							preserve an auditable trail of what the automation did.
						</p>
					</div>
				</div>

				<div class="mt-6 grid gap-4">
					{#each privacySignals as signal (signal.title)}
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

		<section class="mt-20 grid gap-4 lg:grid-cols-2" aria-labelledby="privacy-details-heading">
			<div class="rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-xl shadow-black/10">
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Stored data</p>
				<h2
					id="privacy-details-heading"
					class="mt-3 font-heading text-3xl tracking-tight text-foreground"
				>
					What RepoMind keeps
				</h2>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					RepoMind stores the minimum information required to authenticate dashboard users, record
					GitHub App installations, and support scheduled reminder flows.
				</p>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					That includes installation identifiers, user and account references needed for the
					dashboard, and activity log records that explain which automations ran and why.
				</p>
			</div>

			<div class="rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-xl shadow-black/10">
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Operational use</p>
				<h2 class="mt-3 font-heading text-3xl tracking-tight text-foreground">
					How the data is used
				</h2>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					Webhook payloads are processed to summarize pull requests, triage issues, and log
					operational status. The stored activity history exists so maintainers can audit what the
					product did instead of relying on opaque automation.
				</p>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					If reminder recipients are configured, RepoMind uses Resend to deliver those emails.
					RepoMind does not need email delivery data when reminder flows are not enabled.
				</p>
			</div>

			<div class="rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-xl shadow-black/10">
				<p class="text-xs tracking-[0.24em] text-primary uppercase">Secrets</p>
				<h2 class="mt-3 font-heading text-3xl tracking-tight text-foreground">
					Credentials stay out of source control
				</h2>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					GitHub private keys, webhook secrets, AI provider keys, Better Auth configuration,
					database credentials, and email provider credentials are expected to live in environment
					variables or equivalent secure deployment configuration.
				</p>
				<p class="mt-4 text-sm leading-7 text-muted-foreground">
					The product is designed so these secrets are operational dependencies, not application
					content.
				</p>
			</div>

			<div
				class="rounded-[2rem] border border-primary/15 bg-primary/10 p-8 shadow-xl shadow-black/10"
			>
				<p class="text-sm font-medium text-foreground">Need the full installation context?</p>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">
					Review the setup handoff and terms page alongside this policy so the GitHub integration,
					automation boundaries, and operational obligations stay in one coherent trust story.
				</p>
				<div class="mt-5 flex flex-wrap gap-3">
					<Button href="/setup" variant="outline">Review setup</Button>
					<Button href="/terms" variant="outline">Review terms</Button>
					<Button href="/" variant="outline">Back to home</Button>
				</div>
			</div>
		</section>
	</div>
</section>
