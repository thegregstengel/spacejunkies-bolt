# Telemetry & Tuning Specification
Version: 1.0
Status: Developer-ready

## Purpose
Define analytics events and dashboards to tune economy, combat, missions, and progression. Telemetry is sampled, privacy-conscious, and written server-side to Firestore telemetry buckets, with optional export to BigQuery.

---

## Guiding Principles
- Minimal PII: use playerId only where needed; support hashing for exports.
- Server writes only for gameplay events; clients may log UI events.
- Sampling to control cost and volume.
- Schema stability: version fields and enums.

---

## Event Model

### Envelope
```
type: string            // event name
t: timestamp            // server time
galaxyId: string
playerId?: string
props: map
v: int                  // schema version
```

### Core Events
1) move
- props: { from, to, region, turnsBefore:int, turnsAfter:int, encounter:boolean }

2) scan
- props: { originSector, radius, resultCount:int, delayMs:int }

3) trade_buy, trade_sell
- props: { portId, region, commodity, units, unitPrice, total, tax, spread, postStock:int, postPrice:float }

4) ship_upgrade
- props: { shipClass, stat, levelBefore:int, levelAfter:int, cost:int }

5) combat_pvp, combat_pve
- props: { region, winner:"A"|"D"|"escape", attackerClass, defenderClass, pWin:float, lootCredits:int, lootCargo:{f:int,o:int,e:int}, disabledTarget:boolean }

6) deploy_place
- props: { sectorId, type, count, corp:boolean }

7) planet_claim, planet_build, planet_raid
- props: { planetId, structure?, level?, region, captured?:boolean }

8) mission_accept, mission_complete, mission_fail
- props: { missionId, faction, tier, type, region, rewards:{credits,repXP,align} }

9) feed_emit
- props: { category, region, messageKey, severity }

10) bounty_post, bounty_claim
- props: { amount:int, targetType }

11) leaderboards_snapshot
- props: { seasonId, topN:int }

12) ui_error, api_error
- props: { code, endpoint?, messageHash }

---

## Sampling
- Default sampling rate: 50 percent for common events (move, scan).
- Always log: trade, combat, planet, mission, feed_emit, api_error.
- Dynamic sampling: if event volume > target, reduce rates per bucket.

---

## Retention
- Firestore hot store: 7 days
- Export to BigQuery: daily; retain 12 months
- Aggregated rollups: per day, per region, per galaxy

---

## Dashboards (KPIs)
1) Economy Health
- Price index by commodity and region
- Port stock heatmap
- Restock success rate and event impacts
- Profit per turn distribution
- Route decay effectiveness

2) Combat Balance
- PvP win rates by ship tier
- PvE win rates by region
- Average attrition and repair spend
- Retreat attempt and success rates

3) Progression
- XP and RepXP gain rates
- Time to Tier 2/3/4/5 ships
- Mission completion rates and durations

4) Planets
- Claims per day, captures, truce violations
- Production output vs storage overflow

5) Engagement
- Turns spent per day
- Session length, returns after reset
- Leaderboard activity

6) Abuse Signals
- Duplicate requestId rate
- API error spikes and rate-limit hits
- Suspicious trade or bounty patterns

---

## Tuning Levers
- Economy: logistic k, L_min/L_max, restock r_base, decay slope
- Combat: aF/aS/aT, role multipliers, region bonuses, loot caps
- Missions: reward ranges, timers, spawn weighting
- Planets: structure curves, truce duration
- NPC spawn chances and tiering

---

## Privacy & Compliance
- No sector coordinates returned in public data.
- Respect profile privacy: anonymize names in analytics exports if flagged.
- Hash message text for ui_error to avoid PII leakage.
- Opt-out switch in settings writes a flag; server reduces sampling for that player.

---

## Implementation Notes
- Use Cloud Functions to batch writes to telemetry buckets.
- Guard with App Check and per-endpoint rate limits.
- Include schema version in each event; document changes in a changelog.

---

End of spec.
