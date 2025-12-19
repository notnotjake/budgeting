import { query, getRequestEvent } from '$app/server'

import { AUTUMN_SECRET_KEY } from '$env/static/private'
import { Autumn } from 'autumn-js'

const autumn = new Autumn({
	secretKey: AUTUMN_SECRET_KEY
})

export const createCustomer = query(async () => {
	const { locals } = getRequestEvent()

	if (!locals.user) {
		return false
	}

	const { data, error } = await autumn.customers.create({
		id: locals.user.id,
		name: locals.user.name,
		email: locals.user.identifier
	})

	console.log('New customer', data, error)
})

export const checkoutProMonthly = query(async () => {
	const { locals } = getRequestEvent()

	if (!locals.user) {
		return false
	}

	const { data } = await autumn.checkout({
		customer_id: locals.user.id,
		product_id: 'pro_monthly'
	})

	if (data?.url) {
		return data.url
	} else {
		return null
	}
})

export const checkProStatus = query(async () => {
	const { locals } = getRequestEvent()

	if (!locals.user) {
		return false
	}

	const { data } = await autumn.check({
		customer_id: locals.user.id,
		feature_id: 'pro',
		customer_data: {
			name: locals.user.name,
			email: locals.user.identifier
		}
	})

	if (data?.allowed) {
		return true
	} else {
		return false
	}
})
