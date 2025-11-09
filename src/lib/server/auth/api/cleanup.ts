import AuthCore from '$lib/server/auth/core'

export async function cleanupChallenges() {
	await AuthCore.cleanupExpiredChallenges()
}

export async function cleanupSessions() {
	await AuthCore.cleanupSessions()
}
