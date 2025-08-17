# Sector Generation & Regions Specification
Version: 1.0
Status: Draft (developer-ready)

## Purpose
Define a deterministic, scalable algorithm to generate a 20,000-sector galaxy as a **random graph** with **hard-coded regions**, **rare one‑way shortcuts**, **discoverable special/isolated pockets**, **hazards**, **landmarks**, and **empty sectors**. Output must be reproducible from a seed and safe for mobile clients.

## Requirements (from product decisions)
1. **Topology:** Primary structure is a **random graph** (TW2002 vibe), not a fixed grid.
2. **Special Isolates:** A **small number** of **discoverable**, intentionally isolated sector pockets exist (not initially connected to FedSpace), unlockable via scanning, rumors, or mission items.
3. **Link Types:** Normal links are bidirectional; include **rare one‑way links** (wormholes), and rarer high‑capacity shortcuts (“warp highways”).
4. **Regions:** Galaxy must contain **hard-coded regions** (FedSpace center, Pirate edges, etc.), but sector content within a region is still randomized.
5. **Hazards:** Generate hazard sectors that impact traversal and play (turn cost, interference, risk).
6. **Landmarks:** Generate rare landmarks (black holes, ancient ruins, relic outposts, anomaly beacons).
7. **Connectivity Density:** Support **both** dense webs and sparse, chokepoint-heavy zones to make deployables relevant and exploration interesting.
8. **Empty Sectors:** Some sectors are intentionally empty (no POIs).

---

## Glossary
- **Sector:** Node in the galaxy graph.
- **Link (Edge):** Traversable connection between sectors; direction can be bi- or uni-directional.
- **Region:** Thematic cluster of sectors with weights for content and hazards.
- **POI:** Point of Interest (port, planet, landmark).
- **Isolate:** A small, intentionally disconnected subgraph discoverable by special mechanics.

---

## Region Frame (hard-coded regions)
The galaxy is partitioned into named macro-regions. Each sector belongs to exactly one region.

| Region Key | Theme | Target % of Sectors | Density | Notes |
|---|---|---:|---:|---|
| FED_CORE | FedSpace (Stardock hub) | 1.0–1.5% (200–300) | Medium | PvP off in core; starter routes |
| FED_CORR | Federation Corridor | 6–8% (1200–1600) | Medium‑High | Safer lanes leading outward |
| INNER | Inner Belt | 12–15% (2400–3000) | High | Many ports; patrol chance |
| CORE | Core Ring | 18–20% (3600–4000) | Medium | Balanced economy |
| FRONTIER | Frontier Cluster | 18–22% (3600–4400) | Mixed | Transitional; rising hazards |
| OUTER | Outer Rim | 18–22% (3600–4400) | Low‑Medium | Sparser graph; chokepoints |
| PIRATE | Pirate Reaches | 10–12% (2000–2400) | Low | High ambush/caches; outlaw hubs |
| DEEP | Deep Space | 6–8% (1200–1600) | Very Low | Sparse links; anomalies |
| NEBULA | Shrouded Nebulae bands | 2–3% (400–600) | Low | Scanner penalties; hazard belts |

> Percentages sum to ~100% allowing ±1–2% slack for isolates and rounding.

### Region Weights (content tendencies)
- **Ports:** Highest in INNER/CORE; low in OUTER/DEEP; lawful hubs in FED_CORE/FED_CORR; pirate/bad ports in PIRATE.
- **Planets:** Spread across CORE/FRONTIER/OUTER; rare in FED_CORE; hidden caches in PIRATE/DEEP.
- **Hazards:** NEBULA/OUTER/DEEP heavy; modest in FRONTIER; minimal in FED_CORE/INNER.
- **Landmarks:** Low global chance; boosted in DEEP/NEBULA/PIRATE for ruins/black holes/ancients.

---

## Target Content Mix (20,000 sectors)
These are **defaults**; tune per season.

- **Empty sectors:** 35–45% (7000–9000)
- **Ports:** ~20% (≈4,000) total across all archetypes
- **Planets:** 8–12% (≈1600–2400)
- **Hazard-only sectors:** 5–8% (≈1000–1600)
- **Landmark sectors:** 1–2% (≈200–400) [black holes, ruins, relic outposts, beacons]
- **Mixed sectors:** remainder (multiple features; keep ≤10% to avoid UI clutter)

> Ensure at least one **Stardock** in FED_CORE (the main hub).

---

## Graph Generation Overview
We build an **undirected base graph** per region, add regional “highways”, then sprinkle **one‑way wormholes** and **isolates**.

### Step 0 – Seed & PRNG
- Use **seed = SHA256(galaxyId + seasonId + genVersion)**.
- PRNG: PCG32 or xoshiro256** for determinism and speed.
- All subsequent random calls derive from a per-phase split mix (avoid cross‑phase correlation).

### Step 1 – Region Partitioning
- Assign sector counts by region based on table above.
- Create an array of sector IDs [0..N-1], assign region keys, and shuffle for noise.

### Step 2 – Intra‑Region Graphs (base edges)
For each region R with n_R sectors:
- Choose **degree distribution** by region:
  - FED_CORE: target deg 3–4
  - FED_CORR/INNER: 4–5
  - CORE: 3–4
  - FRONTIER: 2–3
  - OUTER/PIRATE: 1–3 (intentionally sparser, chokepoints)
  - DEEP/NEBULA: 1–2 (very sparse)
- Generate using **random k‑NN on latent coordinates** + **Erdos‑Renyi rewiring**:
  1. Sample latent 2D coords (Gaussian blob per region).
  2. Connect to nearest neighbors up to target degree.
  3. Rewire a % of edges uniformly to add variation (p=0.08–0.15 by region).

### Step 3 – Inter‑Region Connectors (highways)
- Create **region hubs** (5–12 per large region, 1–3 for small ones).
- Connect hubs along these spines:
  - FED_CORE ↔ FED_CORR ↔ INNER ↔ CORE ↔ FRONTIER ↔ OUTER
  - CORE ↔ PIRATE (limited bridges; chokepoints)
  - FRONTIER/OUTER ↔ DEEP (few links)
  - NEBULA intersects belts with low crossers
- Add **warp highways**: 50–120 long-range edges connecting hub pairs (bidirectional), higher degree capacity nodes (cap deg 8–10 along highways).

### Step 4 – One‑Way Links (wormholes)
- Add **1.0–2.5%** of total edges as **directed** one‑way links.
- Placement: favor DEEP, NEBULA, PIRATE; avoid FED_CORE.
- Behavior: instantaneous traversal in link direction; return path must be discovered separately (if any).

### Step 5 – Special Isolates (discoverable pockets)
- Create **K = 8–20** isolated subgraphs (size 5–25 sectors each).
- No initial connections to the main graph.
- Access mechanics (gameplay layer):
  - High‑tier scanners, mission keys, rumor chains.
- Content: high‑value landmarks, rare ports, or unique planets; hazard density ↑.

### Step 6 – POI Placement
Within each region, assign content by weighted tables:
- **Ports** (~4,000 total):
  - Standard (≈60%): split Fuel/Organics/Equipment triads across INNER/CORE/FRONTIER.
  - Special (≈20–25%): Depots, Agri, Tech Outposts across CORE/FRONTIER.
  - Good/Federation (≈7–10%): FED_CORE/FED_CORR + nearby CORE.
  - Pirate/Bad (≈7–10%): PIRATE + OUTER edges.
- **Planets** (≈1,600–2,400): CORE/FRONTIER/OUTER heavy, rare in FED_CORE, hidden in PIRATE/DEEP.
- **Hazards:** NEBULA/DEEP belts; scatter in FRONTIER/OUTER.
- **Landmarks:** low global chance; boosted in DEEP/PIRATE/NEBULA.

### Step 7 – Validation & Fix‑Ups
- **Connectivity:** Ensure the **main graph** (excluding isolates) is a single connected component.
- **Dead‑end targets:** 15–25% of sectors with degree 1 in OUTER/PIRATE/DEEP; ≤10% elsewhere.
- **Path to FedSpace:** Every non‑isolate sector must have a path to FED_CORE.
- **Degree caps:** hard cap per region (FED up to 6, highways up to 10, DEEP up to 3).
- **Hazard bounds:** ensure hazard belts are crossable (at least 2 clear routes per belt).

---

## Hazards (mechanics summary)
Each hazard sector has one or more effects (values tuned per season):

| Hazard | Effect on Travel | Scan/Combat | Other |
|---|---|---|---|
| **Nebula** | +1 turn to enter; chance to jam scanners | Scan range halved; deployables harder to detect | No long‑range scans through belt |
| **Radiation Zone** | +1–2 turns; chance of shield tick damage | Fighters lose 5–10% effectiveness | Repair costs +X% if damaged here |
| **Ion Storm** | 10–20% chance to bounce to a neighbor | Torpedoes misfire chance +Y% | Disables cloak for 1 tick |
| **Grav Rift** | Entry blocked unless ship class ≥ threshold | — | Requires module or mission |
| **Minefield (NPC)** | Auto damage unless cleared | — | Spawns in PIRATE events |

> Hazard data lives on the sector doc; client shows warning icon before entry.

---

## Landmarks (rare POIs)
- **Black Hole:** On entry, teleport to a random exit landmark; +turn cost. May be one‑way.
- **Ancient Ruins:** One‑off lore sites; sometimes grant unique modules/missions.
- **Relic Outpost:** Sells exotic tech at extreme prices; stock rotates.
- **Anomaly Beacon:** Region‑wide temporary effect (e.g., reduced scanner accuracy).

Spawn rates (defaults, across galaxy):
- Black Holes: 20–40
- Ruins: 80–120
- Relic Outposts: 20–40
- Beacons: 40–60

---

## Data Model (Firestore, draft)
```
/galaxies/{galaxyId}
  seed: string
  genVersion: number
  createdAt: timestamp
  size: number (e.g., 20000)
  regionBreakdown: map<string, number>
  stats: { edges: number, oneWayEdges: number, isolates: number, ... }

/galaxies/{galaxyId}/sectors/{sectorId}
  region: string (enum: FED_CORE, FED_CORR, INNER, CORE, FRONTIER, OUTER, PIRATE, DEEP, NEBULA)
  pois: { ports: [portId], planets: [planetId], landmarks: [landmarkId] }
  hazards: [ { type: string, level: int } ]
  isIsolate: boolean
  links:
    undirected: [sectorId]
    oneWayOut: [sectorId]
    oneWayIn: [sectorId]
  degree: { undirected: int, in: int, out: int }
  coords: { x: float, y: float }  // latent layout only (not shown to players)
  flags: { highwayHub: bool, regionHub: bool }

/galaxies/{galaxyId}/ports/{portId}
  sectorId: string
  archetype: string
  level: int
  stock: { fuel: int, organics: int, equipment: int }
  price: { fuel: int, organics: int, equipment: int }
  faction: string?  // Federation/Pirate/Neutral

/galaxies/{galaxyId}/planets/{planetId}
  sectorId: string
  class: string
  defenses: { shields: int, fighters: int, mines: int }
  production: { fuel: float, organics: float, equipment: float }

/galaxies/{galaxyId}/landmarks/{landmarkId}
  sectorId: string
  type: string
  params: map

/galaxies/{galaxyId}/isolates/{isolateId}
  sectorIds: [string]
  unlock: { keyItemId?: string, scannerLevel?: int, missionId?: string }
```

Indexes:
- `sectors.region` (collection group)
- `sectors.flags.highwayHub`
- `ports.archetype`, `ports.faction`
- `landmarks.type`
- Composite: `sectors.region + sectors.isIsolate`

Security (outline):
- Sector graph read: public (read masks, omit coords for clients).
- Writes: server-authoritative only (Cloud Functions).
- Isolate unlock state: per‑player record kept server-side.

---

## Generation Parameters (tunable defaults)
```
SEED_VERSION = 3
TARGET_SIZE = 20000
ISOLATE_COUNT = [8, 20]  // random in range
ISOLATE_SIZE = [5, 25]

ONE_WAY_EDGE_RATE = 0.015  // 1.5% of total edges
HIGHWAY_EDGES = [50, 120]

DEADEND_TARGET_OUTER = 0.25
DEADEND_TARGET_OTHER = 0.10

HAZARD_RATE_GLOBAL = 0.07
LANDMARK_RATE_GLOBAL = 0.015
EMPTY_RATE_GLOBAL = 0.40
```

---

## Generation Algorithm (pseudocode)
```
seed = deriveSeed(galaxyId, seasonId, genVersion)
rng = PRNG(seed)

regions = assignRegions(TARGET_SIZE, rng)
G = Graph()

for region in regions.unique():
  S = sectorsIn(region)
  placeLatentCoords(S, rng)
  E = buildBaseEdges(S, targetDeg(region), rng)     // kNN + rewiring
  G.addEdges(E)

connectRegionHubs(G, regions, rng)                  // highways
addOneWayWormholes(G, rate=ONE_WAY_EDGE_RATE, rng)

isolates = buildIsolates(ISOLATE_COUNT, ISOLATE_SIZE, rng)
placeIsolates(isolates, rng)                        // kept separate from G

assignPOIsAndHazards(G, regions, rng)
validateAndFixUp(G, constraints)

persistToFirestore(galaxyId, G, isolates, seed, stats)
```

---

## Validation Suite
- **Connectivity:** BFS from FED_CORE reaches all non‑isolate sectors.
- **Degree Bounds:** Within regional caps; print percentiles.
- **Dead‑end Ratios:** Match targets per region.
- **Highways Present:** At least MIN highway edges; hubs non‑overlapping beyond cap.
- **Hazard Passages:** Each belt has ≥2 viable non‑hazard routes across region borders.
- **POI Quotas:** Ports/planets/landmarks within ±5% of targets.
- **One‑Way Balance:** No more than 10% of nodes have only one‑way egress without ingress.

---

## Worked Example (Seed SJ-2025-08-CORE)
- Regions assigned: counts within 1.2% slack.
- Edges total: ~70,000 (avg deg ≈ 3.5).
- One‑way edges: ~1,050 (1.5%).
- Highways: 93 edges across 41 hubs.
- Isolates: 12 pockets (sizes 6–18); 2 themed as “Ancient Vaults”.
- POIs: 3,980 ports, 2,060 planets, 310 landmarks, ~1,280 hazard‑only, ~8,020 empty.
- Validation: All main graph sectors reachable from FED_CORE; dead‑end ratio OUTER=24%, PIRATE=22%, others ≤ 9%.

---

## Integration Hooks
- **Galaxy Feed:** Post non‑locational messages when:
  - Highways established (at generation) → “Trade lanes coalesced through central space.”
  - Landmark anomalies activate/deactivate.
  - Isolate pockets discovered or unlocked by a player.
- **Missions:** Seed recon/escort/raid missions weighted by region and recent Feed events.
- **Economy:** Region weights drive initial port stock and volatility.
- **Factions:** Initial influence maps: FED high in FED_* and INNER; PIRATE high in PIRATE/OUTER.

---

## QA & Edge Cases
- Ensure isolates never spawn uncompletable missions (gate with unlocks).
- Prevent wormhole chains that soft‑lock new players far from FedSpace.
- Cap hazard stack so a path never requires > +3 turns cumulative penalties between safe hubs.
- Avoid too many multi‑POI sectors (≤10% cap) to keep mobile UI clean.
- Regenerate if Stardock not placed in FED_CORE.

---

## Future Extensions
- Dynamic region drift (influence moves borders seasonally).
- Time‑limited wormholes (appear/disappear).
- Procedural lore strings for landmarks (i18n keys).

---

End of spec.
