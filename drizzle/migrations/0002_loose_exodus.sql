ALTER TABLE "app_keys" ADD COLUMN "event_webhook_url" text;--> statement-breakpoint
ALTER TABLE "app_keys" ADD COLUMN "event_webhook_secret" text;--> statement-breakpoint
ALTER TABLE "app_keys" ADD COLUMN "event_webhook_events" text;