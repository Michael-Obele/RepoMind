<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { getAccountSettings, signOut, updateAccountSettings } from '$lib/remote';

	const account = await getAccountSettings();
	let streakReminders = $state(account.settings?.streakReminders ?? false);
	let githubUsername = $state(account.settings?.githubUsername ?? account.user.username ?? '');
	let reminderEmail = $state(account.settings?.reminderEmail ?? account.user.email ?? '');
	let timezone = $state(account.settings?.timezone ?? 'UTC');
	let targetHour = $state(account.settings?.targetHour ?? 20);
	let saveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let message = $state('');

	async function handleSave() {
		saveState = 'saving';
		message = '';

		try {
			await updateAccountSettings({
				streakReminders,
				githubUsername,
				reminderEmail,
				timezone,
				targetHour: Number(targetHour)
			});
			saveState = 'saved';
			message = 'Reminder settings saved.';
		} catch (error) {
			saveState = 'error';
			message = error instanceof Error ? error.message : 'Unable to save account settings.';
		}
	}
</script>

<section class="space-y-6">
	<div
		class="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-sm"
	>
		<p class="text-xs tracking-[0.24em] text-primary uppercase">Account</p>
		<h1 class="mt-3 font-heading text-4xl text-white">
			{account.user.name ?? account.user.username ?? 'RepoMind user'}
		</h1>
		<p class="mt-3 text-zinc-300">
			Configure your personal streak reminders and sign out of the RepoMind dashboard.
		</p>
	</div>

	<div class="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
		<Card class="rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-sm">
			<CardHeader>
				<CardTitle class="text-white">Commit streak reminders</CardTitle>
			</CardHeader>
			<CardContent class="space-y-5">
				<div
					class="flex items-center justify-between rounded-3xl border border-white/10 bg-black/20 px-4 py-3"
				>
					<div>
						<p class="font-medium text-white">Enable reminders</p>
						<p class="text-sm text-zinc-300">
							RepoMind checks your GitHub push activity and warns you before your day ends.
						</p>
					</div>
					<Switch bind:checked={streakReminders} />
				</div>

				<div class="grid gap-5 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="github-username">GitHub username</Label>
						<Input id="github-username" bind:value={githubUsername} placeholder="octocat" />
					</div>
					<div class="space-y-2">
						<Label for="reminder-email">Reminder email</Label>
						<Input id="reminder-email" bind:value={reminderEmail} placeholder="you@example.com" />
					</div>
					<div class="space-y-2">
						<Label for="timezone">Timezone</Label>
						<Input id="timezone" bind:value={timezone} placeholder="UTC or Africa/Lagos" />
					</div>
					<div class="space-y-2">
						<Label for="target-hour">Reminder hour (0-23)</Label>
						<Input id="target-hour" bind:value={targetHour} min="0" max="23" type="number" />
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<Button onclick={handleSave} disabled={saveState === 'saving'}>
						{saveState === 'saving' ? 'Saving...' : 'Save reminder settings'}
					</Button>
					{#if message}
						<p class={saveState === 'error' ? 'text-sm text-rose-300' : 'text-sm text-emerald-300'}>
							{message}
						</p>
					{/if}
				</div>
			</CardContent>
		</Card>

		<Card class="rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-sm">
			<CardHeader>
				<CardTitle class="text-white">Session</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4 text-sm text-zinc-300">
				<p>
					Signed in as {account.user.email}.
					{#if account.hasGitHubOAuth}
						GitHub OAuth is configured for this workspace, so you can use either sign-in path.
					{:else}
						Username sign-in is enabled until GitHub OAuth credentials are available.
					{/if}
				</p>
				<form {...signOut}>
					<Button type="submit" variant="outline">Sign out</Button>
				</form>
			</CardContent>
		</Card>
	</div>
</section>
