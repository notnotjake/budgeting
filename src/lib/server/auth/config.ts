// import { defineConfig } from '@opensky/auth'

export default defineConfig({
	redirects: {
		afterLogin: '/app',
		afterLogout: '/',
		afterAccountCreated: '/welcome'
	},
	codeExpirationTimeMins: 10
})
