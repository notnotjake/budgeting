import { RedisClient } from 'bun'
import { REDIS_URL } from '$env/static/private'
import { BunRedisAdapter } from './adapter-bun'
import { Ratelimit, type Algorithm } from '@upstash/ratelimit'

// Initialize Redis connection
const redis = new RedisClient(REDIS_URL)

// Then wrap in our adapter
const bunRedis = new BunRedisAdapter(redis)

// Test the connection
try {
	await redis.set('test:connection', 'connected')
	const result = await redis.get('test:connection')
	console.log('[Redis] Connection test successful:', result)
} catch (error) {
	console.error('[Redis] Connection test failed:', error)
}

type RatelimiterConfig = {
	prefix: string
	limiter: Algorithm<any>
}

/**
 * Create a rate limiter with our Bun Redis adapter
 * Analytics are always disabled as they're not supported with Bun Redis
 *
 * @example
 * ```ts
 * const limiter = createRatelimiter({
 *   prefix: 'api:auth',
 *   limiter: Ratelimit.fixedWindow(10, '10s')
 * })
 *
 * const result = await limiter.limit('user:123')
 * if (!result.success) {
 *   throw new Error('Rate limited')
 * }
 * ```
 */
export function createRatelimit(config: RatelimiterConfig) {
	return new Ratelimit({
		redis: bunRedis,
		analytics: false,
		limiter: config.limiter,
		prefix: config.prefix
	})
}
