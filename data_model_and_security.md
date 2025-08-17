# Data Model & Security (Firestore) – Specification
Version: 1.0
Status: Developer-ready

## Purpose
Define a **normalized Firestore data model** and **security posture** for Space Junkies. Priorities: mobile performance, privacy-by-default, server-authoritative mutations, least privilege, and auditability. All sensitive operations (combat, trade, deploy, missions, economy ticks) are performed through **Cloud Functions** using transactions and validation, not direct client writes.

---

## Conventions
- All timestamps are **serverTime** (Firebase `request.time` in rules; Admin SDK on writes).
- Document IDs use ULIDs for locality or Firestore auto-IDs unless a natural key is better.
- Collections prefixed by feature; avoid hot-spotting large fan-in writes under a single doc.
- Multi-tenant: `galaxyId` present on all gameplay docs; queries must filter by `galaxyId`.
- Privacy: clients fetch **redacted views**; full details are limited to owners and admins.

---

## Top-level Collections Overview
```
/players                // profile, alignment, bank
/galaxies               // seed, generation stats
/seasons                // active season window
/sectors                // region, links, hazards
/ports                  // economy state
/planets                // ownership, storage, structures
/landmarks              // special POIs
/isolates               // hidden pockets metadata
/ships                  // per-player ships
/cargo_lots             // inventory ownership
/deployables            // sector defenses
/missions               // personal + corp missions
/corps                  // corporations & membership
/combat                 // combat logs
/bounties               // bounty board
/feed                   // galaxy feed (public, redacted)
/leaderboards           // seasonal snapshots
/prices_daily           // daily price samples per port
/telemetry_events       // analytics (batched, sampled)
/audits                 // server audit logs
```

Each collection includes a minimal schema and security stance below.

---

## Schemas

### 1) Players
```
/players/{playerId}
  displayName: string
  createdAt: timestamp
  lastLoginAt: timestamp
  galaxyId: string
  faction: "Neutral"|"Federation"|"Pirate"
  alignmentScore: int              // -1000..+1000
  repXP: int                       // faction reputation XP
  bank: { credits:int }
  privacy: { hideNameInFeed:bool }
  stats: { level:int, xp:int, kills:int, deaths:int }
  flags: { banned:bool, admin:bool }
```
- Writes: profile edits allowed by owner (name, privacy). Alignment, bank, stats are **server-only**.

### 2) Galaxies
```
/galaxies/{galaxyId}
  seed: string
  genVersion: int
  createdAt: timestamp
  size: int
  regionBreakdown: map<string,int>
  stats: { edges:int, highways:int, oneWay:int, isolates:int }
  seasonId: string
```
- Read-only to clients.

### 3) Sectors
```
/sectors/{sectorId}
  galaxyId: string
  region: string
  pois: { ports:[string], planets:[string], landmarks:[string] }
  hazards: [ { type:string, level:int } ]
  isIsolate: bool
  links: { undirected:[string], oneWayOut:[string], oneWayIn:[string] }
  flags: { highwayHub:bool, regionHub:bool }
```
- Redaction: clients do **not** receive latent coords.

### 4) Ports
```
/ports/{portId}
  galaxyId: string
  sectorId: string
  archetype: string
  faction: "Federation"|"Pirate"|"Neutral"
  tier: "Small"|"Medium"|"Large"
  level: int
  volatility: "Low"|"Med"|"High"
  caps: { fuel:int, organics:int, equipment:int }
  stock: { fuel:int, organics:int, equipment:int }
  priceBands: { fuel:{min:int,base:int,max:int},
                organics:{min:int,base:int,max:int},
                equipment:{min:int,base:int,max:int} }
  spread: { fuel:float, organics:float, equipment:float }
  tax: float
  restockTimeUtc: string  // "HH:MM"
  flow: { fuel:float, organics:float, equipment:float }
  lastRestock: timestamp
  region: string
  flags: { embargoed:bool, tradeFair:bool }
```
- Writes: **server-only** via economy functions.

### 5) Planets
```
/planets/{planetId}
  galaxyId: string
  sectorId: string
  region: string
  ownerId?: string
  corpId?: string
  claimed: bool
  claimedAt?: timestamp
  population: int
  maxPopulation: int
  storageCap: int
  storage: { fuel:int, organics:int, equipment:int }
  garrison: { fighters:int }
  structures: { warehouse:int, habitat:int, factory:int, shield:int }
  lastTick: timestamp
  truceUntil?: timestamp
```
- Owner/corp can read-all; others get redacted (no exact storage counts).

### 6) Landmarks
```
/landmarks/{landmarkId}
  galaxyId: string
  sectorId: string
  type: "BlackHole"|"Ruins"|"RelicOutpost"|"Beacon"
  params: map
```
- Read-only.

### 7) Isolates
```
/isolates/{isolateId}
  galaxyId: string
  sectorIds: [string]
  unlock: { keyItemId?:string, scannerLevel?:int, missionId?:string }
```
- Client never sees this collection; access server-only.

### 8) Ships
```
/ships/{shipId}
  ownerId: string
  galaxyId: string
  classKey: string
  name: string
  tier: int
  holds: int
  shields: int
  fighters: int
  torps: int
  escape: float
  upgrades: { holds:int, shields:int, fighters:int, torps:int }
  special: string
  status: "OK"|"DISABLED"
  disabledAt?: timestamp
  factionLock: "None"|"Federation"|"Pirate"
  xpRequired: int
  baseCost: int
```
- Writes: server for purchase/upgrade/rename validation.

### 9) Cargo Lots
```
/cargo_lots/{lotId}
  ownerId: string
  galaxyId: string
  commodity: "fuel"|"organics"|"equipment"
  units: int
  contraband: bool
  createdAt: timestamp
```
- Owned-by-player. Adjusted only via server trade functions.

### 10) Deployables
```
/deployables/{deployId}
  galaxyId: string
  sectorId: string
  type: "fighter"|"mine"|"drone"|"turret"|"buoy"|"cloak"
  count: int
  ownerId: string
  corpId?: string
  deployedAt: timestamp
  decayRate: float
  expiry?: timestamp
```
- Writes: server; clients call `deploy.place`.

### 11) Missions
```
/missions/{missionId}
  galaxyId: string
  playerId?: string
  corpId?: string
  faction: "Federation"|"Pirate"|"Neutral"
  status: "offered"|"accepted"|"completed"|"failed"
  tier: "I"|"II"|"III"|"IV"|"V"
  objective: string
  region_tags: [string]
  expiresAt: timestamp
  claimAt?: timestamp
  completeAt?: timestamp
  rewards: { credits:int, repXP:int, align:int }
```
- Writes: server-authoritative. Client can only accept/abandon via function.

### 12) Corps
```
/corps/{corpId}
  name: string
  createdAt: timestamp
  leaderId: string
  alignment: "Federation"|"Pirate"|"Independent"
  bank: { credits:int }
  policies: map
  notices: { text:string, updatedAt: timestamp }

/corps/{corpId}/members/{playerId}
  role: "Leader"|"Officer"|"Member"
  joinedAt: timestamp

/corps/{corpId}/assets/{assetId}
  type: "planet"|"deployable"
  refId: string
```
- Writes: server validates roles and policies.

### 13) Combat
```
/combat/{combatId}
  galaxyId: string
  t: timestamp
  region: string
  attacker: { playerId, shipId, classKey, alignment, xpTier }
  defender: { playerId?, npcType?, shipId?, classKey, alignment, xpTier }
  pre: { FA:int, SA:int, TA:int, FD:int, SD:int, TD:int }
  result: { winner:"A"|"D"|"escape", loot:{credits:int, cargo:{fuel:int,organics:int,equipment:int}},
            attrition:{A:{fighters:int,shields:int,torps:int}, D:{fighters:int,shields:int,torps:int}},
            disable:{A:bool,D:bool} }
  privacy: { hideSector:true }
```
- Full details readable only by involved players; others query redacted summaries.

### 14) Bounties
```
/bounties/{bountyId}
  galaxyId: string
  postedBy: string
  targetType: "player"|"npc"|"faction"
  targetId?: string
  amount: int
  fee: int
  status: "active"|"claimed"|"expired"
  createdAt: timestamp
  expiresAt?: timestamp
  claimantId?: string
```
- Server checks balances and posts fees atomically.

### 15) Feed (Public, Redacted)
```
/feed/{entryId}
  galaxyId: string
  t: timestamp
  category: string   // combat, economy, mission, planet, season, system
  region: string
  messageKey: string // i18n key
  params: map        // redacted payload
  severity: "minor"|"standard"|"major"|"critical"
```
- Public read; **no sectors**, **no player location breadcrumbs**.

### 16) Leaderboards
```
/leaderboards/{seasonId}/players/{playerId}
  wealth:int
  combat:int
  trade:int
  explore:int
  faction:int
  planets:int
  bounties:int
  total:int

/leaderboards/{seasonId}/corps/{corpId}
  wealth:int
  faction:int
  planets:int
  total:int
```
- Server writes only.

### 17) Prices Daily (Sampling)
```
/prices_daily/{portId}/{date}
  fuel:int
  organics:int
  equipment:int
  volatility: "Low"|"Med"|"High"
  eventTag?: string
```
- Read-only; used for UI graphs and telemetry.

### 18) Telemetry (Batched)
```
/telemetry_events/{bucketId}/{eventId}
  t: timestamp
  galaxyId: string
  playerId?: string
  type: string     // "trade","move","combat","mission","planet","ui"
  props: map
```
- Writes only via server; PII minimized or hashed.

### 19) Audits
```
/audits/{logId}
  t: timestamp
  actor: { uid?:string, system:boolean }
  action: string
  target: { collection:string, id:string }
  requestIp?: string
  meta: map
```
- Admin read only; WORM-style (append-only).

---

## Indexing Strategy
- Composite indexes by `galaxyId + region` for sectors, ports, planets.
- `seasons.status` and `seasons.endAt` for active season lookup.
- `feed.galaxyId + t + severity` for pagination.
- `deployables.galaxyId + sectorId` for fast sector checks.
- Leaderboards: single-field descending `total` and per-category.

Avoid per-document hot writes; prefer sharded collections (e.g., telemetry buckets).

---

## Security Rules (Outline)
Rules are written to enforce **read masks** and **server-authoritative writes**. Sketch below shows intent; actual rules split per collection.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isOwner(ownerId) { return isSignedIn() && request.auth.uid == ownerId; }
    function isAdmin() { return isSignedIn() && request.auth.token.admin == true; }
    function sameGalaxy(galaxyId) { return request.resource.data.galaxyId == galaxyId; }

    match /players/{playerId} {
      allow read: if isSignedIn() && request.auth.uid == playerId;
      allow update: if isOwner(playerId) && request.resource.data.diffKeys().hasOnly(['displayName','privacy']);
      allow create: if isOwner(playerId);
      allow delete: if false;
    }

    match /galaxies/{galaxyId} {
      allow read: if true;
      allow write: if false;
    }

    match /sectors/{sectorId} {
      allow read: if true;
      allow write: if false;
    }

    match /ports/{portId} {
      allow read: if true;
      allow write: if false; // server writes via Admin SDK
    }

    match /planets/{planetId} {
      allow read: if true; // rule filter below for redaction via fields mask (see note)
      allow write: if false;
    }

    match /ships/{shipId} {
      allow read: if isOwner(resource.data.ownerId);
      allow write: if false;
    }

    match /cargo_lots/{lotId} {
      allow read, update, delete: if isOwner(resource.data.ownerId);
      allow create: if isOwner(request.resource.data.ownerId);
    }

    match /deployables/{deployId} {
      allow read: if true;    // counts redacted by server response DTO
      allow write: if false;
    }

    match /missions/{missionId} {
      allow read: if isSignedIn();  // limited details
      allow write: if false;
    }

    match /corps/{corpId} {
      allow read: if true;
      allow write: if false;
      match /members/{playerId} { allow read: if isSignedIn(); allow write: if false; }
      match /assets/{assetId} { allow read: if isSignedIn(); allow write: if false; }
    }

    match /combat/{combatId} {
      allow read: if isAdmin() || (isSignedIn() &&
        (request.auth.uid == resource.data.attacker.playerId ||
         request.auth.uid == resource.data.defender.playerId));
      allow write: if false;
    }

    match /bounties/{bountyId} { allow read: if true; allow write: if false; }
    match /feed/{entryId} { allow read: if true; allow write: if false; }

    match /leaderboards/{seasonId}/{doc=**} { allow read: if true; allow write: if false; }
    match /prices_daily/{portId}/{date} { allow read: if true; allow write: if false; }
    match /telemetry_events/{bucketId}/{eventId} { allow write: if false; } // server-only
    match /audits/{logId} { allow read, write: if isAdmin(); }
  }
}
```
> Note: For **redaction**, prefer returning redacted DTOs via Cloud Functions for sensitive resources rather than depending solely on field-level rules. Where field masks are needed, use separate “public” collections (e.g., `/planets_public`) populated by server.

---

## Server-Authoritative Write Pattern
- All gameplay mutations are **callable HTTPS functions**:
  - Validate preconditions (ownership, turn counts, cooldowns).
  - Perform **transaction** reads/writes for atomicity.
  - Write to **audits** and **telemetry_events**.
  - Return sanitized DTOs for the client.

### Idempotency
- Include a client `requestId` for retry-safe operations; dedupe in a `request_log` subcollection with TTL.

### Rate Limiting
- Cloud Functions enforce per-UID QPS and rolling windows per endpoint:
  - e.g., `combat.resolve`: max 5/min; `trade.buy`: max 60/min (burstable).

### App Check
- Require Firebase **App Check** tokens on all callable functions to reduce abuse.

### Abuse & Integrity
- Validate all economic math server-side using canonical formulas (e.g., logistic prices).
- Double-entry style economic writes: every credit delta written to `audits` with actor and source.
- Reject any client attempt to write disallowed fields (rules + server checks).

---

## Privacy & Redaction
- **Feed** never contains sector IDs or player location breadcrumbs.
- **Combat** details available only to participants; others get anonymized summaries via a public `combat_summaries` mirror if needed.
- **Planets** visible to non-owners as existence-only + owner faction tag; hide exact storage.
- **Deployables** visible as fuzzed counts unless scanned with advanced scanners.

---

## Testing & QA
- Write **security-unit tests** using Firebase Emulator:
  - Positive: owner can read/rename ship; cannot change shields directly.
  - Negative: direct writes to `/ports` denied.
  - Cross-tenant: cannot read/write if `galaxyId` mismatch where required.
- **Load testing** with sampled telemetry writes to ensure index fanout is healthy.
- Verify **composite indexes** exist for all hot queries before launch.

---

## Migration & Versioning
- Schema version keys on documents where breaking changes are expected (`schemaVersion`).
- Migrations run via Admin script; keep forward-compatible readers when possible.
- Use **shadow collections** during rollout; cutover after validation.

---

End of spec.
