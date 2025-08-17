# Planets & Colonies Specification
Version: 1.0
Status: Developer-ready (TW2002-simple)

## Purpose
Keep planets **simple and strategic** in the spirit of TW2002. Planets are **rare**, serve as **storage/bases**, can **produce commodities daily**, and support **simple defenses**. Ownership can be **single-player** or **corporate**. Planets integrate with the per-port economy and combat systems without becoming a full 4X.

---

## A. Planet Availability (Rare)
- Spawn rate target: **8–12% of sectors** have a planet (as per worldgen spec).
- Region bias: CORE/FRONTIER/OUTER higher; rare in FedSpace; hidden in Pirate/Deep Space.
- Discovery: Entering sector reveals planet. First visit creates a local entry for player.

---

## B. Ownership & Claiming
- Ownership modes:
  - **Single-owner** (default)
  - **Corporation-owned** (if claimer is in a corp)
- Claiming requires **building a base** (simple claim step):
  - Action: “Establish Base”
  - Cost: **5,000 credits**, **1 turn**
  - Result: planet owner set; access controls enabled
- Transfer: Owner can transfer to corp (if leader/officer) or to another player (consent required).

Permissions:
- **Owner**: full control
- **Corp Officers**: manage defenses/storage (if corp-owned)
- **Corp Members**: deposit/withdraw per role settings
- **Guests**: no access

---

## C. Planet Roles (Simple)
Planets serve two roles:
1) **Storage/Base:** Free warehouse for cargo and deployables.  
2) **Production:** Daily tick generates commodities.

### C.1 Storage
- Unlimited item types; storage capacity is **finite** per Warehouse level.
- Default capacity: **2,000 cargo units** (Equipment counts as 2 per unit).

### C.2 Daily Production (All Commodities)
- Commodities: **Fuel, Organics, Equipment**.
- Baseline output (per day at Population 100, no structures):
  - Fuel: **80**
  - Organics: **60**
  - Equipment: **30**
- Output scales with **Population** and **Facility level** (Section E).

Daily tick runs server-side at **00:00 UTC** (same as turns).

---

## D. Population & Workers (Lightweight)
- Population represents workers and grows slowly.
- Initial Population: **50** on claim.
- Max Population (base): **500**
- Growth per day: `ΔPop = clamp( 10 * growthMult - attrition, 0, cap )`
  - `growthMult = 1.0 + 0.1 * FarmLevel + eventBonus`
  - `attrition = 0` normally; +20 if **Under Siege** at tick
- Population caps increase with **Habitat** structure level (Section E).

Population provides a multiplier to production:
- `prodMult = 0.2 + (Population / MaxPopulation) * 0.8` (20% floor; 100% at cap)

---

## E. Structures (Simple, Few)
Three upgradable structures plus defenses. **No crafting.** All purchases cost credits and 0-turn to view, **1 turn** to build/upgrade.

| Structure | Levels | Effect | Cost Curve |
|---|---:|---|---|
| **Warehouse** | 1–5 | +2,000 capacity per level | `base 5,000 * 1.8^lvl` |
| **Habitat** | 1–5 | +250 Max Population per level | `base 6,000 * 1.8^lvl` |
| **Factory** | 1–5 | +15% production per level | `base 7,500 * 1.8^lvl` |
| **Shield Grid** | 0–5 | Reduces raid damage, raises autoresolve defense | `base 10,000 * 2.0^lvl` |

Notes:
- Factory boosts apply equally to Fuel/Organics/Equipment.
- Shield Grid participates in combat defense calc (Section G).

---

## F. Production Formula (Daily Tick)
For each commodity `c ∈ {Fuel, Organics, Equipment}`:
```
Base_c = { Fuel:80, Organics:60, Equipment:30 }
Output_c = floor( Base_c * prodMult * (1 + 0.15 * FactoryLevel) * regionMult * econMult )
```

Modifiers:
- **regionMult**: { CORE 1.0, FRONTIER 1.05, OUTER 1.1, PIRATE 1.0, DEEP 0.9, INNER 1.0 }
- **econMult**: Economy coupling to local region events:
  - Shortage of c in region → +0.10
  - Surplus of c → −0.10
  - Embargo → −0.05
- Cap: Stored output cannot exceed **Warehouse capacity**; excess is lost (appears in planet log).

---

## G. Defense & Vulnerability (Simple)
Planets can use **both** planetary defenses and orbital deployables.

### G.1 Planetary Defenses
- **Planetary Fighters**: Dedicated garrison (separate from orbital fighters)
- **Shield Grid**: Provides defense rating (see below)

Defense Rating:
```
DefRating = (PlanetFighters * 0.8) + (ShieldGridLevel * 120) + OwnerDefenseBonus
OwnerDefenseBonus = +50 if Federation-aligned owner in Fed regions; 0 otherwise
```

### G.2 Orbital Deployables
- Sector deployables (fighters/mines/drones/turrets) participate **before** planetary defenses (see Deployables spec).

### G.3 Raids (Capture, not Raze)
- Attack flow (instant math, like ship combat):
  1. Resolve orbital deployables (if any).
  2. Compute **AttackPower** from attacker ship and carried fighters/torps.
  3. Compare **AttackPower** vs **DefRating** with small RNG drizzle.
- If attacker wins:
  - Planet is **captured**. Ownership transfers to attacker (or attacker’s corp).
  - Storage contents transfer to new owner.
  - Planetary fighters reduced to 0; Shield Grid loses 1 level (min 0).
- If attacker loses:
  - Attacker disabled (as per combat rules).  
  - Small chance 20% to destroy 5–10% stored goods (collateral).

Cooldowns:
- After capture, **12h truce**: planet cannot be attacked again (gives new owner time to fortify).

---

## H. UI & Flow (Menu-Light)
- **Planet Overview**: Owner, Population, Structures, Storage used/capacity, Daily Output preview.
- **Storage**: Deposit/Withdraw cargo and deployables (with role-based permissions).
- **Build**: Upgrade Warehouse/Habitat/Factory/Shield Grid (1 turn, credits cost).
- **Garrison**: Set Planetary Fighters count (move from ship cargo to planet; 0-turn transfer).
- **Logs**: Production events, raid attempts/outcomes, losses due to cap.

All screens are **single-panel** with native mobile scrolling (no desktop scrollbars).

---

## I. Galaxy Feed (Safe)
- Announce with **no sector ID**, region tags only:
  - “A new world was claimed in the Frontier Cluster.”
  - “A colony raised its first shield grid in the Outer Rim.”
  - “A colony changed hands after a raid in Deep Space.”
- Post with **2–8 minute delay** to prevent live tailing.

---

## J. Firestore Data Model
```
/planets/{planetId}
  galaxyId: string
  sectorId: string
  ownerId?: string
  corpId?: string
  claimed: boolean
  claimedAt?: timestamp
  region: string
  population: int
  maxPopulation: int
  storageCap: int
  storage: { fuel:int, organics:int, equipment:int }
  garrison: { fighters:int }
  structures: { warehouse:int, habitat:int, factory:int, shield:int }
  dailyOutput: { fuel:int, organics:int, equipment:int }
  lastTick: timestamp
  truceUntil?: timestamp
```

Indexes:
- `planets.galaxyId + region`
- `planets.ownerId`
- `planets.corpId`

Security:
- Owner/corp can read full details.
- Others see redacted summary (no exact storage numbers).

---

## K. Cloud Functions API
- `planet.claim(planetId)` – pay 5,000 credits, set owner, init stats
- `planet.build(planetId, structureKey)` – pay cost, +level, consumes 1 turn
- `planet.deposit(planetId, commodity, units)` / `planet.withdraw(...)`
- `planet.garrison(planetId, fighters)` – move fighters to/from planet
- `planet.tickDaily()` – cron at 00:00 UTC; apply growth and production
- `planet.raid(planetId)` – resolve capture math, truce handling
- `planet.transfer(planetId, toOwner|toCorp)` – safe transfer

Errors:
- `ERR_NOT_OWNER`, `ERR_CAPACITY`, `ERR_TRUCE`, `ERR_NO_TURNS`, `ERR_FUNDS`

---

## L. Worked Examples

### L.1 Production Example
- Pop=220, MaxPop=500 → `prodMult = 0.2 + (220/500)*0.8 = 0.552`
- Factory Level 3 → `(1 + 0.15*3) = 1.45`
- Frontier region → `regionMult = 1.05`
- No events → `econMult = 1.0`
- Fuel Output = `floor(80 * 0.552 * 1.45 * 1.05) = floor(67.0) = 67`

### L.2 Raid Resolution
- Planetary Fighters=300, Shield=Level 2  
  - DefRating = `300*0.8 + 2*120 = 240 + 240 = 480`
- Attacker ship EffPower (from combat calc) ~ 520  
- Small drizzle favors attacker → capture succeeds.
- Ownership transfers; Shield Grid drops to Level 1; garrison reset to 0.

---

## M. Tuning Knobs
- Base production per commodity
- Population growth and caps
- Structure cost curves and effects
- DefRating fighter weight and shield value
- Truce window duration
- Production coupling to region economy

---

## N. QA & Edge Cases
- Tick idempotency: guard against double daily ticks.
- Storage overflow logging when output exceeds capacity.
- Prevent instant re-capture during truce.
- Ensure raid cannot bypass truce or happen when owner is offline by design (truce mitigates, not prevents).

---

End of spec.
