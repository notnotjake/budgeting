import { redirect, type ServerLoad } from '@sveltejs/kit'
import Auth from '$lib/server/auth'

export const load: ServerLoad = async (event) => {
	const hasHomepageIntent = event.cookies.get('homepageIntent')

	if (event.locals.user && !hasHomepageIntent) {
		throw redirect(303, Auth.redirects.afterLogin)
	}
}
