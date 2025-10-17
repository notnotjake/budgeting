import { z } from 'zod'
import { query, form, command, getRequestEvent } from '$app/server'
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

		const { codeSent, passkeyAvailable } = await Auth.startAuth({
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

export const verifyLoginCode = form(
	z.object({
		code: z
			.string()
			.regex(/^\d+$/, 'Code must contain only numbers')
			.length(6, 'Code should be 6 digits')
	}),
	async ({ code }: { code: string }) => {
		const event = getRequestEvent()

		await Auth.verifyCode({ event, code })
	}
)

export const logout = form(async () => {
	const event = getRequestEvent()

	await Auth.logout({ event })
})
