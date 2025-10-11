CREATE TABLE "challenge" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"session_id" text NOT NULL,
	"type" text NOT NULL,
	"credential" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_key" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text,
	"credential" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"last_auth_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"invalidated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"identifier" text NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_session_id_user_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_key" ADD CONSTRAINT "user_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_unique_index" ON "user" USING btree (lower("identifier"));