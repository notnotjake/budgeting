import { timestamp, text, pgEnum, boolean, pgTable, uniqueIndex } from 'drizzle-orm/pg-core'
import { type InferSelectModel, type InferInsertModel, sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export const user = pgTable(
	'auth_user',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		name: text('name'),
		identifier: text('identifier').notNull().unique(),
		locked: boolean('locked').notNull(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => ({
		// Create a unique index on the lowercased identifier
		emailUniqueIndex: uniqueIndex('email_unique_index').on(sql`lower(${table.identifier})`)
	})
)

export const session = pgTable('auth_session', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	lastSeenAt: timestamp('last_seen_at').notNull(),
	lastAuthAt: timestamp('last_auth_at'),
	expiresAt: timestamp('expires_at').notNull(),
	invalidatedAt: timestamp('invalidated_at')
})

export const key = pgTable('auth_key', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	type: text('type').notNull(),
	name: text('name'),
	credential: text('credential'),
	createdAt: timestamp('created_at').notNull().defaultNow()
})

export const challengeTypeEnum = pgEnum('challenge_type', [
	'code',
	'passkey',
	'passkey_register',
	'code_email_change',
	'lock_account'
])

export const challenge = pgTable('auth_challenge', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	identifier: text('identifier').notNull(),
	sessionId: text('session_id').references(() => session.id, { onDelete: 'cascade' }),
	type: challengeTypeEnum('type').notNull(),
	credential: text('credential'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	expiresAt: timestamp('expires_at').notNull()
})

export type User = InferSelectModel<typeof user>
export type NewUser = InferInsertModel<typeof user>

export type Session = InferSelectModel<typeof session>
export type NewSession = InferInsertModel<typeof session>

export type Key = InferSelectModel<typeof key>
export type NewKey = InferInsertModel<typeof key>

export type Challenge = InferSelectModel<typeof challenge>
export type NewChallenge = InferInsertModel<typeof challenge>
export type ChallengeType = (typeof challenge.type.enumValues)[number]
