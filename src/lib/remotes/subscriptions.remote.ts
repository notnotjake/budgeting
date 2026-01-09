import { query, command, getRequestEvent } from '$app/server'
import { db } from '$lib/server/db'
import { subscriptions } from '$lib/server/db/schema/subscriptions'
import { eq, asc } from 'drizzle-orm'
import { z } from 'zod'
import { error } from '@sveltejs/kit'

export const getSubscriptions = query(async () => {
	const event = getRequestEvent()
	const { user } = event.locals

	if (!user) {
		throw error(401, 'Unauthorized')
	}

	const userSubscriptions = await db
		.select()
		.from(subscriptions)
		.where(eq(subscriptions.userId, user.id))
		.orderBy(asc(subscriptions.dueDate))

	return userSubscriptions
})

export const createSubscription = command(
	z.object({
		name: z.string().min(1),
		company: z.string().optional(),
		amount: z.number().positive(),
		frequency: z.enum(['day', 'month']),
		dueDate: z.string()
	}),
	async ({ name, company, amount, frequency, dueDate }) => {
		const event = getRequestEvent()
		const { user } = event.locals

		if (!user) {
			throw error(401, 'Unauthorized')
		}

		const parsedDate = new Date(dueDate)
		if (isNaN(parsedDate.getTime())) {
			throw error(400, 'Invalid date')
		}

		await db.insert(subscriptions).values({
			userId: user.id,
			name,
			company,
			amount: amount.toString(),
			frequency,
			frequencyInterval: 1,
			dueDate: parsedDate,
			startDate: parsedDate
		})

		await getSubscriptions().refresh()

		return { success: true }
	}
)
