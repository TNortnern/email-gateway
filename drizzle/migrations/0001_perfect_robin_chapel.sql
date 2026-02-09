CREATE TABLE "email_events" (
	"id" text PRIMARY KEY NOT NULL,
	"app_key_id" text NOT NULL,
	"message_record_id" text NOT NULL,
	"provider_message_id" text,
	"event_type" text NOT NULL,
	"occurred_at" timestamp,
	"recipient_email" text,
	"ip" text,
	"user_agent" text,
	"provider_payload" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_app_key_id_app_keys_id_fk" FOREIGN KEY ("app_key_id") REFERENCES "public"."app_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_message_record_id_messages_id_fk" FOREIGN KEY ("message_record_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_email_events_app_key_id" ON "email_events" USING btree ("app_key_id");--> statement-breakpoint
CREATE INDEX "idx_email_events_message_record_id" ON "email_events" USING btree ("message_record_id");--> statement-breakpoint
CREATE INDEX "idx_email_events_occurred_at" ON "email_events" USING btree ("occurred_at");