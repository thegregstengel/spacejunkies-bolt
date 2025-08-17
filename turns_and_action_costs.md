# Turns & Action Costs Specification
Version: 1.0  
Status: Developer-ready (TW2002-simple)

## Purpose
Define turn-based action economy for Space Junkies. Turns are the single global pacing mechanic. They reset daily for all players at 00:00 UTC. No purchases, bonuses, or overflow mechanics exist.

---

## A. Core Rules
- **Turn pool per day:** 250 fixed.  
- **Reset time:** 00:00 UTC for all galaxies.  
- **No carryover:** unused turns are lost.  
- **No bonuses:** missions, factions, or items never give more turns.

---

## B. Turn Costs
- **Movement:** 1 turn per sector traveled.  
- **Combat (initiate):** 1 turn.  
- **Docking/Undocking:** 1 turn.  
- **Scanning:** 1 turn.  
- **Deploying defenses:** 1 turn per deploy action.  
- **Trading:** 0 turns (buy/sell free).  
- **Banking:** 0 turns (deposit/withdraw free).  
- **Ship management (rename, buy, upgrade):** 0 turns (only credits).  

---

## C. Edge Cases
- If a player runs out of turns:
  - They cannot move, dock, or scan.  
  - If in open space (not docked), they are **vulnerable** to attack.  
- Players at 0 turns cannot attack but can still be attacked.  
- Daily reset always restores full 250, even if disabled or mid-combat.  

---

## D. Integration
- **Combat:** initiating a fight always costs 1 turn.  
- **Economy:** trading doesn’t consume turns, but moving to new ports does.  
- **Deployables:** laying fighters/mines/etc. consumes 1 turn per action.  
- **Galaxy Feed:** no announcements for turn usage; purely pacing mechanic.

---

End of spec.
