import { db } from '$lib/server/db'
import { eq } from 'drizzle-orm'
import * as table from '$lib/server/auth/schema'
import type { Key, NewKey, User } from '$lib/server/auth/schema'

import { encodeBase64, decodeBase64 } from '@oslojs/encoding'

import { StructuredResponse as Response } from '$utils/structured-response'

export async function createPasskey({
	userId,
	id,
	publicKey,
	name
}: {
	userId: string
	id: string
	publicKey: Uint8Array
	name?: string
}): Promise<Response<Key | null>> {
	try {
		const credentialEncoded = encodeBase64(publicKey) // encode to text for storage in db

		const [newKey] = await db
			.insert(table.key)
			.values({
				id,
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

export async function getPasskey() {}

export async function listUserPasskeys() {}

export async function deletePasskey() {}

export async function updatePasskeyName() {}
