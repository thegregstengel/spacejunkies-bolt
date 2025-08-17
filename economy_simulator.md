# Economy Simulator (Ports & Trade) – Specification
Version: 1.0
Status: Developer‑Ready

## Purpose
Define the per‑port supply/demand economy for Space Junkies with **3 commodities**, **unit volume differences**, **logistic pricing**, **daily asynchronous restocks**, **usage‑driven route decay**, **regional events**, **port leveling**, **smuggling detection**, and **market intel**. Aligns with Turns (trade = 0 turn), Factions, Missions, and Galaxy Feed privacy.

---

## A. Commodities

### A.1 Commodity Set (fixed)
- **Fuel** (Dilithium Crystals) – essential for movement/ops
- **Organics** (Bio‑Neural Gel) – consumables, colony demand
- **Equipment** (Isolinear Chips) – high value, tech goods

### A.2 Unit Volume (cargo slots per unit)
| Commodity | Volume/Unit | Notes |
|---|---:|---|
| Fuel | 1 | Baseline cargo density |
| Organics | 1 | Moderate margins, swingy |
| Equipment | 2 | Bulky; higher value per unit |

> Cargo capacity checks use `sum(units_i * volume_i) ≤ holds`.

### A.3 Contraband Flag
Any cargo lot (of any commodity) can be **tagged contraband** when purchased at Pirate/Black Market ports. The tag drives **smuggling detection** and **alignment** effects; the underlying commodity stays the same.

---

## B. Prices (Elastic/Logistic Model)

### B.1 Price Bands (defaults; tunable per season)
| Commodity | Min Cr | Base Cr | Max Cr |
|---|---:|---:|---:|
| Fuel | 6 | 10 | 22 |
| Organics | 9 | 15 | 35 |
| Equipment | 15 | 25 | 60 |

### B.2 Logistic Price Curve
Let `s ∈ [0,1]` be **stock ratio** (current stock / cap) after transaction.
- Multiplier `M(s) = L_min + (L_max − L_min) / (1 + exp(k * (s − m)))`  
  - `L_min` = 0.6, `L_max` = 2.2 (port archetype can override)  
  - `m` = 0.5 (midpoint stock), `k` = 8 (steepness; volatility adjusts this)
- **Buy price** = `Base * M(s)` (player buys from port)  
- **Sell price** = `Buy price * (1 − spread)`; `spread` = 0.08–0.18 by port type

**Archetype overrides (examples):**
- Fuel Depot: `L_min=0.8, L_max=1.4, spread=0.06`
- Tech Outpost: `L_min=0.5, L_max=2.6, spread=0.15`
- Black Market: `L_min=0.4, L_max=3.0, spread=0.22`

### B.3 Taxes & Fees (by port/faction)
Percent applied on **gross trade** (post price, pre‑inventory update):
| Port Type | Law Alignment | Trade Tax | Dock Fee | Notes |
|---|---|---:|---:|---|
| Federation Trade Hub | Lawful | 5% | 0 | +2% surcharge if criminal‑aligned |
| Fed Embassy | Lawful | 3% | 0 | Discounts for high Fed rank (−1 to −3%) |
| Standard Port | Neutral | 2% | 0 | Baseline |
| Tech Outpost | Neutral | 3% | 0 | Volatile pricing |
| Fuel Depot | Neutral | 1% | 0 | Stable |
| Black Market | Outlaw | 0% | 0 | Hidden rake baked into spread |
| Pirate Haven | Outlaw | 0% | 0 | May apply random “bribe” 2–6% |
| Raider Market | Outlaw | 0% | 0 | Fighters/torps discounts |

> Taxes may be **waived or inverted** during events (Trade Fair −2% global in region; Embargo +surcharge for criminals).

---

## C. Stock, Restock, and Route Decay

### C.1 Stock Caps (tiered by port size)
| Tier | Cap Fuel | Cap Organics | Cap Equipment |
|---|---:|---:|---:|
| Small | 1,000 | 600 | 350 |
| Medium | 2,500 | 1,500 | 900 |
| Large | 6,000 | 3,800 | 2,200 |

- Archetypes modify caps: Fuel Depot +60% Fuel cap; Tech Outpost +50% Equipment cap.

### C.2 Restock Cadence (asynchronous daily)
- Each port is assigned a **fixed daily restock time** `T_p ∈ [00:00..23:59] UTC` at generation.  
- Restock adds a proportion of cap:  
  `Δstock = cap * r_base * (1 + lvl_bonus) * event_mult * decay_mult`  
  - `r_base` (per commodity): Fuel 0.20, Organics 0.18, Equipment 0.15  
  - `lvl_bonus`: +0.03 per port level (see Leveling)  
  - `event_mult`: regional shocks (e.g., shortage 0.6, surplus 1.5)  
  - `decay_mult`: see C.3

### C.3 Usage‑Driven Route Decay
Maintain an **EWMA** of net exports/imports per commodity for each port:
- `flow_t = α * trans_today + (1 − α) * flow_{t−1}`, with `α = 0.3`
- If `flow_t` shows **sustained net export**, apply decay:
  - `decay_mult = clamp(1 − flow_t / cap * d, 0.6, 1.0)`, `d=0.6`
- Sustained **net import** slightly improves restock up to `1.1×`.

This naturally **kills overused routes** without hard bans.

### C.4 NPC Trader Influence (cosmetic sim)
- Each tick, sample random “AI demand/supply” shocks per region that adjust `flow_t` probabilistically (bounded ≤ 25% of typical player volume). No actual AI ship pathing required.

---

## D. Volatility & Events (Regional)

### D.1 Volatility
Each port draws a `volatility ∈ {Low, Med, High}` (random). It adjusts:
- `k` in logistic curve by ±25%  
- daily price **noise** `ε ~ N(0, σ)`; σ = {0.5, 1.0, 1.8} credits

### D.2 Event Types (regional scope)
- **Shortage (X)**: demand spike for commodity X → `event_mult=0.6` restock, prices drift to `L_max` faster.
- **Surplus (X)**: supply glut for X → `event_mult=1.5`, prices drift toward `L_min`.
- **Trade Fair** (Good/Fed regions): −2% tax, spread −0.02 for 24–48h.
- **Embargo** (against criminals):  
  - **Block** at lawful ports in region OR  
  - **Surcharge** +6–12% (random) instead of block.  
  Duration: 12–48h (random).  
- **Contraband Flood** (Pirate regions): Black Markets reduce spread by −0.05 and price multipliers by −0.2 for 6–18h.

Event cadence (defaults):
- Per region, roll 0–2 concurrent events; new event chance 8% per hour; cooldown 12h after an event ends.

---

## E. Port Leveling (Growth & Decay)

### E.1 Leveling
- `portXP += credits_traded / 100` (after taxes)
- Level thresholds: 0, 1k, 3k, 7k, 15k, 30k, 60k, 120k, 240k, 500k
- Each level grants: `lvl_bonus = +0.03` to restock multiplier; **spread** −0.005 (min 0.05); +2% cap at Levels 3, 6, 9.

### E.2 Downgrades
- If `portXP` gains < threshold for 7 consecutive days, decay one level (min Level 1). Stock caps revert accordingly.

---

## F. Transactions

### F.1 Turn Costs
- **Trading costs 0 turns** per buy/sell action.

### F.2 Quantity & Limits
- **Full‑cargo/instant** trades allowed (no per‑click caps).  
- Guardrails: buy limited by holds; sell limited by carried cargo; port must have stock > 0.

### F.3 Price Consistency
- Price is **re‑computed** per transaction using **post‑trade** `s` to prevent ping‑pong exploits; atomic writes ensure consistency.

### F.4 Anti‑Exploit Spread
- Minimum **buy/sell spread** per archetype prevents infinite on‑site arbitrage even with noise.

---

## G. Smuggling Detection

### G.1 Triggers
- On **undock** from lawful ports (Fed)
- When **crossing lawful regions** (FedSpace, Federation Corridor, Inner Belt)
- On **dock** at lawful ports while carrying contraband

### G.2 Detection Chance
Base chance `P0` by zone:
- FedSpace 18%, Federation Corridor 12%, Inner Belt 9%, others 3%

Modifiers (multiplicative):
- Player alignment (criminal) ×1.25
- Ship stealth module ×0.75
- Event: Embargo active ×1.5
- Cargo mix: contraband fraction f → ×(1 + 0.5f)

Outcomes:
- **Confiscation** of flagged lots; **fine** 5–20% of cargo value; **alignment** +5 toward lawful (if you pay) or bounty if you flee.

---

## H. Market Intel & Scanning

### H.1 Visibility
- Docked: exact prices/stocks.  
- **Scanner Sweep**: reveals **approximate** prices for known/adjacent ports with **delay & fuzz**.
  - Delay: 2–8 minutes (random per port result)
  - Fuzz: ±5–15% random bias applied to prices
  - Feed: none (player‑only intel)

> Turn cost of scanning follows the Turn System spec (default 1 turn per sweep).

---

## I. Galaxy Feed (Economy Events)

- Broadcast **regional** or **sector‑level** econ events **not tied to a specific player**.  
- Examples (OK to include sector if not player‑triggered):  
  - “Fuel shortage reported in the Outer Rim.”  
  - “Trade Hub expanded its docks in the Inner Belt.”  
  - “Black Market in the Pirate Reaches opened for business.”  
  - “A Tech Outpost reported a surge in Equipment demand.”

> Never tie a player name to a sector location. Player‑triggered econ events use **region tags** only.

---

## J. NPC Traders (Cosmetic Sim)
- No pathing; each region samples stochastic net buy/sell shocks that adjust `flow_t` and stock by small amounts (≤ 25% of typical daily player volume).
- Shock distributions biased by region type (e.g., PIRATE favors Equipment net exports).

---

## K. Firestore Data Model (Economy)

```
/ports/{portId}
  galaxyId: string
  sectorId: string
  archetype: enum
  tier: enum (Small|Medium|Large)
  level: int
  volatility: enum (Low|Med|High)
  caps: { fuel:int, organics:int, equipment:int }
  stock: { fuel:int, organics:int, equipment:int }
  priceBands: { fuel:{min:int,base:int,max:int}, organics:{...}, equipment:{...} }
  spread: { fuel:float, organics:float, equipment:float }
  tax: float
  restockTimeUtc: string "HH:MM"
  flow: { fuel:float, organics:float, equipment:float }    // EWMA
  lastRestock: timestamp
  portXP: float
  region: string
  faction: enum (Federation|Pirate|Neutral)
  flags: { embargoed:boolean, tradeFair:boolean }

/prices_daily/{portId}/{date}
  fuel:int, organics:int, equipment:int
  volatility: enum
  eventTag?: string

/cargo_lots/{lotId}
  ownerId: string
  commodity: enum
  units: int
  contraband: boolean
  createdAt: timestamp
```

Indexes:
- `ports.galaxyId + ports.region + ports.archetype`
- `ports.restockTimeUtc`
- `prices_daily.portId + date`

Security:
- Trades via **Cloud Functions** using transactions (atomic read‑modify‑write of stock/flow/XP).

---

## L. Cloud Functions – Contracts (excerpt)

- `trade.buy(portId, commodity, units)` → updates stock, flow, portXP; returns unit price, tax, total, post‑trade prices.  
- `trade.sell(portId, commodity, units)` → validates cargo lot; updates stock/flow/XP.  
- `economy.restock(portId)` → scheduled per port at `restockTimeUtc`.  
- `economy.rollRegionEvent(region)` → starts/ends events with TTL.  
- `economy.scanMarket(originSectorId, radius)` → returns delayed, fuzzed intel envelopes.

Errors:
- `ERR_NO_STOCK`, `ERR_NO_CARGO_SPACE`, `ERR_CONTRABAND_BLOCKED`, `ERR_EMBARGO_ACTIVE`, `ERR_TXN_CONFLICT`

---

## M. Worked Examples

### M.1 Logistic Pricing Example (Tech Outpost, Equipment)
- Caps: 2,200 (Large with +50%)
- Current stock: 1,100 → `s=0.5`  
- Tech Outpost overrides: `L_min=0.5, L_max=2.6, spread=0.15, k=9`
- Base=25 → Buy price `= 25 * (0.5 + (2.6−0.5)/(1+exp(9*(0.5−0.5)))) = 25 * 1.55 = 38.75`
- Sell price `= 38.75 * (1 − 0.15) = 32.94`

After player buys 200 units (400 cargo slots), new stock=900 → `s=0.409`  
New buy price recalculated (~41.30), closing trivial ping‑pong.

### M.2 Restock with Decay (Fuel Depot, Fuel)
- Cap: 9,600 (Large +60%)  
- r_base(Fuel)=0.20, level=4 → lvl_bonus=0.12 → base add `= 9600 * 0.20 * 1.12 = 2150`  
- Heavy net export `flow_t/cap = 0.3`, `decay_mult = 1 − 0.3*0.6 = 0.82`  
- Shortage event not active (`event_mult=1.0`)  
- Final Δstock `= 2150 * 0.82 ≈ 1763`

### M.3 Smuggling Detection (Embargo in FedSpace)
- Base P0=18%, Embargo ×1.5 → 27%  
- Player criminal ×1.25 → 33.8%  
- Cargo contraband fraction f=0.4 → ×(1+0.2)= ×1.2 → 40.6% detection chance on undock.

---

## N. QA & Edge Cases
- Atomic trade transactions; retry on contention.  
- Prevent negative stock or oversell.  
- Cap daily restock so ports cannot overflow `cap * 1.1`.  
- Handle daylight‑saving changes by storing times in UTC only.  
- Suppress Feed spam by deduping similar econ events within 10 minutes/region.  
- Ensure event durations never straddle season end without termination.

---

## O. Tuning Knobs (Live Ops)
- `L_min/L_max/k/spread` per archetype  
- Restock `r_base` per commodity  
- EWMA `α`, decay slope `d`  
- Event frequency, duration, and magnitudes  
- Taxes/fees and embargo policy  
- Volatility σ

---

End of spec.
