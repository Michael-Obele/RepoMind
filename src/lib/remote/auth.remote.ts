import { form, getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import * as v from 'valibot';
import { auth } from '$lib/server/auth';

const usernamePattern = /^[A-Za-z0-9_.-]+$/;

const signInSchema = v.object({
	username: v.pipe(
		v.string(),
		v.minLength(1, 'Username is required.'),
		v.regex(usernamePattern, 'Use letters, numbers, underscores, dots, or hyphens.')
	),
	password: v.pipe(v.string(), v.minLength(1, 'Password is required.'))
});

const signUpSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, 'Name is required.')),
	email: v.pipe(v.string(), v.email('Enter a valid email address.')),
	username: v.pipe(
		v.string(),
		v.minLength(1, 'Username is required.'),
		v.regex(usernamePattern, 'Use letters, numbers, underscores, dots, or hyphens.')
	),
	password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters.'))
});

function dashboardUrl() {
	const { url } = getRequestEvent();
	return new URL('/dashboard', url).toString();
}

export const signIn = form(signInSchema, async ({ username, password }) => {
	try {
		await auth.api.signInUsername({
			body: {
				username,
				password
			}
		});
	} catch (error) {
		if (error instanceof APIError) {
			return { message: error.message || 'Sign in failed.' };
		}

		return { message: 'Unexpected sign-in error.' };
	}

	redirect(303, '/dashboard');
});

export const signUp = form(signUpSchema, async ({ name, email, username, password }) => {
	try {
		await auth.api.signUpEmail({
			body: {
				name,
				email,
				username,
				password,
				callbackURL: dashboardUrl()
			}
		});
	} catch (error) {
		if (error instanceof APIError) {
			return { message: error.message || 'Sign up failed.' };
		}

		return { message: 'Unexpected sign-up error.' };
	}

	redirect(303, '/dashboard');
});

export const signOut = form(async () => {
	const event = getRequestEvent();

	await auth.api.signOut({ headers: event.request.headers });
	redirect(303, '/login');
});
