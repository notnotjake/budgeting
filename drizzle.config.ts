import { defineConfig } from 'drizzle-kit'

console.log('=== Drizzle Config Debug ===')
console.log('DB_URL exists:', !!process.env.DB_URL)
console.log('DB_URL length:', process.env.DB_URL?.length ?? 0)
console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('DB')))
console.log('============================')

if (!process.env.DB_URL) throw new Error('DB_URL is not set')

export default defineConfig({
	out: './db/migrations',
	schema: './src/lib/server/db/schema',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DB_URL },
	verbose: true,
	strict: true
})
