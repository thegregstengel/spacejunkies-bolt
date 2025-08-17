# Ships & Upgrades Specification
Version: 1.0  
Status: Developer-ready

## Purpose
Define the 20 ship classes of Space Junkies (10 Neutral, 5 Federation, 5 Pirate), including stats, roles, abilities, progression, and upgrades. Ships have exponential upgrade costs, hard caps, and retain cargo when traded in. Trade-ins return ~60% base value plus upgrade value. Ships unlock via faction alignment and XP tiers, and are stocked regionally in shipyards with limited restock.

---

## Core Principles
- **20 Ship Classes:** 10 Neutral (baseline), 5 Federation (defense), 5 Pirate (offense).
- **Roles:** Clear archetypes: freighters (cargo), fighters (offense), tanks (defense), scouts (mobility/escape), hybrids.  
- **Unique Abilities:** Every ship has a trait (trade bonus, loot bonus, escape bonus, etc.).  
- **Upgrades:** Exponential cost curve, capped per ship class. Lost on trade-in, but increase resale value.  
- **Progression:** Federation/Pirate ships unlock via faction allegiance. Neutral ships always available. Higher tiers gated by XP.  
- **Shipyards:** Regionalized (Fed ports, Pirate havens, Neutral hubs). Limited ship stock, restocks slower than commodities.  
- **Economy:** Costs scale from a few thousand credits to millions.  

---

## Base Stats & Mechanics

### Attributes
- **Holds**: cargo capacity (units; Equipment counts double).
- **Shields**: defensive buffer.  
- **Fighters**: offensive swarm value.  
- **Torpedoes**: heavy ordnance, weighted more in combat math.  
- **Escape Rating (0–1)**: modifies retreat chance.  
- **Special Ability**: non-stat perk unique to class.  
- **Role Multipliers**: Offense/Defense tweaks applied in combat resolution.  

### Upgrade System
- **Exponential Scaling**: cost = `base * (1.4 ^ level)`  
- **Caps** (relative to base stat):
  - Holds: up to 2× base  
  - Shields: up to 2.5× base  
  - Fighters: up to 3× base  
  - Torpedoes: up to 2× base  
- **Persistence:** Upgrades are lost when selling a ship, but add to resale value (40% of upgrade investment returned).  
- **Trade-In Rule:** Base resale = 60% of original cost + 40% of invested upgrade cost. Cargo retained.  

---

## Ship Classes

### Neutral Ships (10)
| Tier | Ship | Holds | Shields | Fighters | Torps | Escape | Cost | Role | Special |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| 1 | Rustbucket Mk I | 50 | 20 | 20 | 0 | 0.2 | 5,000 | Starter Freighter | Cheap repairs |
| 1 | Comet Runner | 30 | 15 | 15 | 5 | 0.5 | 7,000 | Scout | +10% scan range |
| 2 | Merchant Shuttle | 120 | 40 | 40 | 10 | 0.3 | 20,000 | Freighter | −5% trade tax |
| 2 | Border Skiff | 60 | 60 | 60 | 20 | 0.4 | 25,000 | Balanced | −10% port fees |
| 3 | Cargo Hauler | 300 | 80 | 70 | 10 | 0.2 | 90,000 | Freighter | Extra 10% holds |
| 3 | Raider’s Bane | 100 | 120 | 120 | 30 | 0.4 | 100,000 | Defense | +5% defense in PvP |
| 4 | Star Trader | 500 | 200 | 150 | 30 | 0.3 | 300,000 | Mega-Freighter | +2% cargo profit |
| 4 | Battle Runner | 200 | 180 | 220 | 60 | 0.5 | 350,000 | Assault Hybrid | +10% retreat chance |
| 5 | Galactic Dreadnought | 200 | 400 | 400 | 120 | 0.2 | 1,200,000 | Tank | 10% reduced repair costs |
| 5 | Horizon Explorer | 300 | 220 | 250 | 80 | 0.6 | 1,500,000 | Explorer Hybrid | +1 jump scan radius |

### Federation Ships (5)
| Tier | Ship | Holds | Shields | Fighters | Torps | Escape | Cost | Role | Special |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| 2 | Fed Patrol Cutter | 60 | 100 | 60 | 20 | 0.5 | 30,000 | Patrol | +5% defense in FedSpace |
| 3 | Federation Frigate | 120 | 200 | 120 | 40 | 0.4 | 150,000 | Escort | −10% smuggling detect chance |
| 4 | Federation Cruiser | 200 | 300 | 180 | 80 | 0.4 | 500,000 | Tank | −2% port fees in Fed ports |
| 5 | Star Defender | 150 | 450 | 300 | 100 | 0.3 | 1,200,000 | Heavy Tank | +10% shield efficiency |
| 5 | Federation Flagship | 250 | 600 | 400 | 150 | 0.3 | 2,500,000 | Super-Tank | Grants nearby allies +5% defense |

### Pirate Ships (5)
| Tier | Ship | Holds | Shields | Fighters | Torps | Escape | Cost | Role | Special |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2 | Raider Skiff | 80 | 40 | 100 | 30 | 0.5 | 35,000 | Raider | +10% cargo loot |
| 3 | Smuggler Corvette | 120 | 80 | 150 | 40 | 0.6 | 100,000 | Smuggler | −10% smuggling detect chance |
| 4 | Marauder Cruiser | 180 | 150 | 220 | 70 | 0.4 | 400,000 | Assault | +15% credit loot |
| 5 | Warlord Battleship | 200 | 250 | 400 | 120 | 0.3 | 1,200,000 | Offense | +10% PvP RepXP |
| 5 | Pirate Lord Flagship | 250 | 300 | 500 | 150 | 0.2 | 2,800,000 | Super-Offense | Loots +20% credits/cargo |

---

## Progression & Unlock Rules
- **Neutral Ships:** Available at neutral shipyards always.  
- **Federation Ships:** Require Federation faction allegiance and XP threshold. Sold only in Fed ports.  
- **Pirate Ships:** Require Pirate faction allegiance and XP threshold. Sold only in Pirate Havens.  
- **Unlock progression:** Tier 1 always available. Higher tiers require XP milestones (Tier 2 at 500 XP, Tier 3 at 5,000 XP, Tier 4 at 20,000 XP, Tier 5 at 100,000 XP).  
- **Regional Stock:** Shipyards stock only 1–2 copies of mid/high-tier ships. Restock timer: 1–3 days per shipyard.  

---

## Firestore Data Model
```
/ships/{shipId}
  ownerId: string
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
  factionLock: enum (None|Federation|Pirate)
  xpRequired: int
  baseCost: int
```

```
/shipyards/{yardId}
  galaxyId: string
  region: string
  faction: enum (Neutral|Federation|Pirate)
  stock: [ {classKey:string, available:int, restockTime:timestamp} ]
```

---

## Balance Notes
- Freighters dominate economy but weak in combat.  
- Federation ships lean tank/defense, thrive in lawful zones.  
- Pirate ships lean offense/loot, thrive in chaotic zones.  
- Escape ratings diversify strategies.  
- Unique abilities flavor gameplay without breaking math.  

---

End of spec.
