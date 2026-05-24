<script lang="ts">
	import { Bell, Sparkles, Webhook } from '@lucide/svelte';
	import FeatureToggleCard from '$lib/components/dashboard/FeatureToggleCard.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import {
		getInstallationSettings,
		runStaleIssueScan,
		updateInstallationSettings
	} from '$lib/remote';

	type InstallationSettings = Awaited<ReturnType<typeof getInstallationSettings>>;

	let pageProps = $props<{ params: { id: string } }>();
	let settings = $state<InstallationSettings | null>(null);
	let saveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let saveMessage = $state('');
	let manualScanState = $state('');

	$effect(() => {
		void (async () => {
			settings = await getInstallationSettings(pageProps.params.id);
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
				emailDigestHour: Number(settings.emailDigestHour)
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
