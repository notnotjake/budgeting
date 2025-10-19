lock function is exposed to users after their account email has changed

this feature could be expanded in the future though

this route will be called with a query param which is a token. we then lookup challenge by challenge (the hashed value of the token) and confirm that the retrieved challenge is of the correct type (lock account). we can then retrieve the identifier and thus user from that challenge

this means that the lock account challenge has to be associated with the user via the new identifier. what if they change the email again? we could set a ratelimit for changing account email so they have to wait >2 days to change it again (giving the lock time to protect the account). or we could modify challenges to optionally reference user by id rather than identifier since those are stable.

well actually could lookup challenges to see if there are any active lock challenges and not allow change email if one exists because it needs to have time to be redeemed.

once we get the user, we can then set the lock to true on that user and then the account will be locked and on the lock page we can have some ui to help the user get in touch with support to handle the situation.
