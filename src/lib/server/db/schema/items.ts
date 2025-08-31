import { pgTable, serial, text, integer, decimal, timestamp } from 'drizzle-orm/pg-core'
import { sections } from './sections'

export const items = pgTable('items', {
	id: serial('id').primaryKey(),
	sectionId: integer('section_id')
		.notNull()
		.references(() => sections.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
	quantityType: text('quantity_type').notNull().default('whole_unit'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
})