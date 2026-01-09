import { query, command, getRequestEvent } from '$app/server'
import { db } from '$lib/server/db'
import { subscriptions } from '$lib/server/db/schema/subscriptions'
import { eq, asc, and } from 'drizzle-orm'
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

export const getAccounts = query(async () => {
	const event = getRequestEvent()
	const { user } = event.locals

	if (!user) {
		throw error(401, 'Unauthorized')
	}

	const result = await db
		.selectDistinct({ account: subscriptions.account })
		.from(subscriptions)
		.where(eq(subscriptions.userId, user.id))
		.orderBy(asc(subscriptions.account))

	return result
		.map((r) => r.account)
		.filter((account): account is string => account !== null)
})

export const createSubscription = command(
	z.object({
		name: z.string().min(1),
		company: z.string().optional(),
		account: z.string().optional(),
		amount: z.number().positive(),
		frequency: z.enum(['day', 'month']),
		frequencyInterval: z.number().int().positive(),
		dueDate: z.string()
	}),
	async ({ name, company, account, amount, frequency, frequencyInterval, dueDate }) => {
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
			account,
			amount: amount.toString(),
			frequency,
			frequencyInterval,
			dueDate: parsedDate,
			startDate: parsedDate
		})

		await getSubscriptions().refresh()
		await getAccounts().refresh()

		return { success: true }
	}
)

export const deleteSubscription = command(
	z.object({
		id: z.string()
	}),
	async ({ id }) => {
		const event = getRequestEvent()
		const { user } = event.locals

		if (!user) {
			throw error(401, 'Unauthorized')
		}

		await db
			.delete(subscriptions)
			.where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))

		await getSubscriptions().refresh()
		await getAccounts().refresh()

		return { success: true }
	}
)

export const pauseSubscription = command(
	z.object({
		id: z.string()
	}),
	async ({ id }) => {
		const event = getRequestEvent()
		const { user } = event.locals

		if (!user) {
			throw error(401, 'Unauthorized')
		}

		await db
			.update(subscriptions)
			.set({ pauseDate: new Date() })
			.where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))

		await getSubscriptions().refresh()

		return { success: true }
	}
)

export const cancelSubscription = command(
	z.object({
		id: z.string()
	}),
	async ({ id }) => {
		const event = getRequestEvent()
		const { user } = event.locals

		if (!user) {
			throw error(401, 'Unauthorized')
		}

		await db
			.update(subscriptions)
			.set({ endDate: new Date() })
			.where(and(eq(subscriptions.id, id), eq(subscriptions.userId, user.id)))

		await getSubscriptions().refresh()

		return { success: true }
	}
)
