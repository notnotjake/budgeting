import { z } from 'zod'
import { form, query } from '$app/server'
import { delay } from '$lib/utils/timing'

export const test = form(
	z.object({
		name: z.string().min(4, 'Too short').max(10, 'Too long').startsWith('a'),
		// age: z.coerce.number().min(18, 'Must be 18 or older')
		address: z.object({
			state: z.string().startsWith('V')
		})
	}),
	async (data, invalid) => {
		console.log(data)

		if (data.name === 'alex') {
			invalid(invalid.name('name taken'))
		}

		if (data.name === 'aaaa') {
			return { success: true, message: 'test aaa' }
		}

		await delay(3000)

		return { success: true, message: 'hello world' }
	}
)

export const getPosts = query(async () => {
	return { posts: 'Once upon a time' }
})
