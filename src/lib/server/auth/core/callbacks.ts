import type { CallbackConfig } from '../types'
import type { User } from '../schema'

// This will be set by index.ts after config is resolved
let callbacks: CallbackConfig | undefined

/**
 * Initialize the callbacks with the resolved config.
 * Called once from index.ts after config merge.
 */
export function initCallbacks(config: CallbackConfig | undefined): void {
	callbacks = config
}

/**
 * Safely invokes a callback without blocking the auth flow.
 * Errors are caught and logged but never propagate.
 */
function invokeCallback<T extends keyof CallbackConfig>(
	name: T,
	...args: Parameters<NonNullable<CallbackConfig[T]>>
): void {
	const callback = callbacks?.[name]
	if (!callback) return

	try {
		// Fire and forget - don't await
		const result = (callback as (...args: unknown[]) => unknown)(...args)

		// If it returns a promise, catch any errors
		if (result instanceof Promise) {
			result.catch((error) => {
				console.error(`Auth callback '${name}' failed:`, error)
			})
		}

		console.log(`Auth callback '${name}' triggered`)
	} catch (error) {
		console.error(`Auth callback '${name}' failed:`, error)
	}
}

/**
 * Auth callback invokers for use in core functions.
 * These are fire-and-forget and will never block or throw.
 */
export const AuthCallbacks = {
	onLogin: (user: User) => invokeCallback('onLogin', user),
	onNewUser: (user: User) => invokeCallback('onNewUser', user),
	onDeleteAccount: (user: User) => invokeCallback('onDeleteAccount', user),
	onChangeIdentifier: (user: User, previousIdentifier: string) =>
		invokeCallback('onChangeIdentifier', user, previousIdentifier)
}
