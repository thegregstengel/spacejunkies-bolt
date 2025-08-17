# Seasonal Structure & Leaderboards Specification
Version: 1.0
Status: Developer-ready (TW2002-simple)

## Purpose
Define simple, fair **seasonal cycles** and **leaderboards** that fit Space Junkies’ turn-based pacing. Seasons crown a faction victor and celebrate top players/corps without granting gameplay power into the next season.

---

## A. Season Basics
- **Length:** 12 weeks default (configurable 8–16).
- **Galaxy Lock:** A season is tied to a galaxy instance; all players share the same season clock.
- **Hard End:** At the deadline, standings are frozen, awards are granted, and the galaxy is archived read-only for 7 days before reset.
- **Carryover:** No credits/ships carry over. Only **cosmetics, titles, badges, and history** persist.

---

## B. Victory Conditions
- **Faction Victory:** Compare **Region Influence** totals aggregated over the final 24 hours (to avoid last-second snipes). Highest wins.
  - Region Influence is already produced by Missions, Planet ownership, and Combat outcomes (see Factions/Planets specs).
- **Tie-breakers:** (1) Planets held, (2) Total faction RepXP earned by players, (3) Total bounties completed.

---

## C. Player Awards (Non-Power)
Award tiers are **cosmetic** and **profile-only**. No gameplay buffs next season.
- **Legend:** Top 1 overall score (weighted by wealth, combat, missions, planets). Unique seasonal title.
- **Elite:** Top 25 overall.
- **Specialists:** Category tops per board (see below).
- **Faction Citations:** Top 100 contributors to the winning faction get a distinct badge.
- **Corp Citations:** Top 10 corps receive a banner cosmetic usable next season.

Unlockable cosmetics: avatar frames, ship skins, title plates, profile badges. No stats.

---

## D. Leaderboards
All boards are **seasonal** and **reset at season start**. Snapshots are kept for history (read-only).

### D.1 Primary Boards
1. **Wealth** (liquid credits + banked credits + cargo at standardized value)
2. **Combat** (PvP and PvE victories weighted by difficulty; negative for losses optional)
3. **Trade** (net profit realized, fees included)
4. **Exploration** (new sectors discovered, anomalies/landmarks visited)
5. **Faction Contribution** (RepXP to your faction)
6. **Planets** (planets claimed, held time, defended successfully)
7. **Bounties** (claimed value)

### D.2 Corp Boards
- **Corp Wealth**, **Corp Planets**, **Corp Faction Contribution**

### D.3 Anti-Boosting
- Weighted scores with **diminishing returns** per category (e.g., repeated trivial trades give less score).
- PvP score requires **distinct opponents**; repeated kills on the same target within 24h count at 10% value.
- Minimum turn usage per day to remain on public leaderboards (e.g., ≥20 turns/day average).

---

## E. Scoring (High Level)
- **WealthScore = credits + bank + cargoValue**
- **CombatScore = sum(winValue(opponentTier, odds)) − sum(lossPenalty)**
- **TradeScore = sum(tradeProfit standardized)** (uses economy price bands)
- **ExplorationScore = newSectors*5 + landmarks*50**
- **FactionScore = RepXP**
- **PlanetScore = claim*100 + holdHours + defended*50**
- **BountyScore = sum(bountyCreditsClaimed)**

All scoring runs server-side with rate limits.

---

## F. Galaxy Feed Integration
- Start-of-season announcement: “A new season dawns across the Core Ring.”
- Mid-season beat: weekly “standings are shifting” summaries by region/faction.
- Final 24h: “Signals indicate a season’s end draws near.”
- Post-season wrap: announce faction victor and top achievements (no sectors).

---

## G. Firestore Model
```
/seasons/{seasonId}
  galaxyId: string
  startAt: timestamp
  endAt: timestamp
  status: "active"|"ended"|"archived"
  victorFaction?: "Federation"|"Pirate"
  snapshots: { finalAt: timestamp }

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

Indexes:
- leaderboards.seasonId + total desc
- leaderboards.seasonId + category desc

---

## H. Cloud Functions
- `season.rollover()` – closes current, awards, creates next
- `leaderboard.updateCategory(playerId, category, delta)` – batched, rate-limited
- `leaderboard.snapshotFinal()` – writes final standings immutable

Errors: `ERR_SEASON_ENDED`, `ERR_RATE_LIMIT`, `ERR_INVALID_CATEGORY`

---

## I. QA & Edge Cases
- Leaderboard writes behind a queue to avoid contention.
- Clamp scores to prevent integer overflow.
- Archive galaxy data 7 days post-season; new season uses fresh seed.

---

End of spec.
