<script lang="ts">
	import { Eye, EyeOff, Lock, Sparkles, UserRound } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { signIn, signUp } from '$lib/remote';

	let showSignInPassword = $state(false);
	let showSignUpPassword = $state(false);
</script>

<section
	class="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)] px-4 py-12 md:px-8"
>
	<div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
		<div
			class="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-2xl shadow-indigo-100 backdrop-blur-sm md:p-10"
		>
			<p class="text-xs tracking-[0.28em] text-primary uppercase">RepoMind access</p>
			<h1
				class="mt-4 font-heading text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl"
			>
				Sign in to manage automations, reminders, and your GitHub installations.
			</h1>
			<p class="mt-4 max-w-xl text-base leading-7 text-slate-600">
				Username sign-in is available now, and GitHub OAuth can be enabled later by adding the
				provider credentials.
			</p>
			<div
				class="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
			>
				Use usernames with letters, numbers, underscores, dots, or hyphens.
			</div>
		</div>

		<div class="grid gap-4">
			<Card
				class="rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-xl shadow-indigo-100/50"
			>
				<CardHeader>
					<CardTitle>Sign in</CardTitle>
				</CardHeader>
				<CardContent>
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
									class="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-slate-500 hover:text-slate-950"
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
								class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
							>
								{signIn.result.message}
							</p>
						{/if}
					</form>
				</CardContent>
			</Card>

			<Card
				class="rounded-[1.75rem] border border-slate-200/80 bg-white/90 shadow-xl shadow-indigo-100/50"
			>
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
										class="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-slate-500 hover:text-slate-950"
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
								class="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
							>
								{signUp.result.message}
							</p>
						{/if}
					</form>
				</CardContent>
			</Card>

			<div
				class="rounded-[1.75rem] border border-slate-200/80 bg-white/75 p-5 shadow-lg shadow-indigo-100/40"
			>
				<p class="flex items-center gap-2 font-medium text-slate-900">
					<UserRound class="size-4 text-primary" /> Username-first auth
				</p>
				<p class="mt-2 text-sm leading-6 text-slate-600">
					Create an account with your email, then use your username to sign in across the dashboard.
				</p>
			</div>
		</div>
	</div>
</section>
