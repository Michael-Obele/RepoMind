<section class="mx-auto max-w-4xl space-y-6 px-4 py-12 md:px-8">
	<p class="text-xs uppercase tracking-[0.24em] text-primary">Privacy</p>
	<h1 class="font-heading text-4xl tracking-tight">Privacy policy</h1>
	<div class="prose prose-slate max-w-none">
		<p>RepoMind stores the minimum information required to authenticate dashboard users, record GitHub App installations, and send scheduled reminder emails.</p>
		<p>Webhook payloads are processed to summarize pull requests, triage issues, and log operational status. Secrets such as GitHub private keys, webhook secrets, AI API keys, and email credentials are expected to live in environment variables and are never written to source control.</p>
		<p>If you connect reminder email addresses, RepoMind uses Resend as the delivery provider. Activity logs remain in the application database so maintainers can audit what the automation did and why.</p>
	</div>
</section>