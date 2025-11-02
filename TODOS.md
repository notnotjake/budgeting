- improve spacing of passkey and email code on login

- move reauth to a component

settings:
	- list passkeys
	- passkey list actions: remove, rename
	- add new passkey
	- list sessions
	- invalidate all sessions
	- invalidate specific session
	- change email flow
	- update name

- lock account
- rate limits
- error handling
- setup cron for cleanups

- welcome page

## future

- permissions and roles utilities

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
