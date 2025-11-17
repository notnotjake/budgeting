import { REDIS_URL } from '$env/static/private'
import { RedisClient } from 'bun'
import { BunRedisAdapter } from './adapter-bun'
import { Ratelimit } from '@upstash/ratelimit'

// Initialize Redis connection
const redis = new RedisClient(REDIS_URL)

const bunRedis = new BunRedisAdapter(redis)

// Test the connection
try {
	await redis.set('test:connection', 'connected')
	const result = await redis.get('test:connection')
	console.log('[Redis] Connection test successful:', result)
} catch (error) {
	console.error('[Redis] Connection test failed:', error)
}

// Dummy ratelimit implementation for now
// TODO: Replace with proper rate limiting implementation
export const ratelimit = {
	free: {
		limit: async (identifier: string) => {
			console.log('[Ratelimit] Free tier check for:', identifier)
			return { success: true, limit: 10, remaining: 10, reset: Date.now() + 10000 }
		}
	},
	paid: {
		limit: async (identifier: string) => {
			console.log('[Ratelimit] Paid tier check for:', identifier)
			return { success: true, limit: 60, remaining: 60, reset: Date.now() + 10000 }
		}
	},
	auth: {
		limit: async (identifier: string) => {
			console.log('[Ratelimit] Auth check for:', identifier)
			return { success: true, limit: 5, remaining: 5, reset: Date.now() + 10000 }
		}
	},
	test: new Ratelimit({
		redis: bunRedis,
		analytics: false,
		prefix: 'ratelimit:test',
		limiter: Ratelimit.fixedWindow(100, '10s')
	})
}

export default ratelimit
