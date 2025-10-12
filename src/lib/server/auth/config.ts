// import { defineConfig } from '@opensky/auth'

export default defineConfig({
	redirects: {
		afterLogin: '/app',
		afterLogout: '/',
		afterAccountCreated: '/welcome'
	},
	codeExpirationTimeMins: 10,
	emails: {
		verifyEmail: ({ email, token, type }) => {} // allows you to implement each email flow
	}
})
