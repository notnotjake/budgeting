### Setup

##### Update app.d.ts

Add `import type { User, Session } from '$lib/server/auth/schema'`

Update Locals:

```ts
interface Locals {
	user: User | null
	session: Session | null
}
```

##### Update Drizzle schema

You will need `{ user, session, key, challenge }` from `$lib/server/auth/schema.ts` but you must use relative import because svelte alias' do not work with drizzle.

You will want to migrate once you've setup the schema.

##### Setup config

Edit config options in `$lib/server/auth/config.ts`

Emails and passkeys options must be configured. Addiitional options are optional including routes, redirects and durations.

##### Add hooks

In your `hooks.server.ts` you will want to use `Auth.hooks.handleAuthentication` and `Auth.hooks.handleProtected` using SvelteKit `sequence`

```ts
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import Auth from '$lib/server/auth'

export const handle: Handle = sequence(
	// Your other hooks...
	Auth.hooks.handleAuthentication,
	Auth.hooks.handleProtected
	// Your other hooks running after...
)
```

handleAuthentication handles adding a session and user to the event locals by checking the event cookies and calling the database.

handleProtected can redirect requests away from a `(protected)` group in your routes if setup properly. Any request to, for example, `/(protected)/settings` would be checked and if no user is attached to the request, then would redirect them to login. For this to work you need a `+layout.server.ts` with a server load at the root of your (protected) route group. The location of this protected group can be changed in config (`routes.protectedGroup`).

##### Setup routes

Setup login

Setup reauth

Setup settings

##### Use Auth.protect

requireSession ensures that a session is associated with the request and makes it available. Can be used to associate actions before a user logs in.
