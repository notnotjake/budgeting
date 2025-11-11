import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async () => {
	// Forces the hooks to run
	return
}
