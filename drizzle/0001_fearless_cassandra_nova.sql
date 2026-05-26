CREATE TABLE "issue_alert_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"installation_id" text NOT NULL,
	"repo_full_name" text NOT NULL,
	"recipient_emails" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_installation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"installation_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_delivery" (
	"delivery_id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"installation_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issue_alert_rule" ADD CONSTRAINT "issue_alert_rule_installation_id_installation_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_installation" ADD CONSTRAINT "user_installation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_installation" ADD CONSTRAINT "user_installation_installation_id_installation_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."installation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_alert_rule_installation_idx" ON "issue_alert_rule" USING btree ("installation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "issue_alert_rule_installation_repo_unique" ON "issue_alert_rule" USING btree ("installation_id","repo_full_name");--> statement-breakpoint
CREATE INDEX "user_installation_user_idx" ON "user_installation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_installation_installation_idx" ON "user_installation" USING btree ("installation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_installation_user_installation_unique" ON "user_installation" USING btree ("user_id","installation_id");--> statement-breakpoint
CREATE INDEX "webhook_delivery_installation_idx" ON "webhook_delivery" USING btree ("installation_id");