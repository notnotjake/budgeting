import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase64url } from '@oslojs/encoding'

export function generateToken(byteLength: number = 32): string {
	const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
	return encodeBase64url(bytes)
}

export function generateShortCode(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(4))
	const int = new DataView(bytes.buffer).getUint32(0, true) % 1000000
	return int.toString().padStart(6, '0')
}

export function hashToken(token: string): string {
	return encodeBase64url(sha256(new TextEncoder().encode(token)))
}

export function generateRandomName(): string {
	const adjectives = ['Curious', 'Brave', 'Swift', 'Strong', 'Witty', 'Fierce']
	const animals = ['Phoenix', 'Cat', 'Fox', 'Bear', 'Wolf', 'Owl', 'Tiger', 'Panda', 'Hawk', 'Deer']

	const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
	const randomAnimal = animals[Math.floor(Math.random() * animals.length)]

	return `${randomAdjective} ${randomAnimal}`
}
