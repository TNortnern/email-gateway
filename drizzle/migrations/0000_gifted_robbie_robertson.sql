CREATE TABLE "app_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"default_from_name" text,
	"default_from_email" text,
	"tags" text,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"app_key_id" text NOT NULL,
	"message_id" text,
	"to_addresses" text NOT NULL,
	"cc_addresses" text,
	"bcc_addresses" text,
	"from_email" text NOT NULL,
	"from_name" text,
	"subject" text,
	"template_id" integer,
	"tags" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"provider_response" text,
	"idempotency_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_app_key_idempotency" UNIQUE("app_key_id","idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_app_key_id_app_keys_id_fk" FOREIGN KEY ("app_key_id") REFERENCES "public"."app_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_app_keys_key_hash" ON "app_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "idx_messages_app_key_id" ON "messages" USING btree ("app_key_id");--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_idempotency" ON "messages" USING btree ("app_key_id","idempotency_key");