# Security Audit Report

## sessions.ts

### [MEDIUM] No Session Device Fingerprinting
**Location:** `sessions.ts:30-31, 110-111`

Only IP and User-Agent are tracked for sessions, both easily spoofed. Add device fingerprinting by creating a hash from stable headers (IP, User-Agent, Accept-Language) and store it with the session. On session validation, compare fingerprints and invalidate or flag sessions with mismatches as potential hijacking attempts.

### [MEDIUM] Missing Session Validation on Authentication
**Location:** `sessions.ts:76-88`

When authenticating a session (unauthenticated → authenticated), there's no verification the request comes from the same device. An attacker could intercept an unauthenticated session token and authenticate it from a different IP. Add device validation during authentication by comparing IP/User-Agent with the original session, or use fingerprint similarity scoring with a threshold.

---

## challenges.ts

### [CRITICAL] No Rate Limiting on Challenge Creation
**Location:** `challenges.ts:20-51`

Attackers can create unlimited challenges, enabling email/SMS spam, database DoS, and brute force setup. Add rate limiting by checking recent challenge creation attempts (e.g., max 3 per minute per identifier) before inserting. Consider using Redis for faster rate limiting checks instead of database queries.

### [HIGH] Add rate limiting for failed challenges

when attempting to login, allow for maybe _10 failed attempts per day_ via rate limiting.

add rate limits to attempts (even successful)

### [MEDIUM] Identifier Not Normalized
**Location:** `challenges.ts:39, 126, 166`

Identifiers aren't normalized to lowercase, allowing rate limit bypasses by changing case. Normalize all identifiers using `.toLowerCase().trim()` in `createChallenge()`, `getChallenge()`, and `cleanupLoginChallenges()` for consistency with user creation.

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

## Cross-File Issues

### Input Sanitization Layer
Consider adding a centralized input validation layer to sanitize and normalize all inputs (emails, identifiers) before they reach the auth core functions.

### Logging/Audit Trail
Implement comprehensive audit logging for all authentication events (logins, failed attempts, session creation/invalidation) to detect patterns and respond to security incidents.
