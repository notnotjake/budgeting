import { defineConfig } from './index'

// const DAY_IN_MS = 24 * 60 * 60 * 1000
// const MIN_IN_MS = 60 * 1000

export default defineConfig({
	emails: {
		sendLoginCodeNewUser: async () => {},
		sendLoginCodeReturningUser: async () => {},
		sendEmailChangeCode: async () => {},
		sendEmailDidChangeNotification: async () => {},
		sendAccountDeletionCompleted: async () => {}
	}
})
