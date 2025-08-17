# Combat Resolution & Balance Specification
Version: 1.0
Status: Developer-ready

## Purpose
Define an instant, math-based combat system for Space Junkies that is fast to compute, fair to players, and easy to tune. The model uses simple core stats (fighters, shields, torpedoes) plus ship-class role multipliers, region influence, and player faction/XP modifiers. It supports PvP and PvE with the same core math, includes a retreat option, non-destructive defeats with repair flows, and safe Galaxy Feed announcements without revealing sector locations.

---

## Design Summary
- **Resolution style:** Instant math-based outcome (no round-by-round loop).
- **Core stats:** Fighters, Shields, Torpedoes. No boarding/ECM for v1.
- **Class multipliers:** Federation ships lean defensive; Pirate ships lean offensive; Neutral ships balanced.
- **Region & faction/XP:** Region tag and player progression add small, bounded modifiers.
- **Turn costs:** Initiating combat costs 1 turn for the attacker. No per-volley costs.
- **PvP and PvE:** Same formula; NPCs use same parameters with tuned baselines.
- **Outcome:** Winner determined by effective power and RNG drizzle; loser becomes **disabled** (not destroyed) and must repair.
- **Loot:** Credits and cargo stolen are **limited by the winner's ship** capacity and class loot factor.
- **Retreat:** Defender may attempt a retreat roll before resolution; chance based on ship escape rating and situation.
- **Feed:** Battles are reported with region tags only; no sector IDs or timing precise enough for live tailing.

---

## Notation
Let A be attacker, D be defender.

- Fighters: F_A, F_D
- Shields: S_A, S_D
- Torpedoes: T_A, T_D
- Base ship class power: B_A, B_D (a constant per ship class)
- Ship role multipliers: roleOff_A, roleDef_A; roleOff_D, roleDef_D
- Region modifier: R_A, R_D in [0.9, 1.1]
- Faction/XP modifier: X_A, X_D in [0.95, 1.10]
- Random drizzle: z in [0.98, 1.02]
- Escape rating: E_D in [0.0, 1.0]
- Attacker pressure term: P_A = min(1.0, F_A / (F_A + F_D + 1e-6))

All per-ship constants are defined in the Ships & Upgrades spec.

---

## Effective Power Formula

### 1) Raw Power
For side i in {A, D}:
- RawPower_i = B_i + a_F * F_i + a_S * S_i + a_T * T_i

Default coefficients (tunable):
- a_F = 0.8
- a_S = 1.2
- a_T = 2.0

### 2) Role Modulation
Each ship class carries small role multipliers:
- Federation classes: roleDef in [1.05 .. 1.12], roleOff in [0.95 .. 1.02]
- Pirate classes: roleOff in [1.05 .. 1.12], roleDef in [0.95 .. 1.02]
- Neutral classes: both ~1.00

Apply:
- OffPower_i = RawPower_i * roleOff_i
- DefPower_i = RawPower_i * roleDef_i

### 3) Region Modifiers
Based on region tag of the combat:
- FedSpace: Lawful defenders +0.10, attackers +0.00
- Federation Corridor: Lawful defenders +0.05, others +0.00
- Inner Belt, Core Ring: All +0.00
- Frontier Cluster: Attackers +0.02
- Outer Rim: Attackers +0.05
- Pirate Reaches: Pirates +0.10 (both A or D if ship alignment is Pirate)
- Deep Space, Nebula: +0.00

We map these to R_A, R_D multipliers:
- AttackerPower_i *= (1.0 + regionBonus_i)

### 4) Faction/XP Modifiers
Compute a bounded progression bonus from a player's alignment and combat XP tier.
- Alignment bonus:
  - If attacking pirates: lawful attacker gets +0.03
  - If attacking lawful: criminal attacker suffers -0.03
  - Otherwise 0.00
- XP tier bonus (from player level or combat skill): up to +0.07 at endgame
  - X_i = clamp(1.0 + tierBonus_i + alignAdj_i, 0.95, 1.10)

### 5) Effective Attacker and Defender Power
- Eff_A = OffPower_A * R_A * X_A
- Eff_D = DefPower_D * R_D * X_D

### 6) Random Drizzle
To avoid hard edges, multiply both sides by a tiny random drizzle:
- Eff_A' = Eff_A * z_A , Eff_D' = Eff_D * z_D with z in [0.98, 1.02]

### 7) Win Probability and Resolution
Compute win probability for attacker:
- p_win = Eff_A' / (Eff_A' + Eff_D')

Draw a Bernoulli(p_win) to determine the winner.

---

## Retreat Mechanic

### Defender Pre-check
Before resolution, the **defender may attempt a retreat** if not docked and has turns remaining. Retreat consumes 1 turn on success.

Retreat chance:
- p_escape = clamp(0.25 + 0.35 * E_D - 0.15 * P_A + 0.05 * I_region, 0.05, 0.85)

Where:
- E_D: ship's escape rating in [0..1] (higher is faster/stealthier classes)
- P_A: attacker pressure from fighter advantage
- I_region: region bonus for fleeing in lawful zones (+1 in FedSpace/Corridor, 0 elsewhere)

On success: defender moves to a random connected safe sector (never reveals sector in Feed). On fail: combat proceeds.

---

## Damage, Disable, and Repairs

### Outcome Effects
- The **loser becomes DISABLED**: cannot move, fight, or trade until repaired.
- Winner suffers attrition proportional to combat closeness.

Attrition model (applied to winner):
- attr = 1.0 - p_win if attacker won; else attr = p_win
- Fighters lost: floor(F_winner * attr * 0.4)
- Shields lost: floor(S_winner * attr * 0.25)
- Torpedoes spent: floor(T_winner * (0.2 + 0.5 * attr))

Loser damage:
- Fighters to 0
- Shields to 0
- Torpedoes to 0
- Hull state set to DISABLED

### Repairs
- **Field Repair Kit**: partial restore to exit DISABLED (consumes credits and turns)
  - Cost: base 2,500 credits + 10 credits per missing fighter + 2 credits per missing shield
  - Turn cost: 2 turns
- **Tow to Port** (auto or player-triggered):
  - Cost: 5% of ship value (minimum 10,000 credits)
  - Turn cost: none (real-time delay 3 minutes server-side)
- **Shipyard Repair**:
  - Full restore at port; cost scaling with class and missing stats
  - Turn cost: 1 turn to dock, then 0 to repair

While DISABLED, players cannot be chain-ganked: apply a 2-minute **invulnerability window** from additional PvP initiation attempts.

---

## Loot Rules
Loot scales with the **winner's ship** capacity and role.

### Caps and Factors
- Credits stolen: up to `min(credit_cap, target_credits * credit_factor)`
  - credit_cap by winner class tier: Tier 1 5k, T2 15k, T3 40k, T4 100k, T5 200k
  - credit_factor by role:
    - Pirate-offense ships: 0.35
    - Neutral: 0.25
    - Federation-defense ships: 0.20
- Cargo stolen: up to free cargo holds, limited by `cargo_factor`:
  - Pirate/offense: 0.40 of target cargo units
  - Neutral: 0.30
  - Federation/defense: 0.25
- Deployables on-board cannot be stolen; torpedoes and fighters are not transferred, only consumed.
- Banked credits are always safe.

Winner also gains small RepXP if PvE, or scaled by relative strength in PvP (see Alignment below).

---

## Alignment and Reputation Changes

### Alignment
- Attacking lawful-aligned players or Federation patrols: attacker alignment shifts **negative**.
- Attacking pirates or raiders: attacker alignment shifts **positive**.
- Magnitude scales with **relative strength** to discourage seal-clubbing:
  - rel = clamp(Eff_strong / Eff_weak, 1.0, 3.0)
  - baseAlign = 10
  - delta = round(baseAlign / rel)
  - Apply sign based on target type

### Reputation (RepXP)
- PvE victories grant RepXP by target tier.
- PvP grants RepXP based on closeness:
  - closeFight = abs(p_win - 0.5)
  - rep = floor(300 * (1.0 - 2 * closeFight))  // max near even odds
  - Clamp to [50, 300] for clean ranges

---

## Region Difficulty Scaling
NPC stat baselines scale by region:
- FedSpace, Corridor: Patrols are tougher defensively (+10% shields)
- Frontier: Balanced
- Outer Rim: NPC raiders stronger offensively (+10% fighters)
- Pirate Reaches: Pirate wings +15% offense, +5% chance to ambush

No separate formula; just baseline stat multipliers.

---

## Firestore Data Model

```
/combat/{combatId}
  galaxyId: string
  t: timestamp
  region: string               // FedSpace, Outer Rim, etc.
  attacker: { playerId, shipId, classKey, alignment, xpTier }
  defender: { playerId?, npcType?, shipId?, classKey, alignment, xpTier }
  pre: { FA:int, SA:int, TA:int, FD:int, SD:int, TD:int }
  params: { B_A:int, B_D:int, aF:float, aS:float, aT:float, roleA:{off:float,def:float}, roleD:{...},
            regionA:float, regionD:float, X_A:float, X_D:float, zA:float, zD:float,
            pWin:float, triedRetreat:bool, pEscape:float, escaped:bool }
  result: { winner:"A"|"D"|"escape", loot:{credits:int, cargo:{fuel:int, organics:int, equipment:int}},
            attrition:{A:{fighters:int,shields:int,torps:int}, D:{fighters:int,shields:int,torps:int}},
            disable:{A:bool,D:bool} }
  privacy: { hideSector:true }
```

```
/ships/{shipId}
  status: "OK"|"DISABLED"
  disabledAt: timestamp?
  repair: { pendingTow:bool, towEta:timestamp?, pendingRepair:bool }
```

Indexes:
- combat.galaxyId + t
- combat.attacker.playerId
- combat.defender.playerId

Security:
- Only involved players can read full details; others see redacted combat summary (no names if privacy toggles).

---

## Cloud Functions API

- `combat.initiate(targetId)`
  - Preconditions: same sector, attacker has 1 turn, defender not docked
  - Side effects: may prompt defender retreat roll
  - Returns: combatId

- `combat.resolve(combatId)`
  - Applies formulas, writes logs, updates ship states, credits, cargo, alignment, RepXP
  - Posts Galaxy Feed with a safe message

- `combat.repair(shipId, mode)`
  - mode in {"field_kit","tow","shipyard"}
  - Charges credits, updates status

- `combat.retreat(combatId)`
  - Internal helper called by initiate when defender eligible

Error codes:
- ERR_NO_TURNS, ERR_DOCKED_TARGET, ERR_DISABLED, ERR_COOLDOWN, ERR_SAME_FACTION_PROTECTED (if applicable)

---

## Galaxy Feed Integration
Announce with **region tag only**:

Examples:
- "A patrol scattered raiders near FedSpace."
- "A decisive clash echoed through the Outer Rim."
- "A notorious raider was bested in the Pirate Reaches."

No sector IDs. Delay posts by 1 to 3 minutes to avoid live tailing.

---

## Worked Examples

### Example 1: Pirate Offense vs Federation Defense (Outer Rim)
- Pirate Marauder (A): B_A=120, F_A=300, S_A=120, T_A=40
- Federation Cruiser (D): B_D=130, F_D=220, S_D=220, T_D=35
- Coeff: aF=0.8, aS=1.2, aT=2.0
- Role: Pirate off=1.10 def=0.97; Federation off=0.98 def=1.08
- Region: Outer Rim attacker +0.05
- XP/Faction: Pirate attacker tier +0.04; lawful defender +0.03

Compute:
- Raw_A = 120 + 0.8*300 + 1.2*120 + 2.0*40 = 120 + 240 + 144 + 80 = 584
- Off_A = 584 * 1.10 = 642.4
- Raw_D = 130 + 0.8*220 + 1.2*220 + 2.0*35 = 130 + 176 + 264 + 70 = 640
- Def_D = 640 * 1.08 = 691.2
- Region: R_A=1.05, R_D=1.00
- XP/Faction: X_A=1.04, X_D=1.03
- Eff_A = 642.4 * 1.05 * 1.04 = 700.4
- Eff_D = 691.2 * 1.00 * 1.03 = 711.9
- zA=1.01, zD=0.99 → Eff_A'=707.4, Eff_D'=704.8
- p_win = 707.4 / (707.4 + 704.8) = 0.5018

Attacker barely favored; attrition low for winner.

### Example 2: Retreat Attempt in FedSpace
- Defender E_D=0.7, Attacker F advantage high → P_A=0.65
- p_escape = clamp(0.25 + 0.35*0.7 - 0.15*0.65 + 0.05*1, 0.05, 0.85)
- p_escape = clamp(0.25 + 0.245 - 0.0975 + 0.05, 0.05, 0.85) = 0.4475
- 44.75% chance to escape before combat.

---

## Balance Knobs
- aF, aS, aT
- Role multipliers per class
- Region bonuses
- XP tier curve and caps
- Loot caps and factors
- Attrition multipliers
- Repair costs and invulnerability window
- Retreat base chance and pressure weight

---

## QA & Anti-Exploit
- Server-authoritative combat; block client tampering.
- Atomic updates on credits/cargo/damage to prevent dupes.
- Cooldown after retreat fail to avoid spam attempts (e.g., 30 seconds).
- Prevent combat initiation if either ship is DISABLED or in invulnerability window.
- Redact names in public combat summaries if players enabled privacy toggles.

---

End of spec.
