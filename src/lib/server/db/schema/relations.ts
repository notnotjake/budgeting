import { defineRelations } from 'drizzle-orm'
import * as schema from './index'

export const relations = defineRelations(schema, (r) => ({
	user: {
		subscriptions: r.many.subscriptions({
			from: r.user.id,
			to: r.subscriptions.userId
		})
	},
	subscriptions: {
		user: r.one.user({
			from: r.subscriptions.userId,
			to: r.user.id
		})
	}
}))
