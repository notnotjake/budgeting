import { pgTable, text, decimal, timestamp, integer } from 'drizzle-orm/pg-core'
import { randomUUID } from 'crypto'
import { user } from '../../auth/schema'

export const subscriptions = pgTable('subscriptions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	company: text('company'),
	account: text('account'),
	amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
	frequency: text('frequency', { enum: ['day', 'month'] }).notNull(),
	frequencyInterval: integer('frequency_interval').notNull(),
	dueDate: timestamp('due_date', { mode: 'date', withTimezone: true }).notNull(),
	startDate: timestamp('start_date', { mode: 'date', withTimezone: true }).notNull(),
	endDate: timestamp('end_date', { mode: 'date', withTimezone: true }),
	pauseDate: timestamp('pause_date', { mode: 'date', withTimezone: true }),
	createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull()
})
