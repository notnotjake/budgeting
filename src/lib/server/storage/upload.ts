import { S3Client, RedisClient } from 'bun'
import { REDIS_URL } from '$env/static/private'

const s3 = new S3Client({
	virtualHostedStyle: true
})

const redis = new RedisClient(REDIS_URL)

// ============================================================================
// File Size Parsing
// ============================================================================

type FileSizeUnit = 'B' | 'KB' | 'MB' | 'GB'
type FileSize = `${number}${FileSizeUnit}`

const SIZE_MULTIPLIERS: Record<FileSizeUnit, number> = {
	B: 1,
	KB: 1024,
	MB: 1024 * 1024,
	GB: 1024 * 1024 * 1024
}

/**
 * Parse a file size string like "2MB" or "500KB" to bytes
 */
function parseFileSize(size: FileSize): number {
	const match = size.match(/^(\d+(?:\.\d+)?)(B|KB|MB|GB)$/i)
	if (!match) {
		throw new Error(`Invalid file size format: ${size}. Expected format like "2MB", "500KB", etc.`)
	}
	const [, value, unit] = match
	return Math.floor(parseFloat(value) * SIZE_MULTIPLIERS[unit.toUpperCase() as FileSizeUnit])
}

// ============================================================================
// File Type / MIME Type Handling
// ============================================================================

/**
 * Supported file type shortcuts (like UploadThing)
 * Maps to arrays of MIME types
 */
const FILE_TYPE_MAP: Record<string, string[]> = {
	image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
	video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
	audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'],
	pdf: ['application/pdf'],
	text: ['text/plain', 'text/html', 'text/css', 'text/javascript'],
	blob: ['application/octet-stream']
}

/**
 * File type can be:
 * - A shortcut like "image", "video", "pdf"
 * - A specific MIME type like "image/jpeg"
 * - An array of MIME types
 */
type FileType = keyof typeof FILE_TYPE_MAP | string | string[]

/**
 * Resolve file type to array of MIME types
 */
function resolveFileType(fileType: FileType): string[] {
	if (Array.isArray(fileType)) {
		return fileType
	}
	if (fileType in FILE_TYPE_MAP) {
		return FILE_TYPE_MAP[fileType as keyof typeof FILE_TYPE_MAP]
	}
	// Assume it's a specific MIME type
	return [fileType]
}

/**
 * Get the primary MIME type (first in array) for presigning
 */
function getPrimaryMimeType(fileType: FileType): string {
	const types = resolveFileType(fileType)
	return types[0]
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a short random ID using crypto.randomUUID
 * Takes first 8 characters for brevity while maintaining uniqueness
 */
export function generateShortId(): string {
	return crypto.randomUUID().slice(0, 8)
}

/**
 * Generate a secure upload token
 */
function generateUploadToken(): string {
	return crypto.randomUUID()
}

// ============================================================================
// Types
// ============================================================================

/** Context passed to keyGenerate function */
export interface KeyGenerateContext {
	/** User ID from start options */
	userId: string
	/** Metadata from start options */
	metadata: Record<string, unknown>
}

/** Function to generate a custom file key */
export type KeyGenerateFunction = (context: KeyGenerateContext) => string

export interface UploadConfig {
	/**
	 * Function to generate the S3 key for uploads.
	 * Receives userId and metadata, should return the full key path.
	 *
	 * @example
	 * ```typescript
	 * keyGenerate: ({ userId }) => {
	 *   const timestamp = Date.now()
	 *   const shortId = generateShortId()
	 *   return `profile-pics/${userId}/${timestamp}-${shortId}.jpg`
	 * }
	 * ```
	 */
	keyGenerate: KeyGenerateFunction

	/**
	 * Maximum file size.
	 * Can be a number (bytes) or a string like "2MB", "500KB", "1GB"
	 */
	maxSize: FileSize | number

	/**
	 * Allowed file type(s).
	 * Can be:
	 * - A shortcut: "image", "video", "audio", "pdf", "text", "blob"
	 * - A specific MIME type: "image/jpeg", "application/pdf"
	 * - An array of MIME types: ["image/jpeg", "image/png"]
	 */
	fileType: FileType

	/**
	 * How long the presigned URL is valid (in seconds).
	 * @default 300 (5 minutes)
	 */
	expiresIn?: number
}

export interface StartUploadOptions {
	/** User ID - passed to keyGenerate function */
	userId: string
	/** Optional metadata to pass to keyGenerate and complete function */
	metadata?: Record<string, unknown>
}

export interface StartUploadResult {
	/** Presigned URL for uploading directly to S3 */
	uploadUrl: string
	/** The S3 key where the file will be stored */
	fileKey: string
	/** Token to pass to complete() after upload finishes */
	uploadToken: string
}

export interface CompleteUploadResult {
	/** User ID from the original start request */
	userId: string
	/** The S3 key where the file was uploaded */
	fileKey: string
	/** Metadata passed in the start request */
	metadata: Record<string, unknown>
}

export interface UploadRoute {
	/**
	 * Start an upload - generates presigned URL and stores metadata in Redis
	 */
	start(options: StartUploadOptions): Promise<StartUploadResult>

	/**
	 * Complete an upload - retrieves metadata from Redis and deletes the token
	 */
	complete(uploadToken: string): Promise<CompleteUploadResult>
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Define an upload route with specific configuration
 *
 * @example
 * ```typescript
 * const avatarUpload = defineUpload({
 *   keyGenerate: ({ userId }) => {
 *     const timestamp = Date.now()
 *     const shortId = generateShortId()
 *     return `profile-pics/${userId}/${timestamp}-${shortId}.jpg`
 *   },
 *   maxSize: '2MB',
 *   fileType: 'image/jpeg'
 * })
 * ```
 */
export function defineUpload(config: UploadConfig): UploadRoute {
	const { keyGenerate, fileType, expiresIn = 300 } = config

	// Parse maxSize if it's a string
	const maxSizeBytes =
		typeof config.maxSize === 'string' ? parseFileSize(config.maxSize) : config.maxSize

	// Get primary MIME type for presigning
	const contentType = getPrimaryMimeType(fileType)

	return {
		async start(options: StartUploadOptions): Promise<StartUploadResult> {
			const { userId, metadata = {} } = options

			// Generate file key using the provided function
			const fileKey = keyGenerate({ userId, metadata })
			const uploadToken = generateUploadToken()

			// Generate presigned PUT URL
			const uploadUrl = s3.presign(fileKey, {
				method: 'PUT',
				expiresIn,
				type: contentType
			})

			// Store upload metadata in Redis with TTL
			const uploadData = JSON.stringify({
				userId,
				fileKey,
				metadata,
				contentType,
				maxSize: maxSizeBytes,
				createdAt: Date.now()
			})

			await redis.send('SET', [
				`upload:${uploadToken}`,
				uploadData,
				'EX',
				String(expiresIn + 60) // Give a little extra time beyond URL expiry
			])

			return { uploadUrl, fileKey, uploadToken }
		},

		async complete(uploadToken: string): Promise<CompleteUploadResult> {
			// Get metadata from Redis
			const uploadData = await redis.get(`upload:${uploadToken}`)

			if (!uploadData) {
				throw new Error('Upload token expired or invalid')
			}

			const { userId, fileKey, metadata } = JSON.parse(uploadData) as {
				userId: string
				fileKey: string
				metadata: Record<string, unknown>
			}

			// Verify file exists in S3
			const stat = await s3.stat(fileKey)

			if (!stat) {
				throw new Error('File not found in storage')
			}

			// Delete token from Redis (one-time use)
			await redis.send('DEL', [`upload:${uploadToken}`])

			return { userId, fileKey, metadata }
		}
	}
}

// Export S3 client for direct operations (like listing, deleting)
export { s3 }
