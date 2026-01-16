import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { randomUUID } from 'crypto'
import { user } from '../../auth/schema'

export const userPrefs = pgTable('user_prefs', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	subscriptionSortBy: text('subscription_sort_by', {
		enum: ['date', 'status', 'price', 'period']
	})
		.notNull()
		.default('date'),
	subscriptionSortReversed: boolean('subscription_sort_reversed').notNull().default(false),
	subscriptionDisplayPeriod: text('subscription_display_period', {
		enum: ['weekly', 'monthly', 'yearly']
	})
		.notNull()
		.default('monthly'),
	createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull()
})
