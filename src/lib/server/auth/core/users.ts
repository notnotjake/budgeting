import { db } from '$lib/server/db'
import { eq, sql } from 'drizzle-orm'
import * as table from '$lib/server/auth/schema'

import type { User } from '$lib/server/auth/schema'
import { StructuredResponse as Response } from '$utils/structured-response'
import { ERROR_MESSAGE } from './errors'
import { randomUUID } from 'crypto'

/**
 * Creates a new user with the provided identifier and name.
 *
 * @param identifier - The unique identifier for the user (typically email)
 * @param name - The display name for the user
 * @returns Response containing the created user or an error if user already exists
 */
export async function createUser({
	identifier,
	name
}: {
	identifier: string
	name: string
}): Promise<Response<User>> {
	try {
		const [result] = await db
			.insert(table.user)
			.values({
				name,
				identifier: identifier.toLowerCase(),
				createdAt: new Date(),
				lastSeenAt: new Date(),
				id: randomUUID(),
				locked: false
			})
			.returning()

		return Response.succeed(result)
	} catch (e) {
		console.error('Failed to create user. User may already exist', e)
		return Response.fail(ERROR_MESSAGE.CORE.USER_CREATE_FAILED)
	}
}

/**
 * Updates an existing user's name and/or identifier.
 * Only provided fields will be updated. Identifier is normalized to lowercase.
 *
 * @param userId - The ID of the user to update
 * @param newName - Optional new display name for the user
 * @param newIdentifier - Optional new identifier for the user
 * @returns Response containing the updated user or an error if update fails
 */
export async function updateUser({
	userId,
	newName,
	newIdentifier
}: {
	userId: string
	newName?: string
	newIdentifier?: string
}): Promise<Response<User>> {
	try {
		const updateData: Partial<{ name: string; identifier: string }> = {}

		if (newName !== undefined) {
			updateData.name = newName
		}

		if (newIdentifier !== undefined) {
			updateData.identifier = newIdentifier.toLowerCase()
		}

		if (Object.keys(updateData).length === 0) {
			return Response.fail(ERROR_MESSAGE.CORE.USER_NO_FIELDS_TO_UPDATE)
		}

		const [updatedUser] = await db
			.update(table.user)
			.set(updateData)
			.where(eq(table.user.id, userId))
			.returning()

		if (!updatedUser) {
			return Response.fail(ERROR_MESSAGE.CORE.USER_NOT_FOUND)
		}

		return Response.succeed(updatedUser)
	} catch (e) {
		console.error('Failed to update user', e)
		return Response.fail(ERROR_MESSAGE.CORE.USER_UPDATE_FAILED)
	}
}

/**
 * Permanently deletes a user and all associated data.
 * Cascading deletes will remove related sessions, keys, and challenges.
 *
 * @param userId - The ID of the user to delete
 * @returns Response indicating success or failure
 */
export async function deleteUser({ userId }: { userId: string }): Promise<Response<never>> {
	try {
		const result = await db.delete(table.user).where(eq(table.user.id, userId)).returning()

		if (result.length === 0) {
			return Response.fail(ERROR_MESSAGE.CORE.USER_NOT_FOUND)
		}

		return Response.succeed()
	} catch (e) {
		console.error('User deletion failed', e)
		return Response.fail(ERROR_MESSAGE.CORE.USER_DELETE_FAILED)
	}
}

type GetUserByIdentifier = { identifier: string; id?: never }
type GetUserById = { id: string; identifier?: never }

/**
 * Retrieves a user by either their ID or identifier.
 * Performs case-insensitive lookup when searching by identifier.
 *
 * @param identifier - The user's identifier to search for (mutually exclusive with id)
 * @param id - The user's ID to search for (mutually exclusive with identifier)
 * @returns Response containing the user if found or null
 */
export async function getUser({
	identifier,
	id
}: GetUserByIdentifier | GetUserById): Promise<Response<User | null>> {
	try {
		const [userFound] = await db
			.select()
			.from(table.user)
			.where(
				id !== undefined
					? eq(table.user.id, id)
					: eq(sql`lower(${table.user.identifier})`, identifier.toLowerCase())
			)
			.limit(1)

		return Response.succeed(userFound || null)
	} catch (e) {
		console.error('Failed to lookup user', e)
		return Response.fail(ERROR_MESSAGE.CORE.USER_LOOKUP_FAILED)
	}
}

/**
 * Checks if a user exists by either their ID or identifier.
 * Wrapper around getUser that returns only the existence status.
 *
 * @param params - Object containing either identifier or id to check
 * @returns Response containing boolean indicating if user exists
 */
export async function userExists(
	params: GetUserByIdentifier | GetUserById
): Promise<Response<boolean>> {
	try {
		const result = await getUser(params)

		if (!result.success || !result.data) {
			return Response.fail(ERROR_MESSAGE.CORE.USER_LOOKUP_FAILED)
		}

		return Response.succeed(!!result.data)
	} catch (e) {
		console.error('Failed to lookup user', e)
		return Response.fail(ERROR_MESSAGE.CORE.USER_LOOKUP_FAILED)
	}
}

/**
 * Sets the lock status of a user account.
 *
 * @param userId - The ID of the user whose lock status to change
 * @param locked - True to lock the account, false to unlock it
 * @returns Response indicating success or failure
 */
export async function setUserLockStatus({
	userId,
	locked
}: {
	userId: string
	locked: boolean
}): Promise<Response<never>> {
	try {
		const [result] = await db
			.update(table.user)
			.set({ locked })
			.where(eq(table.user.id, userId))
			.returning()

		if (!result) {
			return Response.fail(ERROR_MESSAGE.CORE.USER_NOT_FOUND)
		}

		return Response.succeed()
	} catch (e) {
		console.error('Failed to update user lock status', e)
		return Response.fail(ERROR_MESSAGE.CORE.USER_LOCK_FAILED)
	}
}
