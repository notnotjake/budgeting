import { db } from '$lib/server/db'
import { eq, lt, gt, and, or, inArray } from 'drizzle-orm'
import * as table from '$lib/server/auth/schema'

import type { Challenge, ChallengeType } from '$lib/server/auth/schema'
import { StructuredResponse as Response } from '$utils/structured-response'
import { ERROR_MESSAGE } from './errors'
import { randomUUID } from 'crypto'

/**
 * Creates a new authentication challenge for a user.
 * Challenges are used for email verification codes, passkey authentication, etc.
 *
 * @param identifier - The user's identifier (typically email) (**normalized**)
 * @param sessionId - Optional session ID to associate with the challenge
 * @param credential - The credential/token for the challenge (e.g., verification code)
 * @param type - The type of challenge (code, passkey, etc.)
 * @param expiresAt - When the challenge should expire
 * @returns Response containing the created challenge
 */
export async function createChallenge({
	identifier,
	sessionId,
	credential,
	type,
	expiresAt
}: {
	identifier: string
	sessionId: string | null
	credential: string
	type: ChallengeType
	expiresAt: Date
}): Promise<Response<Challenge>> {
	try {
		const [newChallenge] = await db
			.insert(table.challenge)
			.values({
				id: randomUUID(),
				type,
				identifier,
				sessionId,
				credential,
				expiresAt
			})
			.returning()

		return Response.succeed(newChallenge)
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.CHALLENGE_CREATE_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.CHALLENGE_CREATE_FAILED)
	}
}

type GetChallengeBySessionId = { type: ChallengeType; sessionId: string; credential?: undefined }
type GetChallengeByToken = { type: ChallengeType; credential: string; sessionId?: undefined }

/**
 * Retrieves an active challenge by either session ID or credential token.
 * Only returns non-expired challenges.
 *
 * @param type - The type of challenge to retrieve
 * @param sessionId - The session ID to search by (mutually exclusive with credential)
 * @param credential - The credential token to search by (mutually exclusive with sessionId)
 * @returns Response containing the challenge if found, or null if not found/expired
 */
export async function getChallenge({
	type,
	sessionId,
	credential
}: GetChallengeBySessionId | GetChallengeByToken): Promise<Response<Challenge | null>> {
	try {
		const conditions = []

		// Lookup by type
		conditions.push(eq(table.challenge.type, type))

		// Filter out expired challenges
		conditions.push(gt(table.challenge.expiresAt, new Date()))

		// Lookup by hashed token credential
		if (credential) {
			conditions.push(eq(table.challenge.credential, credential))
		}

		// Lookup by session id
		if (sessionId) {
			conditions.push(eq(table.challenge.sessionId, sessionId))
		}

		const [challenge] = await db
			.select()
			.from(table.challenge)
			.where(and(...conditions))
			.limit(1)

		return Response.succeed(challenge ?? null)
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.CHALLENGE_GET_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.CHALLENGE_GET_FAILED)
	}
}

/**
 * Removes all login-related challenges (code and passkey) for a user after successful authentication.
 * Cleans up challenges by both identifier and session ID.
 *
 * @param identifier - The user's identifier
 * @param sessionId - The session ID associated with the login
 * @returns Response indicating success or failure
 */
export async function cleanupLoginChallenges({
	identifier,
	sessionId
}: {
	identifier: string
	sessionId: string
}): Promise<Response<never>> {
	try {
		const authChallengeTypes: ChallengeType[] = ['code', 'passkey']

		await db
			.delete(table.challenge)
			.where(
				and(
					inArray(table.challenge.type, authChallengeTypes),
					or(eq(table.challenge.identifier, identifier), eq(table.challenge.sessionId, sessionId))
				)
			)

		return Response.succeed()
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.CHALLENGE_CLEANUP_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.CHALLENGE_CLEANUP_FAILED)
	}
}

/**
 * Removes duplicate challenges of a specific type before creating a new one.
 * Prevents multiple active challenges of the same type for a user.
 *
 * @param identifier - The user's identifier
 * @param sessionId - Optional session ID to clean up challenges for
 * @param type - The specific challenge type to remove duplicates of
 * @returns Response indicating success or failure
 */
export async function cleanupDuplicateLoginChallenges({
	identifier,
	sessionId,
	type
}: {
	identifier: string
	sessionId: string | null
	type: ChallengeType
}): Promise<Response<never>> {
	try {
		const conditions = []

		// Delete by type
		conditions.push(eq(table.challenge.type, type))

		if (sessionId) {
			// Delete by session id and identifier
			conditions.push(
				or(eq(table.challenge.identifier, identifier), eq(table.challenge.sessionId, sessionId))
			)
		} else {
			// Delete by identifier only (no session)
			conditions.push(eq(table.challenge.identifier, identifier))
		}

		await db.delete(table.challenge).where(and(...conditions))

		return Response.succeed()
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.CHALLENGE_CLEANUP_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.CHALLENGE_CLEANUP_FAILED)
	}
}

/**
 * Removes all expired challenges from the database.
 * Should be run periodically as a cleanup job.
 *
 * @returns Response indicating success or failure
 */
export async function cleanupExpiredChallenges(): Promise<Response<never>> {
	try {
		await db.delete(table.challenge).where(lt(table.challenge.expiresAt, new Date()))

		return Response.succeed()
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.CHALLENGE_CLEANUP_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.CHALLENGE_CLEANUP_FAILED)
	}
}
