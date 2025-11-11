export const ERROR_MESSAGE = {
	// Generic errors
	UNAUTHORIZED: 'Unauthorized',
	FORBIDDEN: 'Forbidden',
	RATE_LIMITED: 'Too many requests',
	GENERIC: 'Operation failed',

	CORE: {
		// User errors
		USER_CREATE_FAILED: 'Failed to create user',
		USER_UPDATE_FAILED: 'Failed to update user',
		USER_DELETE_FAILED: 'Failed to delete user',
		USER_NOT_FOUND: 'User not found',
		USER_LOOKUP_FAILED: 'Failed to lookup user',
		USER_LOCK_FAILED: 'Failed to update lock status',
		USER_NO_FIELDS_TO_UPDATE: 'No fields to update',

		// Session errors
		SESSION_CREATE_FAILED: 'Failed to create session',
		SESSION_AUTHENTICATE_FAILED: 'Failed to authenticate session',
		SESSION_VALIDATE_FAILED: 'Failed to validate session',
		SESSION_INVALIDATE_FAILED: 'Failed to invalidate session',
		SESSION_INVALIDATE_ALL_FAILED: 'Failed to invalidate all sessions',
		SESSION_LIST_FAILED: 'Failed to retrieve sessions',
		SESSION_CLEANUP_FAILED: 'Failed to cleanup sessions',
		SESSION_NOT_FOUND: 'Session not found',
		SESSION_INVALID: 'Session is invalid',
		SESSION_EXPIRED: 'Session has expired',

		// Challenge errors
		CHALLENGE_CREATE_FAILED: 'Failed to create challenge',
		CHALLENGE_GET_FAILED: 'Failed to retrieve challenge',
		CHALLENGE_CLEANUP_FAILED: 'Failed to cleanup challenges',
		CHALLENGE_INVALID: 'Challenge is invalid',
		CHALLENGE_EXPIRED: 'Challenge has expired',

		// Key/Passkey errors
		KEY_CREATE_FAILED: 'Failed to create passkey',
		KEY_GET_FAILED: 'Failed to get passkey',
		KEY_LIST_FAILED: 'Failed to list passkeys',
		KEY_DELETE_FAILED: 'Failed to delete passkey',
		KEY_UPDATE_FAILED: 'Failed to update passkey',
		KEY_NOT_FOUND: 'Passkey not found'
	},

	API: {
		// Hooks
		AUTHENTICATION_HOOK: 'Authentication hook error',
		PROTECTED_HOOK: 'Protected route hook error'
	}
} as const
