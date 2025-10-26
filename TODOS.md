# auth rewrite

need to add ratelimiting throughout api

whenever we save or update a user identifier, we should lowercase it before sending to database

whenever comparing an identifier to the database, we should lowercase the input (non database side) value

move all cleanup stuff out of side effects and instead scheduled with some cron job system.

## sessions
maybe instead we keep some persistance of all the identifiers they have been logged in with and so we can list those on the login screen anytime they are logging back in (including after a logout)


could also make a reauth component to do reauthentication inline on the page where you are trying to do something rather than throwing you to a different page

## future

- track from unauthenticated session to authenticated session
	want a way to save something associated with a session id and then update that reference when session is authenticated

- admin controls
	impersonate user
	update user
	ban user
	lock user as admin

- organization and sharing
	when you want a resource to be shared between users, how can we make that easier
	allow an organization role that can manage users under them

- multiple sessions
	be logged into multiple accounts on one browser
