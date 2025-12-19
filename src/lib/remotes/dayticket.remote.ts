import { query } from '$app/server'
import { db } from '$lib/server/db'
import { sections } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Get all sections with their items
export const getItems = query(async () => {
	const sectionsWithItems = await db.query.sections.findMany({
		with: {
			items: true
		},
		orderBy: (sections, { asc }) => asc(sections.title)
	})

	return sectionsWithItems
})

export const updateSectionIcon = query(
	z.object({
		icon: z.string(),
		sectionId: z.string()
	}),
	async ({ icon, sectionId }) => {
		await db.update(sections).set({ icon }).where(eq(sections.id, sectionId))
		return { success: true }
	}
)

export const updateSectionCollapsed = query(
	z.object({
		sectionId: z.string(),
		collapsed: z.boolean()
	}),
	async ({ sectionId, collapsed }) => {
		await db.update(sections).set({ collapsed }).where(eq(sections.id, sectionId))
		return { success: true }
	}
)
