import { timestamp, text, boolean, pgTable, index } from 'drizzle-orm/pg-core'
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export const user = pgTable('auth_user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	name: text('name').notNull(),
	identifier: text('identifier').notNull().unique(),
	locked: boolean('locked').notNull(),
	lastSeenAt: timestamp('last_seen_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
})

export const session = pgTable(
	'auth_session',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		lastSeenAt: timestamp('last_seen_at').notNull(),
		lastAuthAt: timestamp('last_auth_at'),
		expiresAt: timestamp('expires_at').notNull(),
		invalidatedAt: timestamp('invalidated_at')
	},
	(table) => [
		index('session_user_id_idx').on(table.userId), // For listAllUserSessions and invalidateAllUserSessions queries
		index('session_last_seen_at_idx').on(table.lastSeenAt), // For listAllUserSessions ordering
		index('session_expires_at_idx').on(table.expiresAt), // For cleanup
		index('session_invalidated_at_idx').on(table.invalidatedAt) // For cleanup
	]
)

export const key = pgTable(
	'auth_key',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		type: text('type').notNull(),
		name: text('name'),
		credential: text('credential'),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [
		index('key_user_id_idx').on(table.userId) // listUserPasskeys query
	]
)

export const challenge = pgTable(
	'auth_challenge',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		identifier: text('identifier').notNull(),
		sessionId: text('session_id').references(() => session.id, { onDelete: 'cascade' }),
		type: text('type', {
			enum: ['code', 'passkey', 'passkey_register', 'code_email_change', 'lock_account']
		}).notNull(),
		credential: text('credential'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		expiresAt: timestamp('expires_at').notNull()
	},
	(table) => [
		index('challenge_type_credential_idx').on(table.type, table.credential), // For getChallenge by credential
		index('challenge_type_session_id_idx').on(table.type, table.sessionId), // For getChallenge by sessionId
		index('challenge_type_identifier_idx').on(table.type, table.identifier), // For cleanup by identifier
		index('challenge_expires_at_idx').on(table.expiresAt) // For cleanup by expiry
	]
)

export type User = InferSelectModel<typeof user>
export type NewUser = InferInsertModel<typeof user>

export type Session = InferSelectModel<typeof session>
export type NewSession = InferInsertModel<typeof session>

export type Key = InferSelectModel<typeof key>
export type NewKey = InferInsertModel<typeof key>

export type Challenge = InferSelectModel<typeof challenge>
export type NewChallenge = InferInsertModel<typeof challenge>
export type ChallengeType = (typeof challenge.type.enumValues)[number]
