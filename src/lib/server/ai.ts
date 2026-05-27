import { chat, type AnyTextAdapter } from '@tanstack/ai';
import { createGeminiChat } from '@tanstack/ai-gemini';
import { createOpenaiChat, createOpenaiChatCompletions } from '@tanstack/ai-openai';
import { env } from '$env/dynamic/private';

export type AiProviderId = 'deepseek' | 'openai' | 'gemini';

export interface AiProviderSummary {
	id: AiProviderId | 'heuristic';
	displayName: string;
	badgeText: string;
	statusText: string;
	model: string | null;
	availableProviders: AiProviderId[];
}

export interface PrSummaryInput {
	repository: string;
	title: string;
	body?: string | null;
	diff: string;
}

export interface PrSummaryResult {
	summary: string;
	model: string;
	tokensUsed?: number;
}

export interface IssueTriageInput {
	title: string;
	body?: string | null;
	availableLabels: string[];
}

export interface IssueTriageResult {
	labels: string[];
	confidence: number;
	reasoning: string;
	model: string;
	tokensUsed?: number;
}

function resolveDeepSeekBaseUrl() {
	const configuredBaseUrl = env.DEEPSEEK_BASE_URL?.trim();

	if (!configuredBaseUrl) {
		return 'https://api.deepseek.com/v1';
	}

	try {
		const parsed = new URL(configuredBaseUrl);
		const normalizedPath = parsed.pathname.replace(/\/+$/, '');

		if (normalizedPath === '' || normalizedPath === '/') {
			parsed.pathname = '/v1';
		}

		return parsed.toString().replace(/\/+$/, '');
	} catch {
		const trimmed = configuredBaseUrl.replace(/\/+$/, '');
		return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
	}
}

const PROVIDER_DETAILS: Record<AiProviderId, { displayName: string; model: string }> = {
	deepseek: {
		displayName: 'DeepSeek',
		model: 'deepseek-v4-flash'
	},
	openai: {
		displayName: 'OpenAI',
		model: 'gpt-5-nano'
	},
	gemini: {
		displayName: 'Gemini',
		model: 'gemini-2.5-flash'
	}
};

function getAvailableAiProviders(): AiProviderId[] {
	const providers: AiProviderId[] = [];

	if (env.DEEPSEEK_API_KEY) providers.push('deepseek');
	if (env.OPENAI_API_KEY) providers.push('openai');
	if (env.GOOGLE_AI_API_KEY) providers.push('gemini');

	return providers;
}

function getConfiguredAiProvider(): AiProviderId | null {
	const configured = env.AI_PROVIDER?.toLowerCase();

	if (configured === 'deepseek' || configured === 'openai' || configured === 'gemini') {
		return configured;
	}

	return null;
}

function resolveAiProviderId(): AiProviderId | null {
	const availableProviders = getAvailableAiProviders();
	const configuredProvider = getConfiguredAiProvider();

	if (configuredProvider && availableProviders.includes(configuredProvider)) {
		return configuredProvider;
	}

	if (availableProviders.length === 1) {
		return availableProviders[0];
	}

	if (availableProviders.includes('deepseek')) return 'deepseek';
	if (availableProviders.includes('openai')) return 'openai';
	if (availableProviders.includes('gemini')) return 'gemini';

	return null;
}

export function getAiProviderSummary(): AiProviderSummary {
	const availableProviders = getAvailableAiProviders();
	const activeProvider = resolveAiProviderId();

	if (!activeProvider) {
		return {
			id: 'heuristic',
			displayName: 'AI',
			badgeText: 'AI-ready workflow assistant',
			statusText: 'Heuristic fallback active',
			model: null,
			availableProviders
		};
	}

	const provider = PROVIDER_DETAILS[activeProvider];

	return {
		id: activeProvider,
		displayName: provider.displayName,
		badgeText: `${provider.displayName}-powered workflow assistant`,
		statusText: `${provider.displayName} ready`,
		model: provider.model,
		availableProviders
	};
}

function truncateDiff(diff: string, limit = 12000) {
	return diff.length > limit ? `${diff.slice(0, limit)}\n\n[diff truncated]` : diff;
}

function extractTouchedFiles(diff: string) {
	return Array.from(
		new Set(
			diff
				.split('\n')
				.filter((line) => line.startsWith('diff --git '))
				.map((line) => line.replace(/^diff --git a\//, '').replace(/ b\/.*/, ''))
		)
	).slice(0, 8);
}

function buildFallbackSummary(input: PrSummaryInput): PrSummaryResult {
	const files = extractTouchedFiles(input.diff);
	const headline = files.length
		? `Touches ${files.length} file${files.length === 1 ? '' : 's'} across ${input.repository}.`
		: 'Touches a focused set of changes.';

	const bullets = [
		`### RepoMind summary`,
		`- ${headline}`,
		`- Pull request: ${input.title}`,
		files.length
			? `- Key files: ${files.join(', ')}`
			: `- The diff is small enough to review directly.`,
		`- Review focus: auth boundaries, error handling, and configuration edge cases.`
	];

	return {
		summary: bullets.join('\n'),
		model: 'heuristic-fallback'
	};
}

function buildHeuristicTriage(input: IssueTriageInput): IssueTriageResult {
	const combined = `${input.title}\n${input.body ?? ''}`.toLowerCase();
	const matches = new Set<string>();
	let confidence = 0.45;

	if (
		/(security|vulnerability|token|secret|credential|auth bypass|xss|csrf|sql injection)/.test(
			combined
		)
	) {
		matches.add('security');
		confidence = 0.92;
	}

	if (/(bug|error|crash|broken|fail|issue|unexpected|stack trace)/.test(combined)) {
		matches.add('bug');
		confidence = Math.max(confidence, 0.82);
	}

	if (/(docs|documentation|readme|typo|guide|example)/.test(combined)) {
		matches.add('docs');
		confidence = Math.max(confidence, 0.76);
	}

	if (/(feature|proposal|enhancement|request|would like|wishlist|support)/.test(combined)) {
		matches.add('feature');
		confidence = Math.max(confidence, 0.74);
	}

	if (/(question|how do i|how can i|is it possible|can i)/.test(combined)) {
		matches.add('question');
		confidence = Math.max(confidence, 0.66);
	}

	const labels = Array.from(matches).filter((label) => input.availableLabels.includes(label));

	return {
		labels: labels.length ? labels : input.availableLabels.includes('question') ? ['question'] : [],
		confidence,
		reasoning: labels.length
			? `Keyword match suggested ${labels.join(', ')}.`
			: 'No strong keyword match.',
		model: 'heuristic-fallback'
	};
}

function stripCodeFence(text: string) {
	return text
		.replace(/^```json\s*/i, '')
		.replace(/^```\s*/i, '')
		.replace(/```$/i, '')
		.trim();
}

function createAdapter(providerId: AiProviderId, modelId: string): AnyTextAdapter | null {
	if (providerId === 'deepseek') {
		if (!env.DEEPSEEK_API_KEY) {
			return null;
		}

		return createOpenaiChatCompletions(modelId as never, env.DEEPSEEK_API_KEY, {
			baseURL: resolveDeepSeekBaseUrl()
		}) as unknown as AnyTextAdapter;
	}

	if (providerId === 'openai') {
		if (!env.OPENAI_API_KEY) {
			return null;
		}

		return createOpenaiChat(modelId as never, env.OPENAI_API_KEY) as unknown as AnyTextAdapter;
	}

	if (!env.GOOGLE_AI_API_KEY) {
		return null;
	}

	return createGeminiChat(modelId as never, env.GOOGLE_AI_API_KEY) as unknown as AnyTextAdapter;
}

async function generateJsonText<T>(providerId: AiProviderId, system: string, prompt: string) {
	const modelId = PROVIDER_DETAILS[providerId].model;
	const adapter = createAdapter(providerId, modelId);

	if (!adapter) {
		return null;
	}

	try {
		const result = await chat({
			adapter,
			messages: [{ role: 'user', content: prompt }],
			systemPrompts: [system],
			stream: false
		});

		return {
			parsed: JSON.parse(stripCodeFence(result)) as T,
			model: modelId
		};
	} catch {
		return null;
	}
}

export async function generatePrSummary(input: PrSummaryInput): Promise<PrSummaryResult> {
	const prompt = [
		'You are RepoMind, an AI assistant for GitHub maintainers.',
		'Produce a concise markdown summary for a pull request comment.',
		'Keep it under 6 bullets plus a one-line title.',
		'Focus on architectural impact, risk, and what reviewers should inspect.',
		'Return JSON with keys: summary.',
		`Repository: ${input.repository}`,
		`Title: ${input.title}`,
		`Body: ${input.body ?? 'No description provided.'}`,
		`Diff:\n${truncateDiff(input.diff)}`
	].join('\n\n');

	const activeProvider = resolveAiProviderId();

	if (activeProvider) {
		const response = await generateJsonText<{ summary?: string }>(
			activeProvider,
			'You are RepoMind. Return compact JSON with a markdown summary field for a pull request comment.',
			prompt
		);

		if (response?.parsed.summary) {
			return {
				summary: response.parsed.summary,
				model: response.model
			};
		}
	}

	return buildFallbackSummary(input);
}

export async function triageIssue(input: IssueTriageInput): Promise<IssueTriageResult> {
	const heuristic = buildHeuristicTriage(input);
	const prompt = [
		'You are RepoMind, an AI issue triage assistant.',
		'Return JSON only with keys: labels, confidence, reasoning.',
		`Allowed labels: ${input.availableLabels.join(', ')}`,
		`Issue title: ${input.title}`,
		`Issue body: ${input.body ?? 'No body provided.'}`
	].join('\n\n');

	const activeProvider = resolveAiProviderId();

	if (activeProvider) {
		const response = await generateJsonText<{
			labels?: string[];
			confidence?: number;
			reasoning?: string;
		}>(
			activeProvider,
			'Return compact JSON with labels, confidence, and reasoning for issue triage. Never emit labels outside the allowed set.',
			prompt
		);

		if (response) {
			return {
				labels: (response.parsed.labels ?? []).filter((label) =>
					input.availableLabels.includes(label)
				),
				confidence: response.parsed.confidence ?? heuristic.confidence,
				reasoning: response.parsed.reasoning ?? heuristic.reasoning,
				model: response.model
			};
		}
	}

	return heuristic;
}
