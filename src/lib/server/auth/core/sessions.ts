import { db } from '$lib/server/db'
import { and, or, eq, lt, gt, isNull, desc } from 'drizzle-orm'
import * as table from '$lib/server/auth/schema'

import type { RequestEvent } from '@sveltejs/kit'
import type { User, Session } from '$lib/server/auth/schema'
import { StructuredResponse as Response } from '$utils/structured-response'
import { AUTH_DURATIONS } from '$lib/server/auth'
import { generateToken, hashToken } from './utils'

/**
 * Creates a new session for a user or an unauthenticated visitor.
 * Generates a session token, stores session metadata, and returns both the session and raw token.
 *
 * @param event - The SvelteKit request event containing client information
 * @param userId - Optional user ID. If provided, creates an authenticated session with longer expiration
 * @returns Response containing the created session and the raw session token for cookie storage
 */
export async function createSession({
	event,
	userId
}: {
	event: RequestEvent
	userId?: string
}): Promise<Response<{ session: Session; rawSessionToken: string }>> {
	try {
		const rawSessionToken = generateToken()
		const sessionId = hashToken(rawSessionToken)

		const ipAddress = event.getClientAddress() || 'unknown'
		const userAgent = event.request.headers.get('user-agent') || 'unknown'

		const isAuthenticated = !!userId

		const now = new Date()
		const expiresAt = new Date(
			Date.now() +
				(isAuthenticated
					? AUTH_DURATIONS.sessionAuthenticated
					: AUTH_DURATIONS.sessionUnauthenticated)
		)

		const [newSession] = await db
			.insert(table.session)
			.values({
				id: sessionId,
				userId: userId ?? null,
				ipAddress,
				userAgent,
				createdAt: now,
				lastSeenAt: now,
				lastAuthAt: now,
				expiresAt,
				invalidatedAt: null
			})
			.returning()

		return Response.succeed({ session: newSession, rawSessionToken })
	} catch (e) {
		console.error('Failed to create session', e)
		return Response.fail('Failed to create session')
	}
}

/**
 * Authenticates an existing unauthenticated session by rotating it to an authenticated session.
 * Creates a new session with user association and invalidates the old anonymous session.
 *
 * @param event - The SvelteKit request event containing the current session
 * @param user - The authenticated user to associate with the new session
 * @returns Response containing the new authenticated session and raw session token
 */
export async function authenticateSession({
	event,
	user
}: {
	event: RequestEvent
	user: User
}): Promise<Response<{ session: Session; rawSessionToken: string }>> {
	try {
		if (!event.locals.session?.id) {
			return Response.fail('Session id not found in request')
		}

		const sessionId = event.locals.session.id

		// Generate new session token and ID
		const rawSessionToken = generateToken()
		const authenticatedSessionId = hashToken(rawSessionToken)

		const ipAddress = event.getClientAddress() || 'unknown'
		const userAgent = event.request.headers.get('user-agent') || 'unknown'

		const now = new Date()
		const expiresAt = new Date(Date.now() + AUTH_DURATIONS.sessionAuthenticated)

		// Insert new session and invalidate old one in a transaction
		const newAuthenticatedSession = await db.transaction(async (tx) => {
			// Get the current session
			const [currentSession] = await db
				.select()
				.from(table.session)
				.where(eq(table.session.id, sessionId))
				.limit(1)
				.for('update') // row lock during transaction

			if (!currentSession) {
				throw new Error('Session not found in database')
			}

			if (currentSession.invalidatedAt !== null) {
				throw new Error('Session has been invalidated')
			}

			// invalidate old session
			await tx
				.update(table.session)
				.set({ invalidatedAt: new Date() })
				.where(eq(table.session.id, sessionId))

			// create new authenticated session
			const [inserted] = await tx
				.insert(table.session)
				.values({
					id: authenticatedSessionId,
					userId: user.id,
					ipAddress,
					userAgent,
					createdAt: now,
					lastSeenAt: now,
					lastAuthAt: now,
					expiresAt,
					invalidatedAt: null
				})
				.returning()

			return inserted
		})

		return Response.succeed({ session: newAuthenticatedSession, rawSessionToken })
	} catch (e) {
		console.error('Failed to rotate and authenticate session', e)
		return Response.fail('Failed to authenticate unauthenticated session')
	}
}

/**
 * Validates a session token and retrieves the associated session and user.
 * Automatically renews session expiration if within renewal window and updates last seen timestamp.
 *
 * @param token - The raw session token to validate
 * @returns Response containing the session and user if valid, or null values if invalid/expired
 */
export async function validateSessionToken(
	token: string
): Promise<Response<{ session: Session | null; user: User | null }>> {
	try {
		const sessionId = hashToken(token)

		// Check if a session exists for that user
		const [result] = await db
			.select({
				session: table.session,
				user: table.user
			})
			.from(table.session)
			.leftJoin(table.user, eq(table.session.userId, table.user.id))
			.where(
				and(
					eq(table.session.id, sessionId),
					isNull(table.session.invalidatedAt), // check if session is invalidated
					gt(table.session.expiresAt, new Date()) // check if session is expired
				)
			)

		if (!result) {
			return Response.succeed({ session: null, user: null })
		}

		const { session, user } = result

		const updateData: { lastSeenAt?: Date; expiresAt?: Date } = {}

		// Renew session if within 20 days of expiry
		if (Date.now() >= session.expiresAt.getTime() - AUTH_DURATIONS.sessionRenewalThreshold) {
			const updatedExpiresAt = new Date(Date.now() + AUTH_DURATIONS.sessionAuthenticated) // 30 days
			updateData.expiresAt = updatedExpiresAt
			session.expiresAt = updatedExpiresAt
		}

		// Update last seen if more than 5 mins old
		if (
			Date.now() >=
			session.lastSeenAt.getTime() + AUTH_DURATIONS.sessionLastSeenUpdateThreshold
		) {
			const updatedLastSeenAt = new Date()
			updateData.lastSeenAt = updatedLastSeenAt
			session.lastSeenAt = updatedLastSeenAt
		}

		// Only update db if there are changes
		if (Object.keys(updateData).length > 0) {
			await db.update(table.session).set(updateData).where(eq(table.session.id, session.id))
		}

		return Response.succeed({ session, user })
	} catch (e) {
		console.error('Failed trying to validate session', e)
		return Response.fail('Failed trying to validate session')
	}
}

/**
 * Retrieves all sessions (active and inactive) for a specific user.
 * Sessions are ordered by last seen timestamp in descending order.
 *
 * @param userId - The ID of the user whose sessions to retrieve
 * @returns Response containing an array of all user sessions
 */
export async function listAllUserSessions(userId: string): Promise<Response<Session[]>> {
	try {
		const allSessions = await db
			.select()
			.from(table.session)
			.where(eq(table.session.userId, userId))
			.orderBy(desc(table.session.lastSeenAt))

		return Response.succeed(allSessions)
	} catch (e) {
		console.error('Failed to retrieve all sessions', e)
		return Response.fail('Failed to retrieve all sessions')
	}
}

/**
 * Invalidates a single session by marking it with an invalidation timestamp.
 * Only invalidates sessions that are not already invalidated.
 *
 * @param sessionId - The ID of the session to invalidate
 * @returns Response indicating success or failure
 */
export async function invalidateSession(sessionId: string): Promise<Response<never>> {
	try {
		await db
			.update(table.session)
			.set({ invalidatedAt: new Date() })
			.where(and(eq(table.session.id, sessionId), isNull(table.session.invalidatedAt)))

		return Response.succeed()
	} catch (e) {
		console.error('Failed to invalidate session', e)
		return Response.fail('Failed to invalidate session')
	}
}

/**
 * Invalidates all active sessions for a specific user.
 * Useful for forced logout scenarios or security events.
 *
 * @param userId - The ID of the user whose sessions should be invalidated
 * @returns Response indicating success or failure
 */
export async function invalidateAllUserSessions(userId: string): Promise<Response<never>> {
	try {
		await db
			.update(table.session)
			.set({ invalidatedAt: new Date() })
			.where(and(eq(table.session.userId, userId), isNull(table.session.invalidatedAt)))

		return Response.succeed()
	} catch (e) {
		console.error('Failed to invalidate all sessions', e)
		return Response.fail('Failed to invalidate all sessions')
	}
}

/**
 * Cleans up old sessions by permanently deleting expired or invalidated sessions.
 * Only deletes sessions older than the retention window (30 days).
 *
 * @returns Response indicating success or failure
 */
export async function cleanupSessions(): Promise<Response<never>> {
	try {
		const retentionWindow = new Date(Date.now() - AUTH_DURATIONS.sessionRetentionWindow) // 30 days

		await db
			.delete(table.session)
			.where(
				or(
					lt(table.session.invalidatedAt, retentionWindow),
					lt(table.session.expiresAt, retentionWindow)
				)
			)

		return Response.succeed()
	} catch (e) {
		console.error('Failed to cleanup sessions', e)
		return Response.fail('Failed to cleanup sessions')
	}
}
