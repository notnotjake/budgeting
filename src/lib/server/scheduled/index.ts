import { scheduleAuthCleanup } from './auth-cleanup'
import { scheduleStorageUploadsCleanup } from './storage-uploads-cleanup'

export function scheduledTasks() {
	console.log('Starting scheduled tasks')

	scheduleAuthCleanup()
	scheduleStorageUploadsCleanup()
}
