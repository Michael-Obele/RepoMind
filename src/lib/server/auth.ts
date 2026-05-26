import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { username } from 'better-auth/plugins/username';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

const socialProviders =
	env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
		? {
				github: {
					clientId: env.GITHUB_CLIENT_ID,
					clientSecret: env.GITHUB_CLIENT_SECRET
				}
			}
		: undefined;

export function hasGitHubOAuthConfig() {
	return Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
}

export const auth = betterAuth({
	appName: 'RepoMind',
	baseURL: env.BETTER_AUTH_URL ?? env.ORIGIN ?? 'http://localhost:5173',
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8
	},
	...(socialProviders ? { socialProviders } : {}),
	plugins: [
		username({
			usernameValidator: (value) => /^[A-Za-z0-9_.-]+$/.test(value)
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
