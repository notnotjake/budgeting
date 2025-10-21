import { z } from 'zod'
import { form } from '$app/server'

export const test = form(
	z.object({
		name: z.string().min(4, 'Too short').max(10, 'Too long').startsWith('a')
	}),
	async (data) => {
		console.log(data)
		return { success: true, message: 'hello world' }
	}
)
