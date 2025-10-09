import { query, form } from '$app/server'
import { error } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { desc } from 'drizzle-orm'
import * as table from '$lib/server/db/schema'
import { type NewNote } from '$lib/server/db/schema'
import { z } from 'zod'
import { fieldErrors } from '$lib/remotes/server'

import { delay } from '$utils/timing'

const createNoteSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	body: z.string().min(1, 'Body is required')
})

export const getNotes = query(async () => {
	const result = await db.select().from(table.note).orderBy(desc(table.note.id)).limit(10)
	return result
})

export const createNote = form(async (data) => {
	const formData = {
		title: data.get('title')?.toString() || '',
		body: data.get('body')?.toString() || ''
	}

	const validation = createNoteSchema.safeParse(formData)

	if (!validation.success) {
		const errors: Record<string, string> = {}
		for (const issue of validation.error.issues) {
			const path = issue.path.join('.')
			errors[path] = issue.message
		}
		
		throw fieldErrors(errors)
	}

	const newNote: NewNote = validation.data

	await db.insert(table.note).values(newNote)

	await delay(1500)

	return { success: true }
})
