import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import * as table from '$lib/server/auth/schema'
import type { Key, User } from '$lib/server/auth/schema'

import { encodeBase64, decodeBase64 } from '@oslojs/encoding'

import { StructuredResponse as Response } from '$utils/structured-response'

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
		console.error('Failed to create passkey', e)
		return Response.fail('Failed to create passkey')
	}
}

export async function getPasskeyCredential({
	passkeyId
}: {
	passkeyId: string
}): Promise<Response<Uint8Array | null>> {
	try {
		const [result] = await db
			.select({ credential: table.key.credential })
			.from(table.key)
			.where(eq(table.key.id, passkeyId))
			.limit(1)

		if (result?.credential) {
			const decoded = decodeBase64(result.credential) // decode text to Uint8Array
			return Response.succeed(decoded)
		}

		return Response.succeed(null)
	} catch (e) {
		console.error('Failed to get passkey credential', e)
		return Response.fail('Failed to get passkey credential')
	}
}

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
		console.error('Failed to get passkey user', e)
		return Response.fail('Failed to get passkey user')
	}
}

export async function listUserPasskeys({ userId }: { userId: string }): Promise<Response<Key[]>> {
	try {
		const keys = await db.select().from(table.key).where(eq(table.key.userId, userId))

		return Response.succeed(keys)
	} catch (e) {
		console.error('Failed to list user passkeys', e)
		return Response.fail('Failed to list user passkeys')
	}
}

export async function deletePasskey({
	passkeyId
}: {
	passkeyId: string
}): Promise<Response<never>> {
	try {
		await db.delete(table.key).where(eq(table.key.id, passkeyId))

		return Response.succeed()
	} catch (e) {
		console.error('Failed to delete passkey', e)
		return Response.fail('Failed to delete passkey')
	}
}
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
			return Response.fail('Failed to update passkey name. Passkey not found')
		}

		return Response.succeed()
	} catch (e) {
		console.error('Failed to update passkey name', e)
		return Response.fail('Failed to update passkey name')
	}
}
