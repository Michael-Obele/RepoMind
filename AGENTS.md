# RepoMind Copilot Instructions

## Product Focus

- Build around RepoMind’s three core jobs: AI PR summaries, issue triage, and stale/streak reminders.
- Keep scope aligned with the GitHub Developer Program plan docs in `plan-github-dev-program-app/`.
- Prefer maintainable, low-config features over generic SaaS dashboard patterns.

## Stack

- **Runtime**: Bun (`bun`, `bunx`) is the default package manager and task runner.
- **Framework**: SvelteKit 5 with runes (`$state`, `$props`, `$derived`, `$effect`).
- **Database**: Drizzle ORM with PostgreSQL. Use the shared DB module in `src/lib/server/db` and the generated schema files under `src/lib/server/db/`.
- **Auth**: Better Auth with username/password plus optional GitHub OAuth.
- **GitHub integration**: `@octokit/app`, `@octokit/rest`, `@octokit/graphql`, `@octokit/webhooks`.
- **Email**: Resend for stale issue digests and streak reminders.
- **AI**: Provider selected from configured DeepSeek, OpenAI, or Gemini keys, with optional `AI_PROVIDER` override.
- **Icons**: Use `@lucide/svelte` only. Never use `lucide-svelte`.
- **UI**: shadcn-svelte primitives and Bits UI.

## Coding Rules

### Reactivity and Svelte 5

- Use runes everywhere in app code. Avoid `export let`, `$:`, `on:click`, `createEventDispatcher`, `$$props`, `$$restProps`, and `<svelte:component>`.
- Use `$app/state` instead of `$app/stores`.
- Prefer `$derived` for derived state and `$effect` for side effects only.

### Remote Functions

- Default to remote functions for dashboard reads and mutations.
- Put them in `src/lib/remote/*.remote.ts` and re-export them from `src/lib/remote/index.ts`.
- Use `query`, `command`, `form`, and `prerender` consistently with Valibot validation.
- Prefer native form bindings and `enhance` over custom submit handlers.

### Validation and Error Handling

- Validate all external input with Valibot before touching the database or GitHub APIs.
- Treat warnings as optional, but fix errors immediately.
- Use `<svelte:boundary>` for async UI that can fail or load slowly.

### Styling

- Preserve RepoMind’s existing visual language: dark, atmospheric, production-style surfaces with restrained gradients or radial backgrounds where the app already uses them.
- Avoid generic gray boilerplate and avoid introducing random new visual themes.
- Use Tailwind semantic tokens and the local `cn` helper for conditional classes.

## Project Structure

- `src/lib/server/`: auth, db, github, ai, email, audit, session, webhook handlers, and queries.
- `src/lib/remote/`: all dashboard data access and mutations.
- `src/lib/components/ui/`: shadcn-svelte primitives only; do not hand-author new primitive components.
- `src/lib/components/dashboard/`: reusable dashboard composites.
- `src/routes/(app)/`: authenticated app shell and dashboard pages.
- `src/routes/api/`: auth, webhook, and task endpoints.

## Workflow

- Use `bun run dev` for development.
- Use `bun run check` after substantive edits.
- For file-specific formatting, run `bunx prettier --write <file_path>` and verify with `bunx prettier --check <file_path>`.
- For schema work, use the existing scripts: `bun run db:push`, `bun run db:generate`, `bun run db:migrate`, and `bun run auth:schema`.

## RepoMind-Specific Conventions

- Webhook handlers must verify GitHub signatures, respond quickly, and process heavy work asynchronously.
- Keep GitHub App auth separate from dashboard auth.
- Prefer concise, explainable AI output with confidence thresholds and fallback logic.
- Keep reminder flows idempotent and auditable through webhook/activity logs.
- When adding new app behavior, ask whether it belongs in PR summaries, issue triage, stale reminders, or streak reminders before expanding scope.

## Agent Assistance

- Use `mcp_svelte_get-documentation` and `mcp_svelte_svelte-autofixer` for any Svelte component or module work.
- Keep memory notes current when you learn stable project conventions.
- Never author shadcn-svelte primitives by hand; use the documented CLI workflow or equivalent trusted research.
