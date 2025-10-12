import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase64url } from '@oslojs/encoding'
import { hash, verify } from '@node-rs/argon2'

const HASHING_OPTIONS_SHORT_CODE = {
	memoryCost: 4096,
	timeCost: 1,
	outputLen: 32,
	parallelism: 1
}

export function generateToken(byteLength: number = 32): string {
	const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
	return encodeBase64url(bytes)
}

export function hashToken(token: string): string {
	return encodeBase64url(sha256(new TextEncoder().encode(token)))
}

export function generateShortCode(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(4))
	const int = new DataView(bytes.buffer).getUint32(0, true) % 1000000
	return int.toString().padStart(6, '0')
}

export async function hashShortCode(code: string): Promise<string> {
	return await hash(code, HASHING_OPTIONS_SHORT_CODE)
}

export async function verifyShortCodesMatch({
	savedCode,
	inputCode
}: {
	savedCode: string
	inputCode: string
}): Promise<boolean> {
	return await verify(savedCode, inputCode, HASHING_OPTIONS_SHORT_CODE)
}

export function generateRandomName(): string {
	const adjectives = ['Curious', 'Brave', 'Swift', 'Strong', 'Witty', 'Fierce']
	const animals = ['Phoenix', 'Cat', 'Fox', 'Bear', 'Wolf', 'Owl', 'Tiger', 'Panda', 'Hawk', 'Deer']

	const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
	const randomAnimal = animals[Math.floor(Math.random() * animals.length)]

	return `${randomAdjective} ${randomAnimal}`
}
