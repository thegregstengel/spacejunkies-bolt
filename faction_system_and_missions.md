# Factions & Missions Specification

This document defines the **Faction System** and a **Mission Library** for Space Junkies. It is developer-ready and consistent with the Galaxy Feed and privacy rules (no sector IDs, broad region tags only).

---

## 1. Alignment & Factions

### 1.1 Alignment Scale
- Range: **-1000 .. +1000**
- Thresholds (tunable):
  - Pirate Access: **<= -250**
  - Pirate High Ranks/Ships: **<= -500**, **<= -700**, **<= -900**
  - Federation Access: **>= +250**
  - Federation High Ranks/Ships: **>= +500**, **>= +700**, **>= +900**

### 1.2 Alignment Sources
- Positive (Federation-leaning): defend colonies/ports, escort missions, aid deliveries, defeating pirates/NPC raiders.
- Negative (Pirate-leaning): raiding traders/colonies, smuggling, hijacking, defeating Federation patrols.
- Neutral: routine trading, exploration, scanning anomalies.

### 1.3 Rank Ladders (example)
- Federation: Ensign → Lieutenant → Commander → Captain → Admiral
- Pirates: Cutpurse → Corsair → Marauder → Captain → Warlord

Ranks are unlocked by a combination of **Alignment** and **Reputation XP (RepXP)** from missions.

---

## 2. Reputation XP (RepXP)

### 2.1 Sources
- Completing faction missions
- Major colony milestones (defenses online, first factory)
- Significant combat outcomes (decisive victory, bounty claims)

### 2.2 Sinks / Penalties
- Failing timed missions
- Attacking your own faction’s protected assets
- Defection (switching sides) applies a temporary **RepXP decay** and **mission lockout**

### 2.3 RepXP Tiers (default)
- Tier I: 0–999
- Tier II: 1000–2999
- Tier III: 3000–6999
- Tier IV: 7000–14999
- Tier V: 15000+

Each Tier unlocks new mission pools, perks, and discounts at aligned ports.

---

## 3. Faction Missions Overview

Missions are **turn-based**, server-authoritative tasks that award Credits, RepXP, and Alignment shifts. All mission text must follow privacy rules (no sectors).

### 3.1 Mission Properties (Schema)
- `id`: unique string key
- `faction`: Federation | Pirate | Neutral (contractors)
- `tier`: I..V (difficulty and rewards)
- `type`: Delivery | Escort | Patrol | Raid | Smuggle | Hijack | Recon | Fortify | Sabotage | Hunt | Evacuate | Aid
- `objective`: one-line purpose
- `steps`: ordered list of actions
- `constraints`: timers, cargo limits, stealth, no-PvP, etc.
- `rewards`: Credits, RepXP, AlignmentDelta, bonus items
- `failure`: conditions that cause failure
- `cooldown`: minutes before this mission archetype can reappear for the same player
- `feed`: safe message template(s) for Galaxy Feed
- `region_tags`: allowed region tags for spawning the contract
- `spawn_rules`: prerequisites (rank, ship class capabilities, modules)
- `notes`: balancing or implementation details

### 3.2 Reward Baseline (by Tier; tune per season)
- Credits: Tier I 1k–3k, II 3k–10k, III 10k–30k, IV 30k–75k, V 75k–200k
- RepXP: Tier I 50–150, II 150–400, III 400–900, IV 900–1800, V 1800–3500
- AlignmentDelta (abs): Tier I 5–10, II 10–20, III 20–35, IV 35–50, V 50–75

---

## 4. Mission Library

Below are curated, reusable mission archetypes with concrete parameters. Values are defaults; scale by galaxy settings.

### 4.1 Federation Missions

#### FED-DEL-01: Relief Shipment
- `faction`: Federation
- `tier`: I–II
- `type`: Delivery
- `objective`: Deliver aid crates to a colony in need.
- `steps`:
  1. Acquire {QTY} Aid Crates from a Federation Trade Hub.
  2. Travel to a colony in the **Frontier Cluster**.
  3. Dock and offload cargo.
- `constraints`: Must complete within {TIME} minutes; no contraband on board.
- `rewards`: Credits {3k–8k}, RepXP {150–300}, Alignment +{10–20}
- `failure`: Timer expires; cargo tampered; attacked the colony during mission.
- `cooldown`: 60
- `feed`: "Aid reached a struggling colony near the Frontier."
- `region_tags`: FedSpace, Federation Corridor, Frontier Cluster
- `spawn_rules`: Rank ≥ Ensign
- `notes`: Spawn during Organics shortages or after raids (synergy with Feed events).

#### FED-ESC-02: Convoy Escort
- `faction`: Federation
- `tier`: II–III
- `type`: Escort
- `objective`: Protect a civilian convoy through contested space.
- `steps`:
  1. Rally with convoy near **Federation Corridor**.
  2. Move across two contested regions.
  3. Ensure ≥ {SURVIVAL}% of transports arrive.
- `constraints`: PvP enabled regions; convoy HP tracked server-side.
- `rewards`: Credits {8k–25k}, RepXP {300–800}, Alignment +{15–30}
- `failure`: Transport losses > (100 - {SURVIVAL})%; player abandons convoy.
- `cooldown`: 120
- `feed`: "A convoy reached safe harbor despite pirate pressure."
- `region_tags`: Federation Corridor, Inner Belt, Frontier Cluster
- `spawn_rules`: Rank ≥ Lieutenant; ship requires minimum fighter capacity.
- `notes`: Scales with local Pirate influence.

#### FED-PAT-03: Patrol Lanes
- `faction`: Federation
- `tier`: I–III
- `type`: Patrol
- `objective`: Sweep and report activity along trade lanes.
- `steps`:
  1. Visit {N} waypoints in the **Inner Belt**.
  2. Scan for deployables and hostiles.
  3. Report findings at a Trade Hub.
- `constraints`: Must avoid attacking neutrals.
- `rewards`: Credits {4k–15k}, RepXP {150–600}, Alignment +{10–25}
- `failure`: Engages neutral targets; misses scans.
- `cooldown`: 45
- `feed`: "Patrols reported calm along central lanes."
- `region_tags`: Inner Belt, Core Ring
- `spawn_rules`: Rank ≥ Ensign
- `notes`: Low risk, good entry mission for Federation-aligned players.

#### FED-FOR-04: Fortify Colony
- `faction`: Federation
- `tier`: II–IV
- `type`: Fortify
- `objective`: Deliver and deploy a defensive screen for a colony.
- `steps`:
  1. Pick up defense packages from Fed Outpost.
  2. Deliver to target region in the **Outer Rim**.
  3. Deploy a **moderate** defensive screen.
- `constraints`: Requires fighters inventory; proof-of-deployment logged server-side.
- `rewards`: Credits {12k–40k}, RepXP {500–1200}, Alignment +{20–40}
- `failure`: Incomplete deployment; colony attacked during op and falls.
- `cooldown`: 180
- `feed`: "A colony raised a defensive screen on the frontier."
- `region_tags`: Outer Rim, Frontier Cluster
- `spawn_rules`: Rank ≥ Commander; ship with carrier capacity.
- `notes`: Synergizes with colony shortage/raid events.

#### FED-HNT-05: Hunt Warlord Cell
- `faction`: Federation
- `tier`: III–V
- `type`: Hunt
- `objective`: Track and neutralize a pirate cell operating near FedSpace.
- `steps`:
  1. Scan for activity traces.
  2. Engage pirate wing when located.
  3. Return to report.
- `constraints`: Combat readiness required; timer {TIME}.
- `rewards`: Credits {25k–120k}, RepXP {900–2500}, Alignment +{30–60}
- `failure`: Timer expires; pirate cell escapes after detection.
- `cooldown`: 240
- `feed`: "A pirate cell was disrupted near FedSpace."
- `region_tags`: FedSpace, Federation Corridor
- `spawn_rules`: Rank ≥ Captain
- `notes`: Difficulty scales with Pirate Influence in nearby regions.

---

### 4.2 Pirate Missions

#### PIR-SMG-01: Black Line Run
- `faction`: Pirate
- `tier`: I–II
- `type`: Smuggle
- `objective`: Move contraband between two outlaw markets.
- `steps`:
  1. Acquire {QTY} Contraband.
  2. Slip through **Inner Belt** watchers.
  3. Offload at a Black Market.
- `constraints`: If scanned by patrols, mission fails; stealth modules recommended.
- `rewards`: Credits {5k–12k}, RepXP {150–300}, Alignment -{10–20}
- `failure`: Scanned by patrols; contraband seized.
- `cooldown`: 60
- `feed`: "Contraband quietly changed hands along the belt."
- `region_tags`: Inner Belt, Pirate Reaches
- `spawn_rules`: Rank ≥ Cutpurse
- `notes`: Higher payout during Federation embargo events.

#### PIR-RAD-02: Port Harassment
- `faction`: Pirate
- `tier`: II–III
- `type`: Raid
- `objective`: Disrupt operations of a lawful port.
- `steps`:
  1. Approach and test defenses.
  2. Destroy or force retreat of port guards.
  3. Withdraw before reinforcements.
- `constraints`: Timer; heavy losses reduce payout.
- `rewards`: Credits {10k–30k}, RepXP {300–700}, Alignment -{15–30}
- `failure`: Player destroyed; port remains operational.
- `cooldown`: 120
- `feed`: "A lawful port reported interference from raiders."
- `region_tags`: Federation Corridor, Core Ring
- `spawn_rules`: Rank ≥ Corsair
- `notes`: Temporarily reduces local buy/sell stability.

#### PIR-HJK-03: Hijack Shipment
- `faction`: Pirate
- `tier`: III–IV
- `type`: Hijack
- `objective`: Intercept a high-value cargo and extract.
- `steps`:
  1. Locate freighter trail.
  2. Board or force surrender.
  3. Escape to a Smuggler’s Den.
- `constraints`: Must not destroy the cargo; stealth bonus if unspotted.
- `rewards`: Credits {25k–70k}, RepXP {700–1500}, Alignment -{25–45}
- `failure`: Cargo destroyed; apprehended by patrols.
- `cooldown`: 180
- `feed`: "Rumors speak of a freighter gone missing."
- `region_tags`: Inner Belt, Frontier Cluster
- `spawn_rules`: Rank ≥ Marauder; boarding module required.
- `notes`: Increases Pirate Influence in the path regions.

#### PIR-SAB-04: Power Down the Grid
- `faction`: Pirate
- `tier`: III–V
- `type`: Sabotage
- `objective`: Disable a colony’s orbital systems.
- `steps`:
  1. Deliver EMP charges.
  2. Trigger controlled shutdown.
  3. Flee before counter-response.
- `constraints`: Timer; no collateral on neutral settlements (penalty).
- `rewards`: Credits {30k–110k}, RepXP {1000–2200}, Alignment -{30–60}
- `failure`: Charges detected; countered by defenders.
- `cooldown`: 240
- `feed`: "A colony’s lights flickered across the frontier."
- `region_tags`: Frontier Cluster, Outer Rim
- `spawn_rules`: Rank ≥ Captain
- `notes`: Temporarily halves colony production (duration tunable).

#### PIR-EVC-05: Evacuate the Crew
- `faction`: Pirate
- `tier`: II–IV
- `type`: Evacuate
- `objective`: Extract pirates trapped after a failed raid.
- `steps`:
  1. Reach the stranded cell.
  2. Break blockade.
  3. Extract to a Safe Haven.
- `constraints`: Rescue ships must survive; timer.
- `rewards`: Credits {12k–45k}, RepXP {500–1200}, Alignment -{15–35}
- `failure`: Loss of stranded crew; interception by patrols.
- `cooldown`: 150
- `feed`: "A stranded crew slipped away under cover of chaos."
- `region_tags`: Pirate Reaches, Outer Rim
- `spawn_rules`: Rank ≥ Corsair
- `notes`: Reduces temporary bounty heat on the player.

---

### 4.3 Neutral / Contractor Missions

#### NEU-RCN-01: Recon Sweep
- `faction`: Neutral
- `tier`: I–II
- `type`: Recon
- `objective`: Scan and report anomalies.
- `steps`:
  1. Visit {N} waypoints across the **Core Ring**.
  2. Complete scans.
  3. Report to an Exchange.
- `constraints`: No cargo required; avoid combat.
- `rewards`: Credits {3k–9k}, RepXP {120–250}, Alignment ±0 (tiny drift toward last interacted faction)
- `failure`: Missed scans; engaged hostilities.
- `cooldown`: 30
- `feed`: "Anomalies were charted in central space."
- `region_tags`: Core Ring, Inner Belt
- `spawn_rules`: None
- `notes`: Seeds data for dynamic economy tuning.

#### NEU-TRD-02: Route Seeder
- `faction`: Neutral
- `tier`: I–III
- `type`: Delivery
- `objective`: Seed a new trade route by completing a four-stop loop.
- `steps`:
  1. Buy commodity A where cheap.
  2. Sell commodity A; buy commodity B.
  3. Sell commodity B; buy commodity C.
  4. Return and complete loop.
- `constraints`: Loop must be completed within {TIME}; profit tracked server-side.
- `rewards`: Credits {4k–18k}, RepXP {150–500}, Alignment ±0
- `failure`: Profit below threshold; timer expires.
- `cooldown`: 90
- `feed`: "A new loop stirred in the trade lanes."
- `region_tags`: Inner Belt, Frontier Cluster
- `spawn_rules`: None
- `notes`: Temporarily stabilizes prices along the loop.

#### NEU-AID-03: Independent Relief
- `faction`: Neutral
- `tier`: II–III
- `type`: Aid
- `objective`: Deliver relief without faction affiliation.
- `steps`:
  1. Acquire aid crates from Exchange.
  2. Deliver to a needy region in **Deep Space**.
  3. Announce completion at any Exchange.
- `constraints`: No contraband on board.
- `rewards`: Credits {6k–16k}, RepXP {250–600}, tiny Alignment shift toward the faction controlling the destination region
- `failure`: Timer; contraband carried.
- `cooldown`: 60
- `feed`: "Independent relief reached a remote colony."
- `region_tags`: Deep Space, Outer Rim
- `spawn_rules`: None
- `notes`: Good on-ramp for new players.

---

## 5. Spawn & Balance Rules

### 5.1 Regional Weighting
- Spawn mission pools weighted by **Region Influence** (Federation vs Pirate) and **recent Feed events**.
- Example: Pirate contraband flood increases **Smuggle** missions within adjacent regions for 60 minutes.

### 5.2 Player Fit
- Prefer missions matching the player’s ship capability (cargo, fighters, modules).
- Offer 3 mission choices per refresh: one safe, one moderate, one risky.

### 5.3 Timers & Costs
- All missions consume **turns** for movement and actions.
- Timers are real-time but results are server-authoritative.

### 5.4 Failure & Forfeit
- Soft fail converts to reduced rewards if minimum objectives met.
- Hard fail (critical conditions) yields no rewards and applies small RepXP penalty.

---

## 6. Galaxy Feed Integration (Safe Templates)

- Federation: "A convoy reached safe harbor despite pirate pressure."
- Federation: "Patrols reported calm along central lanes."
- Federation: "A colony raised a defensive screen on the frontier."
- Federation: "A pirate cell was disrupted near FedSpace."

- Pirate: "Contraband quietly changed hands along the belt."
- Pirate: "A lawful port reported interference from raiders."
- Pirate: "Rumors speak of a freighter gone missing."
- Pirate: "A colony’s lights flickered across the frontier."
- Pirate: "A stranded crew slipped away under cover of chaos."

- Neutral: "Anomalies were charted in central space."
- Neutral: "A new loop stirred in the trade lanes."
- Neutral: "Independent relief reached a remote colony."

All templates avoid sector IDs and use broad **region tags** only.

---

## 7. JSON Schema (Developer Reference)

```json
{
  "id": "FED-ESC-02",
  "faction": "Federation",
  "tier": "III",
  "type": "Escort",
  "objective": "Protect a civilian convoy through contested space.",
  "steps": [
    "Rally with convoy near Federation Corridor.",
    "Cross two contested regions.",
    "Ensure >= {SURVIVAL}% transports arrive."
  ],
  "constraints": {
    "timerMinutes": 45,
    "forbiddenCargo": ["Contraband"],
    "minFighterCapacity": 100
  },
  "rewards": {
    "credits": { "min": 8000, "max": 25000 },
    "repXP": { "min": 300, "max": 800 },
    "alignmentDelta": { "sign": "+", "min": 15, "max": 30 },
    "items": []
  },
  "failure": [
    "Transport losses beyond threshold",
    "Player abandons convoy"
  ],
  "cooldownMinutes": 120,
  "feed": "A convoy reached safe harbor despite pirate pressure.",
  "region_tags": ["Federation Corridor", "Inner Belt", "Frontier Cluster"],
  "spawn_rules": {
    "minRank": "Lieutenant",
    "requiredModules": []
  }
}
```

---

## 8. QA & Telemetry

- Validate no sector IDs/coordinates enter mission or feed strings.
- Track acceptance/abandon/complete ratios by mission and tier.
- Track average time-to-complete and reward-per-turn for balance.
- Monitor alignment drift rates to keep both factions attractive.
- Apply rate limits and deduping for repetitive feed spam.

---

## 9. Implementation Notes

- All mission state changes should be **server-authoritative** with transactional updates.
- Use **region tags** resolved at runtime from sector IDs (client never sees mapping).
- Rewards should be granted atomically with completion checks.
- Use jittered feed posting for sabotage/raid/hijack categories (1–5 minutes).

---

End of spec.
