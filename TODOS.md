- change email flow

- hint text on passkeys and sessions (currently hard coded)
  maybe should have a remote for settings context that handles user name, email, profile pic, and these hints and other settings.

- visual oddity when opening passkey context menu, the settings title goes behind the profile pic

* passkeys: remove
* passkeys: rename
* welcome page

* support phone number identifier
* reauth full functionality (with preauth and on action return error)

* error handling

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
