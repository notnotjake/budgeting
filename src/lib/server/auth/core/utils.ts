import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase64url } from '@oslojs/encoding'
import { hash, verify } from '@node-rs/argon2'

/**
 * Argon2 hashing options optimized for short verification codes.
 * Uses lower memory cost for faster hashing while maintaining security for 6-digit codes.
 */
const HASHING_OPTIONS_SHORT_CODE = {
	memoryCost: 4096,
	timeCost: 1,
	outputLen: 32,
	parallelism: 1
}

/**
 * Generates a cryptographically secure random token.
 * Uses Web Crypto API for randomness and encodes as URL-safe base64.
 *
 * @param byteLength - The length of the token in bytes (default: 32 bytes = 256 bits)
 * @returns A URL-safe base64-encoded random token
 *
 * @example
 * const sessionToken = generateToken() // 43 character string
 * const shortToken = generateToken(16) // 22 character string
 */
export function generateToken(byteLength: number = 32): string {
	const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
	return encodeBase64url(bytes)
}

/**
 * Hashes a token using SHA-256.
 * Used for storing session tokens and challenge credentials securely in the database.
 *
 * @param token - The raw token to hash
 * @returns URL-safe base64-encoded SHA-256 hash of the token
 *
 * @example
 * const rawToken = generateToken()
 * const hashedToken = hashToken(rawToken)
 * // Store hashedToken in database, send rawToken to client
 */
export function hashToken(token: string): string {
	return encodeBase64url(sha256(new TextEncoder().encode(token)))
}

/**
 * Generates a cryptographically secure 6-digit verification code.
 * Uses Web Crypto API to generate random codes from 000000 to 999999.
 *
 * @returns A 6-digit string, zero-padded if necessary
 *
 * @example
 * const code = generateShortCode() // "042815" or "000123" or "999999"
 */
export function generateShortCode(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(4))
	const int = new DataView(bytes.buffer).getUint32(0, true) % 1000000
	return int.toString().padStart(6, '0')
}

/**
 * Hashes a 6-digit verification code using Argon2.
 * Uses optimized settings for short codes that still provide strong security.
 *
 * @param code - The 6-digit verification code to hash
 * @returns Promise resolving to the Argon2 hash of the code
 *
 * @example
 * const code = generateShortCode() // "123456"
 * const hashed = await hashShortCode(code)
 * // Store hashed in database, send code to user via email
 */
export async function hashShortCode(code: string): Promise<string> {
	return await hash(code, HASHING_OPTIONS_SHORT_CODE)
}

/**
 * Verifies that an input code matches a hashed verification code.
 * Uses Argon2 verification with timing-safe comparison.
 *
 * @param savedCode - The hashed code stored in the database
 * @param inputCode - The raw code provided by the user
 * @returns Promise resolving to true if codes match, false otherwise
 *
 * @example
 * const isValid = await verifyShortCodesMatch({
 *   savedCode: hashedCodeFromDatabase,
 *   inputCode: userProvidedCode
 * })
 * if (isValid) {
 *   // Code is correct, proceed with authentication
 * }
 */
export async function verifyShortCodesMatch({
	savedCode,
	inputCode
}: {
	savedCode: string
	inputCode: string
}): Promise<boolean> {
	return await verify(savedCode, inputCode, HASHING_OPTIONS_SHORT_CODE)
}

/**
 * Generates a random friendly name for users or devices.
 * Combines a random adjective with a random animal name.
 *
 * @returns A friendly name in the format "Adjective Animal"
 *
 * @example
 * const name = generateRandomName() // "Swift Fox" or "Brave Phoenix" or "Curious Cat"
 */
export function generateRandomName(): string {
	const adjectives = ['Curious', 'Brave', 'Swift', 'Strong', 'Witty', 'Fierce']
	const animals = ['Phoenix', 'Cat', 'Fox', 'Bear', 'Wolf', 'Owl', 'Tiger', 'Panda', 'Hawk', 'Deer']

	const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
	const randomAnimal = animals[Math.floor(Math.random() * animals.length)]

	return `${randomAdjective} ${randomAnimal}`
}
