import { sendLoginCode, sendReauthCode, sendEmailChangeCode } from './sending'

import {
	generateToken,
	hashToken,
	generateShortCode,
	hashShortCode,
	verifyShortCodesMatch,
	generateRandomName,
	normalizeIdentifierInput
} from './utils'

import {
	setSessionTokenCookie,
	getSessionTokenCookie,
	clearSessionTokenCookie,
	setRedirectUrlCookie,
	getRedirectUrlCookie,
	clearRedirectUrlCookie,
	consumeRedirectUrlCookie
} from './cookies'

import {
	createSession,
	authenticateSession,
	validateSessionToken,
	listAllUserSessions,
	invalidateSession,
	invalidateAllUserSessions,
	cleanupSessions
} from './sessions'

import { createUser, updateUser, deleteUser, getUser, userExists, setUserLockStatus } from './users'

import {
	createPasskey,
	getPasskeyCredential,
	getPasskeyUser,
	userHasPasskeyAvailable,
	listUserPasskeys,
	deletePasskey,
	updatePasskeyName
} from './keys'

import {
	createChallenge,
	getChallenge,
	cleanupLoginChallenges,
	cleanupChallengesByType,
	cleanupExpiredChallenges
} from './challenges'

const AuthCore = {
	// Sending
	sendLoginCode,
	sendReauthCode,
	sendEmailChangeCode,

	// Utils
	generateToken,
	hashToken,
	generateShortCode,
	hashShortCode,
	verifyShortCodesMatch,
	generateRandomName,
	normalizeIdentifierInput,

	// Cookies
	setSessionTokenCookie,
	getSessionTokenCookie,
	clearSessionTokenCookie,
	setRedirectUrlCookie,
	getRedirectUrlCookie,
	clearRedirectUrlCookie,
	consumeRedirectUrlCookie,

	// Sessions
	createSession,
	authenticateSession,
	validateSessionToken,
	userHasPasskeyAvailable,
	listAllUserSessions,
	invalidateSession,
	invalidateAllUserSessions,
	cleanupSessions,

	// Users
	createUser,
	updateUser,
	deleteUser,
	getUser,
	userExists,
	setUserLockStatus,

	// Keys
	createPasskey,
	getPasskeyCredential,
	getPasskeyUser,
	listUserPasskeys,
	deletePasskey,
	updatePasskeyName,

	//Challenges
	createChallenge,
	getChallenge,
	cleanupLoginChallenges,
	cleanupChallengesByType,
	cleanupExpiredChallenges
}

export default AuthCore

export { normalizeIdentifierInput }
