<script lang="ts">
	import { Eye, EyeOff, GitBranch, Lock, Sparkles, UserRound } from '@lucide/svelte';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { signIn, signUp } from '$lib/remote';

	let { data } = $props<{ data: { hasGitHubOAuth: boolean } }>();
	let showSignInPassword = $state(false);
	let showSignUpPassword = $state(false);
	let socialSignInState = $state<'idle' | 'loading' | 'error'>('idle');
	let socialSignInMessage = $state('');

	async function handleGitHubSignIn() {
		socialSignInState = 'loading';
		socialSignInMessage = '';

		try {
			await authClient.signIn.social({
				provider: 'github',
				callbackURL: '/dashboard'
			});
		} catch (error) {
			socialSignInState = 'error';
			socialSignInMessage =
				error instanceof Error ? error.message : 'Unable to start GitHub sign-in.';
		}
	}
</script>

<section class="min-h-[calc(100vh-4rem)] px-4 py-12 md:px-8">
	<div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
		<div
			class="rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-md md:p-10"
		>
			<p class="inline-flex items-center gap-2 text-xs tracking-[0.28em] text-primary uppercase">
				<Sparkles class="size-3.5" /> RepoMind access
			</p>
			<h1
				class="mt-4 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
			>
				Sign in to manage automations, reminders, and your GitHub installations.
			</h1>
			<p class="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
				{#if data.hasGitHubOAuth}
					Username sign-in and GitHub OAuth are both available for this workspace.
				{:else}
					Username sign-in is available now, and GitHub OAuth will appear here when the provider
					credentials are loaded by the app.
				{/if}
			</p>
			<div
				class="mt-6 flex items-start gap-3 rounded-3xl border border-border/70 bg-secondary/45 p-4 text-sm leading-6 text-muted-foreground"
			>
				<Lock class="mt-0.5 size-4 shrink-0 text-primary" />
				Use usernames with letters, numbers, underscores, dots, or hyphens.
			</div>
		</div>

		<div class="grid gap-4">
			<Card class="rounded-[1.75rem] border border-border/70 bg-card/75 shadow-xl shadow-black/25">
				<CardHeader>
					<CardTitle>Sign in</CardTitle>
				</CardHeader>
				<CardContent>
					{#if data.hasGitHubOAuth}
						<div class="mb-4 space-y-3">
							<Button
								type="button"
								variant="outline"
								class="w-full"
								onclick={handleGitHubSignIn}
								disabled={socialSignInState === 'loading'}
							>
								<GitBranch class="size-4" />
								{socialSignInState === 'loading' ? 'Redirecting to GitHub...' : 'Continue with GitHub'}
							</Button>
							{#if socialSignInMessage}
								<p class="text-sm text-rose-600">{socialSignInMessage}</p>
							{/if}
							<div class="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
								<div class="h-px flex-1 bg-border"></div>
								<span>Or use username</span>
								<div class="h-px flex-1 bg-border"></div>
							</div>
						</div>
					{/if}
					<form {...signIn} class="space-y-4">
						<div class="space-y-2">
							<Label for="signin-username">Username</Label>
							<Input
								id="signin-username"
								placeholder="maintainer-handle"
								{...signIn.fields.username.as('text')}
							/>
							{#if signIn.fields.username.issues()?.[0]}
								<p class="text-sm text-rose-600">{signIn.fields.username.issues()?.[0]?.message}</p>
							{/if}
						</div>
						<div class="space-y-2">
							<Label for="signin-password">Password</Label>
							<div class="relative">
								<Input
									id="signin-password"
									class="pr-12"
									{...signIn.fields.password.as(showSignInPassword ? 'text' : 'password')}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									onclick={() => (showSignInPassword = !showSignInPassword)}
									aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
									aria-pressed={showSignInPassword}
								>
									{#if showSignInPassword}
										<EyeOff class="size-4" />
									{:else}
										<Eye class="size-4" />
									{/if}
								</Button>
							</div>
							{#if signIn.fields.password.issues()?.[0]}
								<p class="text-sm text-rose-600">{signIn.fields.password.issues()?.[0]?.message}</p>
							{/if}
						</div>
						<Button type="submit" class="w-full">Open dashboard</Button>
						{#if signIn.result?.message}
							<p
								class="rounded-3xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
							>
								{signIn.result.message}
							</p>
						{/if}
					</form>
				</CardContent>
			</Card>

			<Card class="rounded-[1.75rem] border border-border/70 bg-card/75 shadow-xl shadow-black/25">
				<CardHeader>
					<CardTitle>Create an account</CardTitle>
				</CardHeader>
				<CardContent>
					<form {...signUp} class="space-y-4">
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="signup-name">Name</Label>
								<Input
									id="signup-name"
									placeholder="Open Source Maintainer"
									{...signUp.fields.name.as('text')}
								/>
								{#if signUp.fields.name.issues()?.[0]}
									<p class="text-sm text-rose-600">{signUp.fields.name.issues()?.[0]?.message}</p>
								{/if}
							</div>
							<div class="space-y-2">
								<Label for="signup-email">Email</Label>
								<Input
									id="signup-email"
									placeholder="you@example.com"
									{...signUp.fields.email.as('email')}
								/>
								{#if signUp.fields.email.issues()?.[0]}
									<p class="text-sm text-rose-600">{signUp.fields.email.issues()?.[0]?.message}</p>
								{/if}
							</div>
						</div>
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="signup-username">Username</Label>
								<Input
									id="signup-username"
									placeholder="repomind-admin"
									{...signUp.fields.username.as('text')}
								/>
								{#if signUp.fields.username.issues()?.[0]}
									<p class="text-sm text-rose-600">
										{signUp.fields.username.issues()?.[0]?.message}
									</p>
								{/if}
							</div>
							<div class="space-y-2">
								<Label for="signup-password">Password</Label>
								<div class="relative">
									<Input
										id="signup-password"
										class="pr-12"
										{...signUp.fields.password.as(showSignUpPassword ? 'text' : 'password')}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										class="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										onclick={() => (showSignUpPassword = !showSignUpPassword)}
										aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
										aria-pressed={showSignUpPassword}
									>
										{#if showSignUpPassword}
											<EyeOff class="size-4" />
										{:else}
											<Eye class="size-4" />
										{/if}
									</Button>
								</div>
								{#if signUp.fields.password.issues()?.[0]}
									<p class="text-sm text-rose-600">
										{signUp.fields.password.issues()?.[0]?.message}
									</p>
								{/if}
							</div>
						</div>
						<Button type="submit" variant="secondary" class="w-full">Create account</Button>
						{#if signUp.result?.message}
							<p
								class="rounded-3xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
							>
								{signUp.result.message}
							</p>
						{/if}
					</form>
				</CardContent>
			</Card>

			<div
				class="rounded-[1.75rem] border border-border/70 bg-card/60 p-5 shadow-lg shadow-black/20"
			>
				<p class="flex items-center gap-2 font-medium text-foreground">
					<UserRound class="size-4 text-primary" />
					{data.hasGitHubOAuth ? 'Multiple sign-in options' : 'Username-first auth'}
				</p>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">
					{#if data.hasGitHubOAuth}
						Use GitHub to attach your social account directly, or keep using username sign-in.
					{:else}
						Create an account with your email, then use your username to sign in across the dashboard.
					{/if}
				</p>
			</div>
		</div>
	</div>
</section>
