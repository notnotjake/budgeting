import { query, command, getRequestEvent } from '$app/server'
import { db } from '$lib/server/db'
import { userPrefs } from '$lib/server/db/schema/user-prefs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { error } from '@sveltejs/kit'

export const getUserPrefs = query(async () => {
	const event = getRequestEvent()
	const { user } = event.locals

	if (!user) {
		throw error(401, 'Unauthorized')
	}

	const result = await db
		.select()
		.from(userPrefs)
		.where(eq(userPrefs.userId, user.id))
		.limit(1)

	if (result.length === 0) {
		return {
			subscriptionSortBy: 'date' as const,
			subscriptionSortReversed: false
		}
	}

	return {
		subscriptionSortBy: result[0].subscriptionSortBy,
		subscriptionSortReversed: result[0].subscriptionSortReversed
	}
})

export const updateUserPrefs = command(
	z.object({
		subscriptionSortBy: z.enum(['date', 'status', 'price', 'period']).optional(),
		subscriptionSortReversed: z.boolean().optional()
	}),
	async (data) => {
		const event = getRequestEvent()
		const { user } = event.locals

		if (!user) {
			throw error(401, 'Unauthorized')
		}

		const existing = await db
			.select()
			.from(userPrefs)
			.where(eq(userPrefs.userId, user.id))
			.limit(1)

		if (existing.length === 0) {
			await db.insert(userPrefs).values({
				userId: user.id,
				subscriptionSortBy: data.subscriptionSortBy ?? 'date',
				subscriptionSortReversed: data.subscriptionSortReversed ?? false
			})
		} else {
			await db
				.update(userPrefs)
				.set({
					...(data.subscriptionSortBy !== undefined && {
						subscriptionSortBy: data.subscriptionSortBy
					}),
					...(data.subscriptionSortReversed !== undefined && {
						subscriptionSortReversed: data.subscriptionSortReversed
					}),
					updatedAt: new Date()
				})
				.where(eq(userPrefs.userId, user.id))
		}

		await getUserPrefs().refresh()

		return { success: true }
	}
)
