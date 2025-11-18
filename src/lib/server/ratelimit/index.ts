import { createRatelimit } from './setup'
import { Ratelimit } from '@upstash/ratelimit'

export const ratelimit = {
	free: createRatelimit({
		prefix: 'ratelimit:free',
		limiter: Ratelimit.fixedWindow(90, '60 s')
	}),
	paid: createRatelimit({
		prefix: 'ratelimit:paid',
		limiter: Ratelimit.fixedWindow(300, '60 s')
	}),
	authEmails: {
		short: createRatelimit({
			prefix: 'ratelimit:auth-short',
			limiter: Ratelimit.fixedWindow(1, '20 s')
		}),
		long: createRatelimit({
			prefix: 'ratelimit:auth-long',
			limiter: Ratelimit.tokenBucket(10, '6 h', 20)
		})
	},
	test: createRatelimit({
		prefix: 'ratelimit:test',
		limiter: Ratelimit.fixedWindow(100, '60 s')
	})
}

export default ratelimit
