import { query } from '$app/server'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

export const getItems = query(async () => {
	// Get all sections with their items
	const sectionsWithItems = await db
		.select({
			id: table.sections.id,
			title: table.sections.title,
			items: {
				id: table.items.id,
				name: table.items.name,
				cost: table.items.cost,
				quantityType: table.items.quantityType
			}
		})
		.from(table.sections)
		.leftJoin(table.items, eq(table.sections.id, table.items.sectionId))
		.orderBy(table.sections.title, table.items.name)

	// Group items by section
	const sectionsMap = new Map<
		number,
		{
			id: number
			title: string
			items: Array<{
				id: number
				name: string
				cost: string
				quantityType: string
			}>
		}
	>()

	for (const row of sectionsWithItems) {
		if (!sectionsMap.has(row.id)) {
			sectionsMap.set(row.id, {
				id: row.id,
				title: row.title,
				items: []
			})
		}

		if (row.items?.id) {
			sectionsMap.get(row.id)!.items.push(row.items)
		}
	}

	return Array.from(sectionsMap.values())
})
