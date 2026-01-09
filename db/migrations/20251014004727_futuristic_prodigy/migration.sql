DROP INDEX "email_unique_index";--> statement-breakpoint
ALTER TABLE "auth_user" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "challenge_type_credential_idx" ON "auth_challenge" USING btree ("type","credential");--> statement-breakpoint
CREATE INDEX "challenge_type_session_id_idx" ON "auth_challenge" USING btree ("type","session_id");--> statement-breakpoint
CREATE INDEX "challenge_type_identifier_idx" ON "auth_challenge" USING btree ("type","identifier");--> statement-breakpoint
CREATE INDEX "challenge_expires_at_idx" ON "auth_challenge" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "key_user_id_idx" ON "auth_key" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "auth_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_last_seen_at_idx" ON "auth_session" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "auth_session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "session_invalidated_at_idx" ON "auth_session" USING btree ("invalidated_at");