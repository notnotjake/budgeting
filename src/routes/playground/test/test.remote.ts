import { form } from '$app/server'
import { z } from 'zod'

export const test = form(
	z.object({
		age: z.number().min(21, 'Server: must be 21 now')
	}),
	async ({ age }) => {
		console.log(age)
		return
	}
)
