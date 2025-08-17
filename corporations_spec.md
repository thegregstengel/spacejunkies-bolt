# Corporations (Guilds) Specification
Version: 1.0
Status: Developer-ready (TW2002-simple)

## Purpose
Define lightweight **corporations** for coordination and shared assets without complex bureaucracy. Corps enable shared planets, pooled defenses, private chat-equivalent features via notices (no global chat), and joint missions. No turn bonuses or pay-to-win.

---

## A. Formation & Membership
- **Create Corp:** 50,000 credits fee; founder becomes Leader.
- **Size Cap:** 25 members (configurable).
- **Join/Invite:** Leader or Officers invite; players can request to join.
- **Roles:**
  - **Leader:** all permissions.
  - **Officer:** manage invites, corp assets, set notices.
  - **Member:** basic access to corp planets/defenses per policy.
- **Faction Alignment:** Corps can set a **declared alignment** (Federation, Pirate, or Independent).

---

## B. Shared Assets
- **Corp Planets:** Owned by corp; members use storage per permissions.
- **Deployables:** Members’ sector defenses can **pool** if tagged to corp.
- **Corp Bank:** Optional pooled credits, viewable ledger. No interest.

Permissions matrix (example):
- Storage: View/Deposit/Withdraw (per commodity)
- Defenses: View/Place/Clear
- Planet: Build/Upgrade
- Bank: View/Deposit/Spend (officers+)
- Missions: Accept/Abandon (limits below)

---

## C. Corp Missions (Lightweight)
- Corps can accept **1 active corp mission** at a time (escort, fortify, raid, relief).
- Rewards split: credits to corp bank; RepXP to contributors.
- Cooldown per mission archetype: 3 hours.

---

## D. Notices & Coordination
- Corp **Notices**: short messages pinned for members (since no chat).
- Event feed: summarized internal log (missions taken, planets changed hands, deployable sweeps).

---

## E. Defection & Kicks
- Leaving or being kicked:
  - Personal assets stay personal.
  - Access to corp planets/defenses revoked immediately.
  - **Cooldown**: 24h before joining a new corp to prevent hopping exploits.
- Corp alignment changes apply a 12h **mission lockout**.

---

## F. Firestore Model
```
/corps/{corpId}
  name: string
  createdAt: timestamp
  leaderId: string
  alignment: "Federation"|"Pirate"|"Independent"
  bank: { credits:int }
  policies: { storage:{view:bool,deposit:bool,withdraw:bool}, defenses:{view:bool,place:bool,clear:bool}, planet:{build:bool}, bank:{spend:bool} }
  notices: { text:string, updatedAt: timestamp }

/corps/{corpId}/members/{playerId}
  role: "Leader"|"Officer"|"Member"
  joinedAt: timestamp

/corps/{corpId}/assets/{assetId}
  type: "planet"|"deployable"
  refId: string

/corp_logs/{corpId}/{logId}
  t: timestamp
  type: "mission"|"planet"|"defense"|"bank"
  data: map
```

Indexes: corps.alignment, members.role

Security:
- Only members can see full corp details; others see name/alignment only.

---

## G. Cloud Functions
- `corp.create(name)` – charges fee, creates corp
- `corp.invite(playerId)` / `corp.kick(playerId)`
- `corp.setPolicy(key, value)`
- `corp.acceptMission(missionId)` (one active)
- `corp.deposit(amount)` / `corp.spend(amount)` (officers+)
- `corp.setNotice(text)`

Errors: `ERR_NAME_TAKEN`, `ERR_MAX_MEMBERS`, `ERR_ACTIVE_MISSION`, `ERR_POLICY_DENIED`

---

## H. QA & Edge Cases
- Prevent bank exploits with atomic writes and audit logs.
- Enforce 24h cooldown on leave/kick.
- Limit notice length; sanitize input.

---

End of spec.
