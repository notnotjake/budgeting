- move reauth to a component

- use bitsui dialog (or another primitive) for the settings pane
- use bitsui dialog (or similar) for detached setting views
- create a dialog-item component similar to accordion-item for setting views that render detached

settings:

    - passkeys:

    	- list actions menu
    	- remove
    	- rename
    	- add new passkey (dialog)

    - change email flow (dialog)

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
