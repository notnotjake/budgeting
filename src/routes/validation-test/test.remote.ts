import { z } from 'zod'
import { form } from '$app/server'

export const test = form(
	z.object({
		name: z
			.string()
			.min(4, 'Too short')
			.max(10, 'Too long')
			.startsWith('a', 'Must start with "a" (Server)')
	}),
	async (data, invalid) => {
		console.log(data)
		if (data.name === 'alex') {
			invalid(invalid.name('Email blocked'))
		}
		return { success: true, message: 'hello world' }
	}
)
