import { z } from 'zod'
import { query } from '$app/server'

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
