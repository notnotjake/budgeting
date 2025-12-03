/**
 * Profile picture upload remote functions
 *
 * Handles the upload flow for user profile pictures:
 * 1. Client calls requestProfilePicUpload to get presigned URL
 * 2. Client uploads directly to S3
 * 3. Client calls completeProfilePicUpload to save reference to database
 */

import { query, command, getRequestEvent } from '$app/server'
import { error } from '@sveltejs/kit'
import { z } from 'zod'
import { defineUpload, generateShortId, s3 } from '$lib/server/storage'
import { db } from '$lib/server/db'
import { user } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

/** Keep 6 files (show 5 most recent, delete oldest on new upload) */
const HISTORY_LIMIT = 6

const profilePicUpload = defineUpload({
	keyGenerate: ({ userId }) => {
		const timestamp = Date.now()
		const shortId = generateShortId()

		return `profile-pic/${userId}/${timestamp}-${shortId}.jpg`
	},
	maxSize: '5MB',
	fileType: 'image/jpeg',
	expiresIn: 10 * 60
})

/**
 * Request a presigned URL to upload a new profile picture
 *
 * Also cleans up old profile pictures if user has more than HISTORY_LIMIT
 */
export const requestProfilePicUpload = query(async () => {
	const { locals } = getRequestEvent()

	if (!locals.user) {
		throw error(401, 'Unauthorized')
	}

	const userId = locals.user.id

	// Cleanup old profile pics before generating new upload URL
	// This way all S3 operations happen in the start phase
	await cleanupOldProfilePics(userId)

	// Get presigned URL for upload
	const result = await profilePicUpload.start({
		userId,
		metadata: { previousPic: locals.user.profilePic }
	})

	return {
		uploadUrl: result.uploadUrl,
		fileKey: result.fileKey,
		uploadToken: result.uploadToken
	}
})

/**
 * Complete the profile picture upload after client has uploaded to S3
 * Saves the new profile picture key to the user's record
 */
export const completeProfilePicUpload = command(
	z.object({
		uploadToken: z.string()
	}),
	async ({ uploadToken }) => {
		const { locals } = getRequestEvent()

		if (!locals.user) {
			throw error(401, 'Unauthorized')
		}

		// Verify upload and get metadata
		const { userId, fileKey } = await profilePicUpload.complete(uploadToken)

		// Verify the upload belongs to this user
		if (userId !== locals.user.id) {
			throw error(403, 'Forbidden')
		}

		// Update user's profile picture in database
		await db.update(user).set({ profilePic: fileKey }).where(eq(user.id, userId))

		return { success: true, fileKey }
	}
)

/**
 * Clean up old profile pictures, keeping only the most recent HISTORY_LIMIT
 * Called during upload start, so if upload fails we still have the user's recent pics
 */
async function cleanupOldProfilePics(userId: string): Promise<void> {
	const prefix = `profile-pics/${userId}/`

	try {
		// List all profile pics for this user
		const listResult = await s3.list({ prefix })

		if (!listResult.contents || listResult.contents.length <= HISTORY_LIMIT) {
			return // Nothing to clean up
		}

		// Sort by key (which includes timestamp) - oldest first
		const sortedFiles = listResult.contents.sort((a, b) => {
			// Keys are like: profile-pics/userId/1234567890-abcd1234.jpg
			// Extract timestamp for comparison
			const getTimestamp = (key: string) => {
				const filename = key.split('/').pop() || ''
				const timestamp = parseInt(filename.split('-')[0], 10)
				return isNaN(timestamp) ? 0 : timestamp
			}
			return getTimestamp(a.key) - getTimestamp(b.key)
		})

		// Delete oldest files, keeping HISTORY_LIMIT
		const filesToDelete = sortedFiles.slice(0, sortedFiles.length - HISTORY_LIMIT)

		for (const file of filesToDelete) {
			await s3.delete(file.key)
		}
	} catch (err) {
		// Log but don't fail the upload if cleanup fails
		console.error('Failed to cleanup old profile pics:', err)
	}
}
