import { type RequestEvent } from '@sveltejs/kit'

const SESSION_COOKIE_NAME = 'session'
const REDIRECT_COOKIE_NAME = 'redirect'

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		path: '/'
	})
}

export function getSessionTokenCookie(event: RequestEvent): string | null {
	return event.cookies.get(SESSION_COOKIE_NAME) ?? null
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.set(SESSION_COOKIE_NAME, '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/'
	})
}

export function setRedirectUrlCookie(event: RequestEvent) {
	event.cookies.set(REDIRECT_COOKIE_NAME, event.url.pathname, {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 5, // 5 minutes
		path: '/'
	})
}

export function getRedirectUrlCookie(event: RequestEvent): string | null {
	return event.cookies.get(REDIRECT_COOKIE_NAME) ?? null
}

export function clearRedirectUrlCookie(event: RequestEvent) {
	event.cookies.set(REDIRECT_COOKIE_NAME, '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/'
	})
}
