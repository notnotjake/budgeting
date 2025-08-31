import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../../src/lib/server/db/schema'
import { seedInventory } from './inventory'

if (!process.env.DB_URL) throw new Error('DB_URL is not set')

// Create DB connection for seeding
const client = postgres(process.env.DB_URL)
const db = drizzle(client, { schema })

export async function seed() {
	console.log('🌱 Seeding database...')

	try {
		await seedInventory(db)
		console.log('✅ Database seeded successfully')
	} catch (error) {
		console.error('❌ Error seeding database:', error)
		throw error
	} finally {
		await client.end()
	}
}

// Run seeds if called directly
if (import.meta.main) {
	seed()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error(error)
			process.exit(1)
		})
}
