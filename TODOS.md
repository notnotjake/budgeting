- change email let password managers know of change

- configure proper migrations for railway deployment

- in settings: visual glitch of toolbar when opening/closing any bitsui items

- new account, sticky onboarding (stays up until completed)

* reauth full functionality (with preauth and on action return error)

* organization and sharing
  when you want a resource to be shared between users
  allow an organization role that can manage users under them
  needed for billing

- autumn pricing page

- refactor structured response to be more like go and the proposed `?=` typescript behavior

## tools

posthog product analytics: tracking, feature flags, feedback

customer support: featurebase, plain, dovetail

sentry error tracking

axiom/open telemetry logging

## future

- support phone number identifier

* permissions and roles utilities

* track from unauthenticated session to authenticated session
  want a way to save something associated with a session id and then update that reference when session is authenticated

* admin controls
  impersonate user
  update user
  ban user
  lock user as admin

* multiple sessions
  be logged into multiple accounts on one browser
