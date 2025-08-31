import { sections, items } from '../../src/lib/server/db/schema'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

export async function seedInventory(db: PostgresJsDatabase<typeof import('../../src/lib/server/db/schema')>) {
	// Create sections
	const [prewireSection] = await db
		.insert(sections)
		.values({ title: 'Prewire & Cable' })
		.returning()

	const [faceplateSection] = await db
		.insert(sections)
		.values({ title: 'Faceplate & Trimout' })
		.returning()

	const [alarmSection] = await db.insert(sections).values({ title: 'Alarm/Security' }).returning()

	const [laborSection] = await db.insert(sections).values({ title: 'Labor' }).returning()

	const [centralVacSection] = await db.insert(sections).values({ title: 'Central Vac' }).returning()

	const [soundAvSection] = await db
		.insert(sections)
		.values({ title: 'Sound, AV, & Automation' })
		.returning()

	const [cableEndsSection] = await db
		.insert(sections)
		.values({ title: 'Cable Ends & Jacks' })
		.returning()

	// Prewire & Cable items
	const prewireItems = [
		{ name: '1G LV NAIL ON', cost: '900.00', quantityType: 'whole_unit' },
		{ name: '1 1/2" INNER DUCT (ORG)', cost: '0.00', quantityType: 'ft' },
		{ name: '1G LV RING (LV-1)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '2G LV RING (LV-2)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'SPEAKER LV RING', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '1G VINYL BLOCK WP BOX', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '14X14 DISTR BOX', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '14X14 DISTR DOOR', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '8" TIE WRAPS', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'ROMEX STAPLES', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'NAIL PLATE', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'CAT5E RISER CABLE', cost: '0.00', quantityType: 'ft' },
		{ name: 'CAT6 RISER CABLE', cost: '0.00', quantityType: 'ft' },
		{ name: 'RG6 COAX CABLE', cost: '0.00', quantityType: 'ft' },
		{ name: '22/2 SPEAKER CABLE', cost: '0.00', quantityType: 'ft' },
		{ name: '22/4 SPEAKER CABLE', cost: '0.00', quantityType: 'ft' },
		{ name: '18/2 SPEAKER CABLE', cost: '0.00', quantityType: 'ft' },
		{ name: '18/4 SPEAKER CABLE', cost: '0.00', quantityType: 'ft' },
		{ name: '16/2 SPEAKER CABLE', cost: '0.00', quantityType: 'ft' },
		{ name: 'Cat5e Burial reed', cost: '0.00', quantityType: 'ft' },
		{ name: 'FIBER', cost: '0.00', quantityType: 'ft' }
	]

	for (const item of prewireItems) {
		await db.insert(items).values({
			sectionId: prewireSection.id,
			...item
		})
	}

	// Faceplate & Trimout items
	const faceplateItems = [
		{ name: 'FP 1G 1P KEYSTONE', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP 1G 2P KEYSTONE', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP 1G 4P KEYSTONE', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP 1G 6P KEYSTONE', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP 1G BLANK', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP 2G BLANK', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP 1G BRUSH', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP 1G F CONN', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP 1G TELCO', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP 1G TELCO & F CONN', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP (2) GANG DECORA/GFCI', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP (3) GANG DECORA/GFCI', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FP (4) GANG DECORA/GFCI', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'MEDIA PANEL 1X8 COAX SPLITTER', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'COAX 1 X ( ) SPLITTER', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'MEDIA PANEL 8 PORT VOICE HUB', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'IR KIT/RCVR/3.5/PS', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '12 PORT FP 2G WHITE', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'Floor Box', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '2P yoke', cost: '0.00', quantityType: 'whole_unit' }
	]

	for (const item of faceplateItems) {
		await db.insert(items).values({
			sectionId: faceplateSection.id,
			...item
		})
	}

	// Alarm/Security items
	const alarmItems = [
		{ name: 'GC3 panel', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'Edge Panel', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'DW contact', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'PIR motion', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'Keyfob', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'Verizon cell radio', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'Glass break', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'Firefighter', cost: '0.00', quantityType: 'whole_unit' }
	]

	for (const item of alarmItems) {
		await db.insert(items).values({
			sectionId: alarmSection.id,
			...item
		})
	}

	// Labor items
	const laborItems = [
		{ name: 'Mechanic labor', cost: '0.00', quantityType: 'hrs' },
		{ name: 'Helper labor', cost: '0.00', quantityType: 'hrs' },
		{ name: 'Pete labor', cost: '0.00', quantityType: 'hrs' },
		{ name: 'Rob labor', cost: '0.00', quantityType: 'hrs' },
		{ name: 'Cade labor', cost: '0.00', quantityType: 'hrs' }
	]

	for (const item of laborItems) {
		await db.insert(items).values({
			sectionId: laborSection.id,
			...item
		})
	}

	// Central Vac items
	const centralVacItems = [
		{ name: '3 INLET ROUGHIN KIT (NO PIPE)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'VAC WALL INLET (ROUGHIN)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: "VAC PIPE 8' SECTION", cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'FLEX TUBING 36"', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'ROLL OF PLAST STRAP (By FT)', cost: '0.00', quantityType: 'ft' },
		{ name: '18/2 CABLE(By FT)', cost: '0.00', quantityType: 'ft' },
		{ name: 'PVC GLUE (By Can)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'COUPLING', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'SHORT 90 ELBOW', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'LONG 90 ELBOW', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'STREET 90 ELBOW', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '45 ELBOW', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'STREET 45 ELBOW', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '90 T-Y', cost: '0.00', quantityType: 'whole_unit' },
		{ name: '45 Y', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'TUBING END CAP', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'VAC WALL INLET (TRIMOUT)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'VAC PAN (KICK SPACE)', cost: '0.00', quantityType: 'whole_unit' }
	]

	for (const item of centralVacItems) {
		await db.insert(items).values({
			sectionId: centralVacSection.id,
			...item
		})
	}

	// Sound, AV, & Automation items
	const soundAvItems = [
		{ name: 'C641 speakers (pair)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'C651 center (each)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'IW530 in-wall (each)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'C635 outdoor (pair)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'PS8 8" subwoofer', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'HDMI 12', cost: '0.00', quantityType: 'whole_unit' }
	]

	for (const item of soundAvItems) {
		await db.insert(items).values({
			sectionId: soundAvSection.id,
			...item
		})
	}

	// Cable Ends & Jacks items
	const cableEndsItems = [
		{ name: 'F CONN CRIMP (Klein brand)', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'RJ45 EZ-CRIMP', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'CAT5E KEYSTN INSERT', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'CAT6 KEYSTN INSERT', cost: '0.00', quantityType: 'whole_unit' },
		{ name: 'F CONN KEYSTN INSERT', cost: '0.00', quantityType: 'whole_unit' }
	]

	for (const item of cableEndsItems) {
		await db.insert(items).values({
			sectionId: cableEndsSection.id,
			...item
		})
	}

	console.log('Inventory seed data inserted successfully!')
}

// Example usage - uncomment and run
// seedInventory()
