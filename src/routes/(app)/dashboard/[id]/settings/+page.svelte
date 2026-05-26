<script lang="ts">
	import { Bell, Sparkles, Webhook } from '@lucide/svelte';
	import FeatureToggleCard from '$lib/components/dashboard/FeatureToggleCard.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import {
		getInstallationSettings,
		runStaleIssueScan,
		updateInstallationSettings
	} from '$lib/remote';

	type InstallationSettings = Awaited<ReturnType<typeof getInstallationSettings>>;
	type IssueAlertRuleDraft = {
		repoFullName: string;
		enabled: boolean;
		recipientEmailsInput: string;
	};

	let pageProps = $props<{ params: { id: string } }>();
	let settings = $state<InstallationSettings | null>(null);
	let saveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let saveMessage = $state('');
	let manualScanState = $state('');
	let labelSetInput = $state('');
	let issueAlertRules = $state<IssueAlertRuleDraft[]>([]);

	function formatIssueAlertRules(nextSettings: InstallationSettings | null) {
		if (!nextSettings) {
			return [];
		}

		return nextSettings.issueAlertRules.map((rule) => ({
			repoFullName: rule.repoFullName,
			enabled: rule.enabled,
			recipientEmailsInput: rule.recipientEmails.join(', ')
		}));
	}

	function addIssueAlertRule() {
		issueAlertRules = [
			...issueAlertRules,
			{
				repoFullName: settings?.availableRepositories[0]?.fullName ?? '',
				enabled: true,
				recipientEmailsInput: ''
			}
		];
	}

	function removeIssueAlertRule(index: number) {
		issueAlertRules = issueAlertRules.filter((_, currentIndex) => currentIndex !== index);
	}

	$effect(() => {
		void (async () => {
			settings = await getInstallationSettings(pageProps.params.id);
			labelSetInput = settings?.labelSet.join(', ') ?? '';
			issueAlertRules = formatIssueAlertRules(settings);
		})();
	});

	async function handleSave() {
		if (!settings) {
			return;
		}

		saveState = 'saving';
		saveMessage = '';

		try {
			await updateInstallationSettings({
				installationId: pageProps.params.id,
				autoTriage: settings.autoTriage,
				summarizePrs: settings.summarizePrs,
				remindStaleIssues: settings.remindStaleIssues,
				staleDaysThreshold: Number(settings.staleDaysThreshold),
				maintainerEmail: settings.maintainerEmail,
				emailDigestHour: Number(settings.emailDigestHour),
				labelSet: labelSetInput
					.split(',')
					.map((label) => label.trim())
					.filter(Boolean),
				issueAlertRules: issueAlertRules.map((rule) => ({
					repoFullName: rule.repoFullName,
					enabled: rule.enabled,
					recipientEmails: rule.recipientEmailsInput
						.split(',')
						.map((email) => email.trim())
						.filter(Boolean)
				}))
			});
			saveState = 'saved';
			saveMessage = 'Settings saved.';
		} catch (error) {
			saveState = 'error';
			saveMessage = error instanceof Error ? error.message : 'Unable to save settings.';
		}
	}

	async function handleManualScan() {
		manualScanState = 'Running stale issue scan...';

		try {
			const result = await runStaleIssueScan(pageProps.params.id);
			manualScanState = result.emailed
				? `Digest sent with ${result.issues} stale issue${result.issues === 1 ? '' : 's'}.`
				: (result.reason ?? 'No stale issues found.');
		} catch (error) {
			manualScanState = error instanceof Error ? error.message : 'Unable to run a manual scan.';
		}
	}
</script>

{#if !settings}
	<section
		class="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white shadow-xl shadow-black/10 backdrop-blur-sm"
	>
		<h1 class="font-heading text-3xl">No settings found</h1>
		<p class="mt-3 text-zinc-300">
			RepoMind creates settings when the GitHub App installation webhook arrives. Reinstall or
			redeliver the webhook if needed.
		</p>
	</section>
{:else}
	<section class="space-y-6">
		<div
			class="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-sm"
		>
			<p class="text-xs tracking-[0.24em] text-primary uppercase">Installation controls</p>
			<h1 class="mt-3 font-heading text-4xl text-white">Automation settings</h1>
			<p class="mt-3 max-w-2xl text-zinc-300">
				Tune what RepoMind does automatically for this installation, and control how stale issue
				reminders are delivered.
			</p>
		</div>

		<div class="grid gap-4 lg:grid-cols-2">
			<FeatureToggleCard
				title="Summarize pull requests"
				description="Post a concise AI-generated review summary whenever a pull request opens."
				icon={Sparkles}
				bind:checked={settings.summarizePrs}
			/>
			<FeatureToggleCard
				title="Auto-triage issues"
				description="Apply labels like bug, feature, docs, security, and question when a new issue arrives."
				icon={Webhook}
				bind:checked={settings.autoTriage}
			/>
			<FeatureToggleCard
				title="Stale issue reminders"
				description="Email a digest when issues have gone quiet longer than your selected threshold."
				icon={Bell}
				bind:checked={settings.remindStaleIssues}
			/>
		</div>

		<Card class="rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-sm">
			<CardHeader>
				<CardTitle class="text-white">Reminder delivery</CardTitle>
			</CardHeader>
			<CardContent class="grid gap-5 md:grid-cols-3">
				<div class="space-y-2">
					<Label for="maintainer-email">Maintainer email</Label>
					<Input
						id="maintainer-email"
						bind:value={settings.maintainerEmail}
						placeholder="maintainer@example.com"
					/>
				</div>
				<div class="space-y-2">
					<Label for="stale-threshold">Stale threshold (days)</Label>
					<Input
						id="stale-threshold"
						bind:value={settings.staleDaysThreshold}
						min="3"
						max="90"
						type="number"
					/>
				</div>
				<div class="space-y-2">
					<Label for="digest-hour">Digest hour (UTC)</Label>
					<Input
						id="digest-hour"
						bind:value={settings.emailDigestHour}
						min="0"
						max="23"
						type="number"
					/>
				</div>
			</CardContent>
		</Card>

		<Card class="rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-sm">
			<CardHeader>
				<CardTitle class="text-white">Issue triage labels</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<Label for="label-set">Allowed labels</Label>
				<Input
					id="label-set"
					bind:value={labelSetInput}
					placeholder="bug, feature, question, docs, security"
				/>
				<p class="text-sm text-zinc-300">
					Comma-separated labels that RepoMind can apply during issue triage.
				</p>
			</CardContent>
		</Card>

		<Card
			class="rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-sm lg:col-span-2"
		>
			<CardHeader>
				<CardTitle class="text-white">Immediate new issue alerts</CardTitle>
			</CardHeader>
			<CardContent class="space-y-5">
				<p class="text-sm text-zinc-300">
					Send an email as soon as a new issue is opened on selected repositories in this
					installation.
				</p>

				{#if !settings.availableRepositories.length}
					<p class="text-sm text-zinc-300">
						No accessible repositories were found for this installation.
					</p>
				{:else}
					<div class="space-y-4">
						{#each issueAlertRules as rule, index (index)}
							<div class="rounded-3xl border border-white/10 bg-black/20 p-4">
								<div class="grid gap-4 md:grid-cols-[1fr_1.4fr_auto_auto] md:items-end">
									<div class="space-y-2">
										<Label for={`repo-${index}`}>Repository</Label>
										<select
											id={`repo-${index}`}
											bind:value={rule.repoFullName}
											class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
										>
											{#each settings.availableRepositories as repository (repository.fullName)}
												<option value={repository.fullName}>{repository.fullName}</option>
											{/each}
										</select>
									</div>

									<div class="space-y-2">
										<Label for={`emails-${index}`}>Recipient emails</Label>
										<Input
											id={`emails-${index}`}
											bind:value={rule.recipientEmailsInput}
											placeholder="ops@example.com, maintainer@example.com"
										/>
									</div>

									<div
										class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3"
									>
										<div>
											<p class="text-sm font-medium text-white">Enabled</p>
										</div>
										<Switch bind:checked={rule.enabled} />
									</div>

									<Button variant="outline" onclick={() => removeIssueAlertRule(index)}>
										Remove
									</Button>
								</div>
							</div>
						{/each}
					</div>

					<Button variant="secondary" onclick={addIssueAlertRule}>Add repository alert</Button>
				{/if}
			</CardContent>
		</Card>

		<div class="flex flex-wrap items-center gap-3">
			<Button onclick={handleSave} disabled={saveState === 'saving'}>
				{saveState === 'saving' ? 'Saving...' : 'Save changes'}
			</Button>
			<Button variant="outline" onclick={handleManualScan}>Run stale issue scan</Button>
			{#if saveMessage}
				<p class={saveState === 'error' ? 'text-sm text-rose-300' : 'text-sm text-emerald-300'}>
					{saveMessage}
				</p>
			{/if}
		</div>

		{#if manualScanState}
			<p class="text-sm text-zinc-300">{manualScanState}</p>
		{/if}
	</section>
{/if}
