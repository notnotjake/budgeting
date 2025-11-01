import { query, getRequestEvent } from '$app/server'

export const getUser = query(async () => {
	const { locals } = getRequestEvent()

	return {
		email: locals.user?.identifier || '',
		name: locals.user?.name || ''
	}
})
