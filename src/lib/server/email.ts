import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

export interface StaleIssueDigestItem {
	number: number;
	title: string;
	url: string;
	repoFullName: string;
	updatedAt: string;
	daysSinceUpdate: number;
	labels: string[];
	assignees: string[];
}

interface StaleDigestOptions {
	to: string;
	repoFullName: string;
	issues: StaleIssueDigestItem[];
	threshold: number;
	dashboardUrl: string;
}

interface StreakReminderOptions {
	to: string;
	githubUsername: string;
	dateLabel: string;
}

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const sender = env.RESEND_FROM ?? 'RepoMind <reminders@mail.repomind.dev>';

function escapeHtml(text: string) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function buildDigestHtml(options: StaleDigestOptions) {
	const rows = options.issues
		.map(
			(issue) => `
				<tr>
					<td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">
						<a href="${issue.url}" style="color: #1d4ed8; text-decoration: none; font-weight: 600;">#${issue.number} ${escapeHtml(issue.title)}</a>
						<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${issue.labels.join(', ') || 'No labels'}</div>
					</td>
					<td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${issue.daysSinceUpdate}d</td>
					<td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${issue.assignees.join(', ') || 'Unassigned'}</td>
				</tr>`
		)
		.join('');

	return `
		<!doctype html>
		<html>
			<body style="font-family: Arial, sans-serif; background: #f5f7fb; color: #111827; margin: 0; padding: 24px;">
				<div style="max-width: 640px; margin: 0 auto; background: white; border-radius: 16px; padding: 24px; border: 1px solid #e5e7eb;">
					<p style="margin: 0; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #6366f1;">RepoMind Digest</p>
					<h1 style="margin: 12px 0 8px; font-size: 24px;">${options.issues.length} stale issue${options.issues.length === 1 ? '' : 's'} need attention</h1>
					<p style="margin: 0 0 20px; color: #4b5563;">${escapeHtml(options.repoFullName)} has issues that have been quiet for more than ${options.threshold} days.</p>
					<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
						<thead>
							<tr>
								<th style="text-align: left; padding: 8px; color: #6b7280;">Issue</th>
								<th style="text-align: center; padding: 8px; color: #6b7280;">Age</th>
								<th style="text-align: center; padding: 8px; color: #6b7280;">Assignees</th>
							</tr>
						</thead>
						<tbody>${rows}</tbody>
					</table>
					<div style="margin-top: 24px;">
						<a href="${options.dashboardUrl}" style="display: inline-block; background: #111827; color: white; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 600;">Open RepoMind</a>
					</div>
				</div>
			</body>
		</html>`;
}

function buildStreakHtml(options: StreakReminderOptions) {
	return `
		<!doctype html>
		<html>
			<body style="font-family: Arial, sans-serif; background: #09090b; color: #fafafa; margin: 0; padding: 24px;">
				<div style="max-width: 520px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 28px; text-align: center;">
					<div style="font-size: 40px; margin-bottom: 12px;">🔥</div>
					<h1 style="margin: 0 0 8px; font-size: 24px;">Your commit streak needs attention</h1>
					<p style="margin: 0 0 20px; color: #d4d4d8;">RepoMind could not find a commit for @${escapeHtml(options.githubUsername)} on ${escapeHtml(options.dateLabel)}.</p>
					<p style="margin: 0; color: #a1a1aa;">Push any commit before the day ends in your local timezone to keep the streak alive.</p>
				</div>
			</body>
		</html>`;
}

export async function sendStaleDigest(options: StaleDigestOptions) {
	if (!resend) {
		return { emailId: `mock-${crypto.randomUUID()}` };
	}

	const response = await resend.emails.send({
		from: sender,
		to: [options.to],
		subject: `${options.issues.length} stale issue${options.issues.length === 1 ? '' : 's'} in ${options.repoFullName}`,
		html: buildDigestHtml(options)
	});

	if (response.error) {
		throw new Error(response.error.message);
	}

	return { emailId: response.data?.id ?? crypto.randomUUID() };
}

export async function sendStreakReminder(options: StreakReminderOptions) {
	if (!resend) {
		return { emailId: `mock-${crypto.randomUUID()}` };
	}

	const response = await resend.emails.send({
		from: sender,
		to: [options.to],
		subject: 'Your GitHub streak is at risk',
		html: buildStreakHtml(options)
	});

	if (response.error) {
		throw new Error(response.error.message);
	}

	return { emailId: response.data?.id ?? crypto.randomUUID() };
}
