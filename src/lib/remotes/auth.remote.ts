import { z } from 'zod'
import { query, form, getRequestEvent } from '$app/server'
import Auth from '$lib/server/auth'

export const passkeyRequestChallenge = query(
	z.object({
		identifier: z.string()
	}),
	async ({ identifier }) => {
		console.log(identifier)

		return {
			success: true,
			data: 'test'
		}
	}
)

export const startLogin = form(
	z.object({
		identifier: z.string().email(),
		timezone: z.string()
	}),
	async ({ identifier, timezone }: { identifier: string; timezone: string }) => {
		const event = getRequestEvent()

		const { codeSent, passkeyAvailable } = await Auth.startLogin({
			event,
			identifier,
			timezone
		})

		return {
			codeSent,
			passkeyAvailable
		}
	}
)
