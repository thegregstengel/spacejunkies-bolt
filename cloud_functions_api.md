# Cloud Functions API (Server Contracts)
Version: 1.0
Status: Developer-ready

## Purpose
Define the **server-side callable API** for Space Junkies. All gameplay mutations go through Cloud Functions to keep logic server‑authoritative, consistent with the Firestore schema and security rules.

---

## Principles
- **Server-authoritative:** Clients never write game-critical fields directly.
- **Idempotent:** All mutating calls accept a `requestId` to safely retry.
- **Atomic:** Use Firestore transactions for read‑modify‑write sequences.
- **Audited & Telemetry:** Every mutation writes audit + telemetry entries.
- **Privacy-first:** Responses return only sanitized data needed by clients.
- **App Check required:** All calls enforce valid App Check tokens.
- **Rate limited:** Per‑UID QPS and burst limits per endpoint.

---

## Common Envelopes

### Request
```json
{
  "requestId": "string",     // client-generated, unique per action
  "galaxyId": "string",      // required for gameplay calls
  "payload": { /* endpoint-specific */ }
}
```

### Response
```json
{
  "ok": true,
  "t": "2025-08-15T00:00:00Z",
  "data": { /* endpoint-specific */ },
  "warnings": ["optional"]
}
```

### Error Format
```json
{
  "ok": false,
  "code": "ERR_CODE",
  "message": "Human-readable context",
  "retryAfterSec": 0
}
```

Common error codes: `ERR_NO_TURNS`, `ERR_FUNDS`, `ERR_COOLDOWN`, `ERR_RATE_LIMIT`, `ERR_NOT_FOUND`, `ERR_OWNERSHIP`, `ERR_CONFLICT`, `ERR_INVALID`, `ERR_FORBIDDEN`, `ERR_SEASON_ENDED`.

---

## Auth & Profile

### auth.bootstrap
- Purpose: Initialize player profile on first login.
- Payload: `{ displayName }`
- Validations: new user only.
- Effects: create `/players/{playerId}`.
- Response: `{ playerId, galaxyId?:null }`

### player.updateProfile
- Purpose: Update display name / privacy flags.
- Payload: `{ displayName?, privacy?:{hideNameInFeed?:bool} }`
- Validations: owner only; sanitize name.
- Effects: patch `/players/{playerId}`.
- Response: `{ displayName, privacy }`

---

## Galaxy Lifecycle

### galaxy.create
- Purpose: Create a new galaxy with settings.
- Payload: `{ name, visibility:"public"|"private", difficulty, pvpEnabled:bool }`
- Validations: creator has no active galaxy binding.
- Effects: seed generation, write `/galaxies`, `/sectors`, etc.
- Response: `{ galaxyId }`

### galaxy.join
- Purpose: Join an existing galaxy.
- Payload: `{ galaxyId }`
- Validations: player not bound to a different active galaxy.
- Effects: bind player.galaxyId; create starter ship, credits.
- Response: `{ galaxyId }`

### galaxy.leave
- Purpose: Leave the current galaxy (hard reset).
- Payload: `{ confirm:true }`
- Validations: hard confirm; wipe galaxy‑bound progress.
- Effects: delete per‑galaxy docs, keep profile history.
- Response: `{}`

---

## Movement & Scanning

### nav.move
- Purpose: Move to a linked sector.
- Payload: `{ fromSectorId, toSectorId }`
- Validations: link exists; player has ≥1 turn; not DISABLED.
- Effects: decrement turns; trigger NPC spawn rolls.
- Response: `{ sectorId, region, neighbors }`

### nav.scan
- Purpose: Scanner sweep for adjacent/known ports.
- Payload: `{ originSectorId, radius:1|2 }`
- Validations: has ≥1 turn; radius within scanner tier.
- Effects: consume 1 turn; enqueue delayed, fuzzed intel.
- Response: `{ scanId }`

### nav.resolveScan
- Purpose: Resolve a completed scan (after delay).
- Payload: `{ scanId }`
- Validations: ownership; TTL not expired.
- Effects: none.
- Response: `{ results:[{portId, approxPrices, lastUpdated}] }`

---

## Ports & Trading

### trade.buy
- Purpose: Buy commodity from port.
- Payload: `{ portId, commodity:"fuel"|"organics"|"equipment", units:int }`
- Validations: in same sector, docked, holds available, port stock > 0.
- Effects: transaction to update `/ports.stock`, `/ports.flow`, add `/cargo_lots`.
- Response: `{ unitPrice, tax, total, post:{stock, price} }`
- Errors: `ERR_NO_STOCK`, `ERR_NO_CARGO_SPACE`

### trade.sell
- Purpose: Sell cargo lot to port.
- Payload: `{ portId, lotId, units:int }`
- Validations: owner of lot; units ≤ lot.units.
- Effects: transaction to add stock, remove/adjust lot, update flow.
- Response: `{ unitPrice, tax, total, post:{stock, price} }`

### bank.deposit / bank.withdraw
- Purpose: Move credits between ship and bank.
- Payload: `{ amount:int }`
- Validations: funds check.
- Effects: update `/players.bank` atomically.
- Response: `{ bank:{credits}, wallet:{credits} }`

---

## Shipyard & Ships

### ship.purchase
- Purpose: Buy a ship class.
- Payload: `{ yardId, classKey, nickname? }`
- Validations: regional availability, faction lock, XP thresholds, yard stock > 0, credits.
- Effects: create `/ships` doc; decrement yard stock; charge credits.
- Response: `{ shipId }`

### ship.tradeIn
- Purpose: Sell current ship and pick a new one.
- Payload: `{ yardId, classKey }`
- Validations: same as `ship.purchase` plus ownership of source ship.
- Effects: compute trade‑in (60% base + 40% upgrades), retain cargo; create new ship.
- Response: `{ shipId, creditDelta }`

### ship.upgrade
- Purpose: Upgrade a stat (holds|shields|fighters|torps).
- Payload: `{ shipId, stat:"holds"|"shields"|"fighters"|"torps" }`
- Validations: caps per class; cost curve; credits.
- Effects: increment upgrade level; charge credits.
- Response: `{ ship:{stats, upgrades}, credits }`

### ship.rename
- Purpose: Rename ship.
- Payload: `{ shipId, name }`
- Validations: ownership; profanity filter.
- Effects: update name (fee).
- Response: `{ name }`

---

## Combat

### combat.initiate
- Purpose: Start combat against a target (player or NPC).
- Payload: `{ targetId, targetType:"player"|"npc" }`
- Validations: same sector; attacker has ≥1 turn; defender not docked; cooldowns.
- Effects: may trigger defender retreat check; reserve combat session; spend 1 turn.
- Response: `{ combatId }`

### combat.resolve
- Purpose: Resolve instant combat math.
- Payload: `{ combatId }`
- Validations: session valid and fresh; both ships status OK.
- Effects: apply results; set loser DISABLED; move loot; write `/combat` log; post Feed.
- Response: `{ winner:"A"|"D"|"escape", loot, attrition }`

### combat.repair
- Purpose: Repair a disabled ship.
- Payload: `{ shipId, mode:"field_kit"|"tow"|"shipyard" }`
- Validations: credits, mode rules, truce windows.
- Effects: update ship status; charge credits; timers if tow.
- Response: `{ status:"OK", credits }`

---

## Deployables

### deploy.place
- Purpose: Place sector defenses.
- Payload: `{ sectorId, type:"fighter"|"mine"|"drone"|"turret"|"buoy"|"cloak", count:int, corpTagged?:bool }`
- Validations: has items as cargo; sector caps; cloak uniqueness; consume 1 turn.
- Effects: move from cargo to `/deployables`; update `/sectors.defenses` aggregate.
- Response: `{ defenses }`

### deploy.clear
- Purpose: Owner clears own deployables.
- Payload: `{ sectorId, type, count }`
- Validations: ownership/corp role.
- Effects: decrement counts; optionally return to cargo (loss factor).
- Response: `{ defenses }`

(Decay/sweeps run on schedules; no direct API.)

---

## Missions

### mission.offer
- Purpose: Get mission offers.
- Payload: `{ region?, factionPreference? }`
- Validations: per‑player cooldowns.
- Effects: generate 3 offers server-side.
- Response: `{ offers:[...] }`

### mission.accept
- Purpose: Accept one mission.
- Payload: `{ missionId }`
- Validations: player eligible; not expired; slots limit.
- Effects: set status accepted; start timers.
- Response: `{ mission:{...} }`

### mission.complete
- Purpose: Complete a mission.
- Payload: `{ missionId }`
- Validations: objective satisfied; timers; proof items.
- Effects: grant credits, RepXP, alignment; post Feed if eligible.
- Response: `{ rewards }`

### mission.abandon
- Purpose: Abandon a mission.
- Payload: `{ missionId }`
- Validations: ownership.
- Effects: mark failed; apply penalties if any.
- Response: `{}`

(Corp missions mirror with `corpId`.)

---

## Planets

### planet.claim
- Purpose: Establish base and claim planet.
- Payload: `{ planetId }`
- Validations: unclaimed; credits; 1 turn.
- Effects: set owner/corp; init stats; charge 5,000.
- Response: `{ planet:{owner} }`

### planet.build
- Purpose: Upgrade a structure.
- Payload: `{ planetId, structure:"warehouse"|"habitat"|"factory"|"shield" }`
- Validations: owner/officer; credits; 1 turn; level cap.
- Effects: increase level; adjust derived stats.
- Response: `{ structures, credits }`

### planet.deposit / planet.withdraw
- Purpose: Move cargo in/out of storage.
- Payload: `{ planetId, commodity, units }`
- Validations: capacity checks; ownership/role.
- Effects: adjust storage; adjust cargo lots.
- Response: `{ storage }`

### planet.garrison
- Purpose: Set planetary fighters.
- Payload: `{ planetId, fighters:int }`
- Validations: ownership; available fighters in cargo.
- Effects: move to `garrison.fighters`.
- Response: `{ garrison }`

### planet.raid
- Purpose: Attempt to capture a planet.
- Payload: `{ planetId }`
- Validations: same sector; attacker has ≥1 turn; truce windows.
- Effects: resolve raid math; transfer ownership on success; disable attacker on fail.
- Response: `{ captured:bool, truceUntil? }`

(Tick runs on schedule at 00:00 UTC.)

---

## Economy

### economy.restock
- Purpose: Restock a port at its assigned time.
- Payload: `{ portId }`
- Validations: called by scheduler; time window matches.
- Effects: update stock with decay multipliers; write price sample.
- Response: `{ port:{stock, prices} }`

### economy.rollRegionEvent
- Purpose: Start or end a regional event.
- Payload: `{ region, action:"start"|"end", type? }`
- Validations: scheduler or admin; cooldowns.
- Effects: set flags on ports; TTL timers.
- Response: `{ event:{...} }`

### economy.scanMarket
- Purpose: Return delayed, fuzzed price intel for a scan.
- Payload: `{ scanId }`
- Validations: ownership; TTL.
- Effects: none.
- Response: `{ results:[...] }`

---

## Bounties

### bounty.post
- Purpose: Post a bounty.
- Payload: `{ targetType:"player"|"npc"|"faction", targetId?, amount:int }`
- Validations: funds + 10% fee; min amount.
- Effects: create bounty; debit credits.
- Response: `{ bountyId }`

### bounty.claim
- Purpose: Claim a bounty.
- Payload: `{ bountyId, proof }`
- Validations: proof of kill; not self; active.
- Effects: pay amount; close bounty; post Feed.
- Response: `{ amount }`

---

## Corporations

### corp.create
- Purpose: Create a corporation.
- Payload: `{ name, alignment:"Federation"|"Pirate"|"Independent" }`
- Validations: name unique; fee; player not in corp.
- Effects: create corp; set founder leader.
- Response: `{ corpId }`

### corp.invite / corp.kick
- Payload: `{ corpId, playerId }`
- Validations: role checks.
- Effects: membership changes; 24h cooldown on hopping.
- Response: `{}`

### corp.setPolicy
- Payload: `{ corpId, policy:{...} }`
- Validations: leader/officer.
- Effects: update corp doc.
- Response: `{ policies }`

### corp.deposit / corp.spend
- Payload: `{ corpId, amount, reason }`
- Validations: funds; officer role for spend.
- Effects: adjust corp bank; write corp log.
- Response: `{ bank }`

### corp.acceptMission
- Payload: `{ corpId, missionId }`
- Validations: one active corp mission.
- Effects: set mission owner to corp.
- Response: `{}`

### corp.setNotice
- Payload: `{ corpId, text }`
- Validations: length, sanitation.
- Effects: update notice.
- Response: `{}`

---

## Feed & Leaderboards

### feed.postSystem (internal)
- Purpose: Post a system-generated feed entry.
- Payload: `{ category, region, messageKey, params, severity }`
- Validations: internal only (service account).
- Effects: create `/feed` doc with jitter on publish.
- Response: `{ entryId }`

### leaderboard.updateCategory (internal)
- Purpose: Increment a leaderboard category.
- Payload: `{ seasonId, targetId, category, delta }`
- Validations: internal only; category whitelist.
- Effects: adjust leaderboards doc; recalc total.
- Response: `{ total }`

### season.rollover (internal/admin)
- Purpose: End current season and start next.
- Payload: `{ galaxyId }`
- Validations: admin only; time window.
- Effects: freeze leaderboards; assign victor; archive galaxy; seed next season.
- Response: `{ nextSeasonId }`

---

## Validation, Audit, Telemetry

- **Preconditions:** All endpoints validate ownership, turns, cooldowns, faction locks, region rules, truce windows, and schema versions.
- **Audit Log:** Write `/audits` with `actor`, `action`, `target`, and sanitized `meta`.
- **Telemetry:** Write sampled events to `/telemetry_events` for balancing and health dashboards.
- **Idempotency:** Store `requestId` in per‑player `request_log` (TTL 24h). Reject duplicates with previous result.

---

## Rate Limits (defaults)
- `nav.move`: 30/min burst 60
- `nav.scan` + `nav.resolveScan`: 20/min
- `trade.buy/sell`: 60/min burst 120
- `combat.*`: 5/min
- `deploy.*`: 20/min
- `planet.*`: 10/min
- `mission.*`: 10/min
- `corp.*`: 5/min
- `bounty.*`: 5/min

---

## Response DTO Redaction
- Never return sector IDs tied to a specific player action in public contexts.
- Combat summaries to non-participants exclude names if privacy flags set.
- Planet storage counts hidden from non-owners (return “unknown” in DTO).

---

## Testing Checklist
- Emulator tests for success/denial paths per endpoint.
- Idempotency tests: replay last 3 `requestId`s returns same result.
- Rate limit tests with exponential backoff hints.
- Fuzz tests for numeric caps (no negative stock/credits).

---

End of spec.
