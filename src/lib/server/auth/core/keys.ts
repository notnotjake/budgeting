import { db } from '$lib/server/db'
import { eq, and } from 'drizzle-orm'
import * as table from '$lib/server/auth/schema'

import type { Key, User } from '$lib/server/auth/schema'
import { StructuredResponse as Response } from '$utils/structured-response'
import { ERROR_MESSAGE } from './errors'
import { encodeBase64, decodeBase64 } from '@oslojs/encoding'

/**
 * Creates a new passkey for a user.
 * Encodes the public key to base64 for database storage.
 *
 * @param userId - The ID of the user who owns this passkey
 * @param passkeyId - The unique ID for this passkey (credential ID from WebAuthn)
 * @param publicKey - The public key as a Uint8Array from WebAuthn registration
 * @param name - Optional friendly name for the passkey (e.g., "iPhone 13")
 * @returns Response containing the created passkey
 */
export async function createPasskey({
	userId,
	passkeyId,
	publicKey,
	name
}: {
	userId: string
	passkeyId: string
	publicKey: Uint8Array
	name?: string
}): Promise<Response<Key | null>> {
	try {
		const credentialEncoded = encodeBase64(publicKey) // encode to text for storage in db

		const [newKey] = await db
			.insert(table.key)
			.values({
				id: passkeyId,
				userId,
				type: 'passkey',
				name: name || null,
				credential: credentialEncoded,
				createdAt: new Date()
			})
			.returning()

		return Response.succeed(newKey)
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.KEY_CREATE_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.KEY_CREATE_FAILED)
	}
}

/**
 * Retrieves the public key credential for a passkey.
 * Decodes the base64-stored credential back to Uint8Array for WebAuthn verification.
 *
 * @param passkeyId - The unique ID of the passkey to retrieve
 * @returns Response containing the public key as Uint8Array, or null if not found
 */
export async function getPasskeyCredential({ passkeyId }: { passkeyId: string }) {
	try {
		const [result] = await db
			.select({ credential: table.key.credential })
			.from(table.key)
			.where(eq(table.key.id, passkeyId))
			.limit(1)

		if (result?.credential) {
			// decode text
			const decoded = decodeBase64(result.credential)
			// convert to ArrayBuffer (from ArrayBufferLike)
			const decodedResponse = new Uint8Array(decoded)

			return Response.succeed(decodedResponse)
		}

		return Response.succeed(null)
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.KEY_GET_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.KEY_GET_FAILED)
	}
}

/**
 * Retrieves the user associated with a passkey.
 * Used during WebAuthn authentication to identify which user is signing in.
 *
 * @param passkeyId - The unique ID of the passkey
 * @returns Response containing the user who owns this passkey, or null if not found
 */
export async function getPasskeyUser({
	passkeyId
}: {
	passkeyId: string
}): Promise<Response<User | null>> {
	try {
		const [result] = await db
			.select()
			.from(table.key)
			.innerJoin(table.user, eq(table.key.userId, table.user.id))
			.where(eq(table.key.id, passkeyId))
			.limit(1)

		return Response.succeed(result?.auth_user || null)
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.KEY_GET_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.KEY_GET_FAILED)
	}
}

/**
 * Checks if a user has any passkeys registered to their account.
 * More efficient than listing all passkeys when only existence matters.
 *
 * @param userId - The ID of the user to check
 * @returns Response containing true if user has at least one passkey, false otherwise
 */
export async function userHasPasskeyAvailable({
	userId
}: {
	userId: string
}): Promise<Response<boolean>> {
	try {
		const result = await db
			.select()
			.from(table.key)
			.where(and(eq(table.key.type, 'passkey'), eq(table.key.userId, userId)))
			.limit(1)

		return Response.succeed(result.length > 0)
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.KEY_LIST_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.KEY_LIST_FAILED)
	}
}

/**
 * Lists all passkeys registered to a user.
 * Used for displaying saved passkeys in account settings.
 *
 * @param userId - The ID of the user whose passkeys to retrieve
 * @returns Response containing an array of all passkeys for this user
 */
export async function listUserPasskeys({ userId }: { userId: string }): Promise<Response<Key[]>> {
	try {
		const keys = await db.select().from(table.key).where(eq(table.key.userId, userId))

		return Response.succeed(keys)
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.KEY_LIST_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.KEY_LIST_FAILED)
	}
}

/**
 * Deletes a passkey from a user's account.
 * Used when a user removes a saved passkey from their account settings.
 *
 * @param passkeyId - The unique ID of the passkey to delete
 * @returns Response indicating success or failure
 */
export async function deletePasskey({
	passkeyId
}: {
	passkeyId: string
}): Promise<Response<never>> {
	try {
		await db.delete(table.key).where(eq(table.key.id, passkeyId))

		return Response.succeed()
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.KEY_DELETE_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.KEY_DELETE_FAILED)
	}
}
/**
 * Updates the friendly name of a passkey.
 * Allows users to rename their passkeys for easier identification.
 *
 * @param passkeyId - The unique ID of the passkey to update
 * @param name - The new friendly name for the passkey
 * @returns Response indicating success or failure
 */
export async function updatePasskeyName({
	passkeyId,
	name
}: {
	passkeyId: string
	name: string
}): Promise<Response<never>> {
	try {
		const [result] = await db
			.update(table.key)
			.set({ name })
			.where(eq(table.key.id, passkeyId))
			.returning()

		if (!result) {
			return Response.fail(ERROR_MESSAGE.CORE.KEY_NOT_FOUND)
		}

		return Response.succeed()
	} catch (e) {
		console.error(ERROR_MESSAGE.CORE.KEY_UPDATE_FAILED, e)
		return Response.fail(ERROR_MESSAGE.CORE.KEY_UPDATE_FAILED)
	}
}
