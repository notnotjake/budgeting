import { sendLoginCode, sendReauthCode } from './sending'

import {
	generateToken,
	hashToken,
	generateShortCode,
	hashShortCode,
	verifyShortCodesMatch,
	generateRandomName
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
	cleanupDuplicateLoginChallenges,
	cleanupExpiredChallenges
} from './challenges'

const AuthCore = {
	// Sending
	sendLoginCode,
	sendReauthCode,

	// Utils
	generateToken,
	hashToken,
	generateShortCode,
	hashShortCode,
	verifyShortCodesMatch,
	generateRandomName,

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
	cleanupDuplicateLoginChallenges,
	cleanupExpiredChallenges
}

export default AuthCore
