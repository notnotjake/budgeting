import { Ratelimit } from '@upstash/ratelimit'
import { createRatelimit } from './setup'

export const limits = {
	free: createRatelimit({
		prefix: 'ratelimit:free',
		limiter: Ratelimit.fixedWindow(90, '60 s')
	}),
	paid: createRatelimit({
		prefix: 'ratelimit:paid',
		limiter: Ratelimit.fixedWindow(300, '60 s')
	}),
	auth: {
		all: createRatelimit({
			prefix: 'ratelimit:auth-short',
			limiter: Ratelimit.fixedWindow(100, '60 s')
		}),
		sensitive: {
			short: createRatelimit({
				prefix: 'ratelimit:auth-sensitive-short',
				limiter: Ratelimit.fixedWindow(1, '20 s')
			}),
			long: createRatelimit({
				prefix: 'ratelimit:auth-sensitive-long',
				limiter: Ratelimit.tokenBucket(10, '6 h', 20)
			})
		}
	}
}
