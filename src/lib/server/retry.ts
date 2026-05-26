interface RetryOptions {
	attempts?: number;
	baseDelayMs?: number;
	shouldRetry?: (error: unknown) => boolean;
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
	operation: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	const attempts = options.attempts ?? 2;
	const baseDelayMs = options.baseDelayMs ?? 350;
	const shouldRetry = options.shouldRetry ?? (() => true);

	let lastError: unknown;

	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;

			if (attempt === attempts - 1 || !shouldRetry(error)) {
				throw error;
			}

			const jitter = Math.floor(Math.random() * 150);
			await delay(baseDelayMs * Math.pow(2, attempt) + jitter);
		}
	}

	throw lastError;
}
