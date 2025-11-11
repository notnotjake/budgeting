import { sendEmail } from '../send'
import type {
	sendCodeParams,
	sendEmailDidChangeParams,
	sendAccountDeletionCompletedParams
} from '$lib/server/auth/types'

import EmailDidChange from './templates/email-did-change'
import AuthCode from './templates/auth-code'
import AccountDeleted from './templates/account-deleted'

const SEND_FROM = 'LightDance <accounts@resend.notnotjake.com>'

export async function loginCodeNewUser({ email, code, timezone, maxAgeMins }: sendCodeParams) {
	const headingText = 'Create your account'
	const descriptiveText = 'Use this code to activate your account'
	const preview = `Use code ${code} to finish creating your account. This code is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: SEND_FROM,
			to: email,
			subject: 'Verify Email',
			react: AuthCode({ code, timezone, maxAgeMins, headingText, descriptiveText, preview })
		},
		`New user code: ${code}`
	)

	if (!result?.success) {
		throw Error()
	}

	return
}

export async function loginCodeExistingUser({ email, code, timezone, maxAgeMins }: sendCodeParams) {
	const headingText = 'Log in to your account'
	const descriptiveText = 'Use this code to securely log in'
	const preview = `Use code ${code} to securely log in to your account. This code is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: SEND_FROM,
			to: email,
			subject: 'Login Code',
			react: AuthCode({ code, timezone, maxAgeMins, headingText, descriptiveText, preview })
		},
		`Login code: ${code}`
	)

	if (!result?.success) {
		throw Error()
	}

	return
}

export async function reauthCode({ email, code, timezone, maxAgeMins }: sendCodeParams) {
	const headingText = 'Authorization Code'
	const descriptiveText = `Use this code to authorize account action`
	const preview = `Use code ${code} to authorize account action. This code is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: SEND_FROM,
			to: email,
			subject: 'Authorization Code',
			react: AuthCode({ code, timezone, maxAgeMins, headingText, descriptiveText, preview })
		},
		`Authorization code: ${code}`
	)

	if (!result?.success) {
		throw Error()
	}

	return
}

export async function changeEmailCode({ email, code, timezone, maxAgeMins }: sendCodeParams) {
	const headingText = 'Confirm New Email'
	const descriptiveText = 'Use this code to confirm your new email address.'
	const preview = `To update your email, confirm with the code ${code}. This code is available for ${maxAgeMins} minutes`

	const result = await sendEmail(
		{
			from: SEND_FROM,
			to: email,
			subject: 'Confirm New Email',
			react: AuthCode({ code, timezone, maxAgeMins, headingText, descriptiveText, preview })
		},
		`Confirm email change: ${code}`
	)

	if (!result?.success) {
		throw Error()
	}

	return
}

// TODO: modify template to accept lock link token url and display max age
export async function emailDidChangeNotification({
	email,
	updatedEmail,
	lockLink
}: sendEmailDidChangeParams) {
	const result = await sendEmail(
		{
			from: SEND_FROM,
			to: email,
			subject: 'Email Changed',
			react: EmailDidChange({ updatedEmail, lockLink })
		},
		`Email changed. FROM:${email} >> TO:${email}`
	)

	if (!result?.success) {
		throw Error()
	}

	return
}

// TODO: create template for account deletion notification
export async function accountDeletionCompleted({ email }: sendAccountDeletionCompletedParams) {
	const result = await sendEmail(
		{
			from: SEND_FROM,
			to: email,
			subject: 'Email Changed',
			react: AccountDeleted({ email })
		},
		`User ${email} deleted`
	)

	if (!result?.success) {
		throw Error()
	}

	return
}

export const sendAuthEmail = {
	loginCodeNewUser,
	loginCodeExistingUser,
	reauthCode,
	changeEmailCode,
	emailDidChangeNotification,
	accountDeletionCompleted
}
