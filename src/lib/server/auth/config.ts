import { defineConfig } from './index'
import { sendAuthEmail } from '$lib/server/email/account'

// const DAY_IN_MS = 24 * 60 * 60 * 1000
// const MIN_IN_MS = 60 * 1000

export default defineConfig({
	emails: {
		sendLoginCodeNewUser: sendAuthEmail.loginCodeNewUser,
		sendLoginCodeExistingUser: sendAuthEmail.loginCodeExistingUser,
		sendReauthCode: sendAuthEmail.reauthCode,
		sendChangeEmailCode: sendAuthEmail.changeEmailCode,
		sendEmailDidChangeNotification: sendAuthEmail.emailDidChangeNotification,
		sendAccountDeletionCompleted: sendAuthEmail.accountDeletionCompleted
	}
})
