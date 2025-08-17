# Anti-Cheat & Abuse Specification
Version: 1.0
Status: Developer-ready

## Purpose
Protect game integrity with server-authoritative checks, rate limits, idempotency, and behavior heuristics. Keep it simple and effective without burdening honest players.

---

## Threat Model
- Client tampering (editing ship stats, credits, stock).
- Replay/duplication (double-spend, duplicate request).
- Automation/bots (unhuman turn cadence).
- Collusion and boosting (kill trading, bounty laundering).
- Feed spoofing and info leakage.

---

## Controls

### 1) Server Authoritative
- All gameplay mutations via Cloud Functions only.
- Canonical math executed server-side (economy, combat, missions).
- Firestore rules deny direct writes to protected collections.

### 2) Idempotency
- Every mutation call includes `requestId` stored per player for 24h.
- Duplicate request returns the first result; no second write.

### 3) Rate Limits
- Per endpoint limits as defined in API spec.
- Burst ceilings and sliding windows.
- Return `ERR_RATE_LIMIT` with retry hints.

### 4) Economic Integrity
- Double-entry style audit for all credit deltas.
- Trade transactions atomically adjust stock and cargo.
- Price re-computed from post-trade stock to block ping-pong.
- Embargo, tax, and spread enforced server-side only.

### 5) Turn Integrity
- Turn costs checked atomically with the action.
- 0 turns cannot initiate movement or combat.
- Daily reset reconciles turns to exactly 250.

### 6) Combat Integrity
- Resolve instant math server-side.
- Prevent initiation if either ship is DISABLED or in invulnerability window.
- Retreat cooldown to avoid spam.

### 7) Bounty Integrity
- Disallow self-bounties and same-corp claims.
- Cooldown between repeated claims on same target.
- Server checks proof-of-kill binding to combat log.

### 8) NPC Integrity
- NPC outcomes generated server-side; no client control of rewards or spawns.
- Loot tables bounded and region-gated.

### 9) Behavior Heuristics
- Flag if:
  - 10+ identical trades within 30 seconds.
  - Repeated PvP kills of same target within 1 hour.
  - Net credits delta exceeds 3 standard deviations per hour.
  - requestId reuse over 1 percent in a day.
  - Movement at sustained intervals under 200 ms for 60 seconds (bot-like).
- Actions:
  - Step 1: soft warn and require re-auth.
  - Step 2: temporary restrict high-impact endpoints.
  - Step 3: shadow ban from leaderboards.
  - Step 4: hard ban; record in audits.

### 10) App Check and Device Signals
- Require App Check on all calls; reject if missing or invalid.
- Optionally sample device fingerprints (Expo constants) with privacy notice for abuse triage.

### 11) Feed Safety
- All Feed posts originate server-side with templates.
- Delay 1 to 3 minutes and dedupe to reduce tracking.
- Never include sector IDs or precise times in player-related messages.

### 12) Corp Abuse
- Enforce 24h cooldown on leave/join to prevent asset hopping.
- Audit corp bank spends and require officer role.
- Cap corp mission rewards per hour.

---

## Auditing
- Write `/audits` for every mutation with actor, target, delta.
- Keep 90 days online; archive to cold storage after.

---

## Appeals
- Provide a simple support email template in Settings.
- Store ban reason codes; surface to user.

---

## Testing
- Emulator tests for denied writes to protected collections.
- Fuzz tests for negative stock/credits.
- Synthetic bot tests for movement/combat cadence.

---

End of spec.
