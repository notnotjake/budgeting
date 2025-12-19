import { query } from '$app/server'
import { db } from '$lib/server/db'
import { sections } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

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
