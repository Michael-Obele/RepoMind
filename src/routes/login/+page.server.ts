import { redirect } from '@sveltejs/kit';
import { hasGitHubOAuthConfig } from '$lib/server/auth';

export const load = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}

	return {
		hasGitHubOAuth: hasGitHubOAuthConfig()
	};
};
