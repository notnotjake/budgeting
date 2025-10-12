import { db } from '$lib/server/db'
import { eq, sql } from 'drizzle-orm'
import * as table from '$lib/server/auth/schema'
import type { User } from '$lib/server/auth/schema'

import { randomUUID } from 'crypto'
import { StructuredResponse as Response } from '$utils/structured-response'

/**
 * Creates a new user with the provided identifier and name.
 * Checks for existing user before creation and normalizes identifier to lowercase.
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
		return Response.fail('Failed to create user. User may already exist')
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
}): Promise<Response<{ user: User }>> {
	try {
		const updateData: Partial<{ name: string; identifier: string }> = {}

		if (newName !== undefined) {
			updateData.name = newName
		}

		if (newIdentifier !== undefined) {
			updateData.identifier = newIdentifier.toLowerCase()
		}

		if (Object.keys(updateData).length === 0) {
			return Response.fail('No fields to update')
		}

		const [updatedUser] = await db
			.update(table.user)
			.set(updateData)
			.where(eq(table.user.id, userId))
			.returning()

		if (!updatedUser) {
			return Response.fail('Failed to update user data. User may not exist')
		}

		return Response.succeed({ user: updatedUser })
	} catch (e) {
		console.error('Failed to update user', e)
		return Response.fail('Failed to update user')
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
			return Response.fail('User not found or deletion failed')
		}

		return Response.succeed()
	} catch (e) {
		console.error('User deletion failed', e)
		return Response.fail('User deletion failed')
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
 * @returns Response containing whether user exists and the user object if found
 */
export async function getUser({
	identifier,
	id
}: GetUserByIdentifier | GetUserById): Promise<Response<{ exists: boolean; user: User | null }>> {
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

		if (!userFound) {
			return Response.fail({ exists: false, user: null })
		}

		return Response.succeed({ exists: true, user: userFound })
	} catch (e) {
		console.error('Failed to lookup user', e)
		return Response.fail('Failed to lookup user')
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
			return Response.fail('Failed to lookup user')
		}

		return Response.succeed(result.data.exists)
	} catch (e) {
		console.error('Failed to lookup user', e)
		return Response.fail('Failed to lookup user')
	}
}

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
			return Response.fail('User not found or failed to lock account')
		}

		return Response.succeed()
	} catch (e) {
		console.error('Failed to unlock user account', e)
		return Response.fail('Failed to unlock user account')
	}
}
