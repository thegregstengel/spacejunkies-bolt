# Galaxy Feed Specification

The Galaxy Feed is a **read-only, system-generated newswire** that makes the galaxy feel alive. It highlights meaningful events without leaking tactical intel.

---

## Design Goals
- **Atmosphere over surveillance:** Celebrate milestones and shifting conditions without enabling player tracking.
- **Signal over noise:** Prioritize significant events; throttle spammy ones.
- **Consistent voice:** Short, timestamped, lore-friendly lines.

---

## Privacy Rules
- **Never include sector IDs, coordinates, or path hints.**
- **Use broad region tags only:** e.g., FedSpace, Inner Belt, Outer Rim, Deep Space, Frontier Cluster.
- **Delay or fuzz realtime combat/economic events** by 1–5 minutes.
- **Redact sensitive counts** with descriptors like “light,” “moderate,” “heavy.”
- **Deployables/workers/planet actions:** always vague location language and scale descriptors.

---

## Event Taxonomy
1. **Onboarding & Progression**
   - New player joins
   - Level ups, titles achieved
   - New ship class purchased
2. **Factions & Alignment**
   - Alignment threshold crossings
   - Rank promotions
   - Corp founded, merged, or disbanded
3. **Economy & Ports**
   - Port level-ups
   - Shortages/surpluses
   - Federation embargoes, Pirate contraband floods
   - Black Market cycles
4. **Planets**
   - Planet discovered, claimed, fortified
   - Infrastructure milestone (factories, shields)
   - Raid/defense outcomes
5. **Combat & Bounties**
   - PvP outcome (victory, bounty claim)
   - Major NPC defeats
   - Bounty issued or claimed
6. **Deployables & Control**
   - Defensive screen established/cleared
   - Chokepoint “stabilized” or “contested”
7. **System & Seasonal**
   - Daily turn reset
   - Leaderboard updates
   - Seasonal awards

---

## Example Region Tags
- FedSpace
- Federation Corridor
- Inner Belt
- Core Ring
- Frontier Cluster
- Outer Rim
- Deep Space
- Shrouded Nebulae
- Pirate Reaches

---

## Message Library

### Onboarding & Progression
- "A new captain has entered the galaxy."
- "{Player} advanced to Level {X}."
- "{Player} commissioned a {ShipClass}."
- "{Player} earned the title of {Title}."

### Factions & Alignment
- "{Player} swore allegiance to the Federation."
- "{Player} embraced the pirate code."
- "{CorpName} was founded."
- "{CorpName} disbanded."

### Economy & Ports
- "A Trade Hub in the Inner Belt expanded its docks."
- "Equipment demand surged across the Frontier Cluster."
- "A Black Market in the Pirate Reaches opened for business."
- "Federation embargo declared on criminal traders in FedSpace."
- "Fuel shortage reported in the Outer Rim."

### Planets
- "A new world was charted in Deep Space."
- "A colony raised its first orbital shield in the Outer Rim."
- "Raiders tested a colony’s defenses; the settlers held."
- "A colony fell to invaders in the Pirate Reaches."

### Combat & Bounties
- "{Player} claimed a high-value bounty."
- "Patrols scattered a pirate wing near FedSpace."
- "A notorious raider was brought to justice in the Pirate Reaches."
- "{Player} triumphed in a decisive space battle."

### Deployables & Control
- "A defensive screen was established along a Frontier chokepoint."
- "Minefields were swept clear in the Outer Rim."
- "A sector’s defenses were tested and endured."
- "Control of a chokepoint shifted in the Core Ring."

### System & Seasonal
- "Turns will reset at 00:00 UTC."
- "The season finale approaches; standings are shifting."
- "Leaderboard updated: Federation influence rising."
- "Season awards distributed across the galaxy."

---

## Redaction Vocabulary
- **Deployables:** "light screen," "moderate screen," "heavy screen," "formidable screen"
- **Mines:** "scattered traces," "laying detected," "dense field," "severe field"
- **Forces:** "skirmish," "engagement," "decisive battle"
- **Economy:** "uptick," "surge," "glut," "shortage," "collapse," "boom"

---

## Feed Views
- **Global Feed:** Critical/Major events, Standard summarized, Minor hidden.
- **Personal Highlights:** Corp/faction/planet-related events, followed players.
- **Economic Pulse:** Commodity/port swings by region.
- **War Report:** Battles, bounties, faction rank changes, colony outcomes.

---

## Delivery Cadence
- **Realtime with jitter:** 1–5 minutes delay on sensitive categories.
- **Digest entries:** Hourly wraps (e.g., "Three colonies fortified in the Outer Rim").
- **Daily Reset Notice:** 15 minutes before 00:00 UTC and at reset.

---

## Retention & Storage
- **Global Feed:** Last 72 hours.  
- **Personal Highlights:** 14 days.  
- Pagination by time, max ~100 entries per fetch.

---

## QA Checklist
- No sector IDs or coordinates.  
- Region tag from approved set.  
- Message < 100 characters.  
- Priority/rate limits applied.  
- Jitter applied to sensitive categories.  
- i18n placeholders validated.

---
