import { query } from '$app/server'
import { db } from '$lib/server/db'

export const getItems = query(async () => {
	// Get all sections with their items
	const sectionsWithItems = await db.query.sections.findMany({
		with: {
			items: true
		},
		orderBy: (sections, { asc }) => asc(sections.title)
	})

	return sectionsWithItems
})
