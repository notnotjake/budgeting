import { redirect } from '@sveltejs/kit'
import { s3 } from '$lib/server/storage'
import type { RequestHandler } from './$types'

/** Presigned URL expiry time: 7 days */
const PRESIGN_EXPIRY = 7 * 24 * 60 * 60 // 604800 seconds

export const GET: RequestHandler = async ({ params }) => {
	const fileKey = params.path

	if (!fileKey) {
		return new Response('Not found', { status: 404 })
	}

	// Generate presigned GET URL
	const presignedUrl = s3.presign(fileKey, {
		method: 'GET',
		expiresIn: PRESIGN_EXPIRY
	})

	// Redirect to the presigned URL
	throw redirect(302, presignedUrl)
}
