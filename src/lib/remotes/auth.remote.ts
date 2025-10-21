import { z } from 'zod'
import { query, form, command, getRequestEvent } from '$app/server'
import Auth from '$lib/server/auth'
import { error, redirect } from '@sveltejs/kit'

function requireUser() {
	const { locals } = getRequestEvent()
	if (!locals.session || !locals.user) {
		redirect(303, Auth.routes.login)
	}
}

export const remotesTest = query(
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
		timezone: z.string().optional()
	}),
	async (data, invalid) => {
		// throw error(500, 'unexpected error')

		const event = getRequestEvent()

		if (data.identifier === 'test@test.com') {
			invalid(invalid.identifier('Email blocked'))
		}

		const { codeSent, passkeyAvailable } = await Auth.startAuth({
			event,
			identifier: data.identifier,
			timezone: data.timezone
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

export const startPasskeyRegistration = query(async () => {
	const event = getRequestEvent()

	const result = await Auth.startPasskeyRegistration({ event })

	return result
})

export const verifyPasskeyRegistration = command(
	z.object({
		name: z.string().max(64),
		registration: z.any()
	}),
	async ({ name, registration }) => {
		const event = getRequestEvent()

		const result = await Auth.verifyPasskeyRegistration({
			event,
			name,
			registrationResponse: registration
		})

		return result
	}
)
