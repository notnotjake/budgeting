import { command } from '$app/server'
import AuthCore from '$lib/server/auth/core'

export const cleanupChallenges = command(async () => {
	await AuthCore.cleanupExpiredChallenges()
})

export const cleanupSessions = command(async () => {
	console.log('cleanup remote')
	await AuthCore.cleanupSessions()
})
