import { AUTUMN_SECRET_KEY } from '$env/static/private'
import { Autumn } from 'autumn-js'

const autumn = new Autumn({
	secretKey: AUTUMN_SECRET_KEY
})

type AutumnCustomer = {
	id: string
	name: string
	email: string
}

export async function createCustomer({ id, name, email }: AutumnCustomer) {
	const { data, error } = await autumn.customers.create({
		id,
		name,
		email
	})

	console.log('New customer', data, error)
}
