import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { Webhooks } from '@octokit/webhooks';
import { env } from '$env/dynamic/private';

const DEFAULT_GITHUB_APP_SLUG = 'repomind';

let githubApp: App | null = null;
let githubWebhooks: Webhooks | null = null;

function normalizePrivateKey(privateKey: string) {
	return privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey;
}

function requireEnv(name: string, value?: string) {
	if (!value) {
		throw new Error(`${name} is not configured.`);
	}

	return value;
}

export function hasGitHubAppConfig() {
	return Boolean(env.GITHUB_APP_ID && env.GITHUB_APP_PRIVATE_KEY && env.GITHUB_WEBHOOK_SECRET);
}

export function getGitHubApp() {
	if (!githubApp) {
		githubApp = new App({
			Octokit,
			appId: Number(requireEnv('GITHUB_APP_ID', env.GITHUB_APP_ID)),
			privateKey: normalizePrivateKey(
				requireEnv('GITHUB_APP_PRIVATE_KEY', env.GITHUB_APP_PRIVATE_KEY)
			)
		});
	}

	return githubApp;
}

export function getGitHubWebhooks() {
	if (!githubWebhooks) {
		githubWebhooks = new Webhooks({
			secret: requireEnv('GITHUB_WEBHOOK_SECRET', env.GITHUB_WEBHOOK_SECRET)
		});
	}

	return githubWebhooks;
}

export async function getInstallationOctokit(installationId: string | number) {
	return (await getGitHubApp().getInstallationOctokit(Number(installationId))) as Octokit;
}

export async function listInstallationRepositories(installationId: string | number) {
	const octokit = await getInstallationOctokit(installationId);
	const response = await octokit.rest.apps.listReposAccessibleToInstallation({
		per_page: 100
	});

	return response.data.repositories.map((repository) => ({
		id: repository.id,
		name: repository.name,
		fullName: repository.full_name
	}));
}

export function getGitHubInstallUrl() {
	return `https://github.com/apps/${env.PUBLIC_GITHUB_APP_SLUG ?? DEFAULT_GITHUB_APP_SLUG}/installations/new`;
}
