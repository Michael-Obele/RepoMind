import { getAiProviderSummary } from '$lib/server/ai';

export const load = async () => {
	return {
		aiProvider: getAiProviderSummary()
	};
};