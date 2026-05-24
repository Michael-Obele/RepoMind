import { getInstallationOctokit } from '$lib/server/github';

export interface StaleIssue {
	number: number;
	title: string;
	url: string;
	repoFullName: string;
	updatedAt: string;
	daysSinceUpdate: number;
	labels: string[];
	assignees: string[];
}

export async function fetchStaleIssuesForInstallation(
	installationId: string,
	thresholdDays: number,
	limit = 25
) {
	const octokit = await getInstallationOctokit(installationId);
	const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
	const repositoriesResponse = await octokit.rest.apps.listReposAccessibleToInstallation({
		per_page: 100
	});
	const repositories = repositoriesResponse.data.repositories;

	const staleIssues: StaleIssue[] = [];

	for (const repository of repositories) {
		const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
			owner: repository.owner.login,
			repo: repository.name,
			state: 'open',
			sort: 'updated',
			direction: 'asc',
			per_page: 100
		});

		for (const issue of issues) {
			if ('pull_request' in issue) {
				continue;
			}

			const updatedAt = new Date(issue.updated_at).getTime();
			const ageMs = Date.now() - updatedAt;

			if (ageMs < thresholdMs) {
				continue;
			}

			staleIssues.push({
				number: issue.number,
				title: issue.title,
				url: issue.html_url,
				repoFullName: repository.full_name,
				updatedAt: issue.updated_at,
				daysSinceUpdate: Math.floor(ageMs / (24 * 60 * 60 * 1000)),
				labels: issue.labels.map((label: { name?: string } | string) =>
					typeof label === 'string' ? label : (label.name ?? '')
				),
				assignees: issue.assignees?.map((assignee: { login: string }) => assignee.login) ?? []
			});
		}
	}

	return staleIssues
		.sort((left, right) => right.daysSinceUpdate - left.daysSinceUpdate)
		.slice(0, limit);
}
