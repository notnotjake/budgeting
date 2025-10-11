ALTER TABLE "challenge" RENAME TO "auth_challenge";--> statement-breakpoint
ALTER TABLE "user_key" RENAME TO "auth_key";--> statement-breakpoint
ALTER TABLE "user_session" RENAME TO "auth_session";--> statement-breakpoint
ALTER TABLE "user" RENAME TO "auth_user";--> statement-breakpoint
ALTER TABLE "auth_user" DROP CONSTRAINT "user_identifier_unique";--> statement-breakpoint
ALTER TABLE "auth_challenge" DROP CONSTRAINT "challenge_session_id_user_session_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_key" DROP CONSTRAINT "user_key_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_session" DROP CONSTRAINT "user_session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_challenge" ADD CONSTRAINT "auth_challenge_session_id_auth_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."auth_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_key" ADD CONSTRAINT "auth_key_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_user" ADD CONSTRAINT "auth_user_identifier_unique" UNIQUE("identifier");