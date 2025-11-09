import { scheduleAuthCleanup } from './auth-cleanup'

export function scheduledTasks() {
	console.log('Starting scheduled tasks')

	scheduleAuthCleanup()
}
