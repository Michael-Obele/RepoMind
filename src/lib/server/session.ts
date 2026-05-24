import { error } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';

export function requireUser() {
	const event = getRequestEvent();

	if (!event.locals.user) {
		error(401, 'You must be signed in to access RepoMind.');
	}

	return event.locals.user;
}

export function requireTaskSecret(request: Request, expectedSecret?: string) {
	const authorization = request.headers.get('authorization');

	if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
		error(401, 'Unauthorized');
	}
}
