# Auth Todo's

### [MEDIUM] Missing Session Validation on Authentication

**Location:** `sessions.ts:76-88`

When authenticating a session (unauthenticated → authenticated), there's no verification the request comes from the same device. An attacker could intercept an unauthenticated session token and authenticate it from a different IP. Add device validation during authentication by comparing IP/User-Agent with the original session, or use fingerprint similarity scoring with a threshold.

---

## schema.ts

### [HIGH] Session UserId Not Indexed

**Location:** `schema.ts:24`

Queries filtering by `userId` (like `listAllUserSessions()` and `invalidateAllUserSessions()`) will do full table scans without an index, causing slow queries and potential DoS. Add indexes on `userId`, `expiresAt`, and `invalidatedAt`, plus a composite index on `(userId, expiresAt)` for active session queries.

### [HIGH] Challenge Queries Will Be Slow

**Location:** `schema.ts:46`

Queries filtering by `identifier`, `sessionId`, `type`, and `expiresAt` lack indexes, causing table scans. Add composite indexes: `(identifier, type)` for lookups, `(sessionId, type)` for session queries, `expiresAt` for cleanup, and `(identifier, type, createdAt)` for rate limiting checks.

### [MEDIUM] No Partial Index for Active Sessions

**Location:** `schema.ts:23-33`

Active session queries could be faster with a partial index. Add a partial index on `(userId, expiresAt)` with a `WHERE invalidatedAt IS NULL` condition to speed up active session lookups and reduce index size.

---

### Rate Limiting

Add comprehensive rate limiting to all endpoints

### Normalize Identifier

use normalizeIdentifier() everywhere used to ensure no issues

### Logging/Audit Trail

Implement comprehensive audit logging for all authentication events (logins, failed attempts, session creation/invalidation) to detect patterns and respond to security incidents.

### Input Sanitization Layer

Consider adding a centralized input validation layer to sanitize and normalize all inputs (emails, identifiers) before they reach the auth core functions.
