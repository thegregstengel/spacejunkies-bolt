# NPC AI Behaviors Specification
Version: 1.0  
Status: Developer-ready (TW2002-simple)

## Purpose
Define simple, random NPC behaviors (Pirates, Traders, Federation Patrols) that provide encounters, challenges, and flavor in sectors. NPCs use simplified combat formulas, spawn randomly, and drop loot when defeated.

---

## A. NPC Types
- **Pirates**
  - Behavior: randomly attack players in unsecured sectors.
  - Combat: simplified, weaker than equal-tier players.
  - Loot: small credits, cargo (scaled by region).
- **Traders**
  - Behavior: move between ports, adjusting supply/demand (cosmetic).
  - Interaction: can be raided by players (PvE loot).
  - Loot: mostly cargo, low credits.
- **Federation Patrols**
  - Behavior: appear in FedSpace or core routes.
  - Combat: simplified math, defensive bias.
  - Outcome: defeating them hurts alignment.

---

## B. Spawn Rules
- Spawn chance per movement:
  - Pirate encounter: 5% base, 10% in Pirate regions, 2% in FedSpace.
  - Trader encounter: 3% base, 6% in Core regions.
  - Patrol encounter: 2% base, 7% in FedSpace.
- Encounter chance triggered when **entering a sector**.  
- Only one NPC may spawn per sector visit.

---

## C. Combat Resolution (Simplified)
- NPC stats are based on region and player XP tier.
- Resolution formula (simple ratio):
```
PlayerPower = (fighters + shields/2 + torps*3)
NPCPower = (npcFighters + npcShields/2 + npcTorps*2)
Outcome = PlayerPower - NPCPower (+/- small RNG drizzle)
```
- If PlayerPower > NPCPower → Player wins, gains loot.
- If NPCPower > PlayerPower → player disabled (repair rules apply).

---

## D. Loot
- Pirates: 10–30% of credits, 10–20% of cargo.  
- Traders: mostly cargo (Fuel/Organics/Equipment).  
- Federation Patrols: no loot; victory gives alignment penalty.  

---

## E. Integration
- Encounters consume **1 turn** (combat action).  
- NPC kills reported to **Galaxy Feed** regionally:  
  - “A trader was ambushed in the Outer Rim.”  
  - “A pirate band was destroyed in the Frontier.”  
- Feed posts have **no sector or player names**.  

---

End of spec.
