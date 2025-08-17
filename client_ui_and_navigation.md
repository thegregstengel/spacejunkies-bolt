# Client UI & Navigation Specification
Version: 1.0
Status: Developer-ready

## Purpose
Define a clear, mobile-first UI with simple, fast flows that match TW2002 spirit. No desktop scrollbars; use native mobile scrolling only. All dangerous actions confirm with turn costs shown. Feed never reveals sector IDs or player locations.

---

## Global UX Principles
- Mobile first, one-screen-at-a-time, native scrolling.
- Clear action verbs: Move, Dock, Trade, Scan, Attack, Deploy, Bank.
- Always show turns remaining in the header.
- Red-line actions cost turns; show cost chips like "Costs 1 turn".
- All lists use FlatList with pull-to-refresh; no visible scrollbars.
- Use toasts for success, inline banners for warnings, modals for confirmations.
- Haptics: light impact on success, warning on confirmations, error on denial.
- Accessibility: large tap targets, accessible labels, dynamic font scaling.

---

## Navigation Map

### Before Join
1) **Auth** (Google, email/password)  
2) **Galaxy Hub**  
   - Join Galaxy (Friendly, Standard, Pirate)  
   - Create Custom Galaxy  
   - Warning: joining binds progress to that galaxy

### In Galaxy (Bottom Tabs)
- **Map** (default)  
- **Actions** (context-aware: Port, Shipyard, Bank, Bounty, Deploy)  
- **Ship** (stats, upgrades, rename)  
- **Missions** (offers, active, history)  
- **Feed** (galaxy-wide news)

Conditional drawer items:
- **Planets** (owned planets list -> detail)  
- **Corp** (if in a corporation)  
- **Leaderboards**  
- **Settings**

---

## Screens

### 1. Auth
- Buttons: Sign in with Google, Email, Continue as Guest (optional)
- Error states: auth failure retry
- On success -> Galaxy Hub

### 2. Galaxy Hub
- Cards: Friendly, Standard, Pirate; button: Join
- Create Galaxy: name, visibility, difficulty, PvP toggle
- Confirm Join modal: irreversible warning
- On Join -> Set starting sector and ship -> Map

### 3. Map
- Header: Region tag, Turns, Credits
- Sector panel: sector name, traits, connected sectors as buttons
- Buttons: Move (1 turn), Scan (1 turn), Dock if port exists, Deploy (1 turn)
- Connected sectors display as tappable chips
- If docked, shows Docked status chip
- If other players present, show generic count only

Empty state: "Empty space." Helpful tip about scanning.

### 4. Actions (Contextual)
This tab changes content based on context.
- If docked at a port:
  - **Trade**: buy/sell cards with price, stock, capacity. No turns.
  - **Bank**: deposit/withdraw. No turns.
  - **Shipyard** (if available): list ships, purchase/trade-in flow.
  - **Bounty**: post/claim bounties.
- If at shipyard but not docked: prompt to Dock first.
- If not docked: show Deploy and Combat options when relevant.

### 5. Ship
- Panels: Stats, Upgrades, Rename
- Show upgrade cost curves and caps; disable when at cap
- Buttons: Upgrade Holds/Shields/Fighters/Torps (confirm with cost)
- Rename: input, fee shown

### 6. Missions
- Tabs: Offers, Active, History
- Offers: list 3 choices (safe, moderate, risky), accept button
- Active: timers, objectives, abandon button
- History: last 20 with outcomes

### 7. Feed
- List of redacted, region-only events
- Filters: All, Economy, Combat, Missions, Planets, Season
- Infinite native scrolling
- Items are delayed by server; show relative time and region tag only

### 8. Planets
- List player/corp planets -> Planet Detail
- Planet Detail
  - Overview (owner, pop, storage, structures)
  - Storage: deposit/withdraw
  - Build: upgrade Warehouse/Habitat/Factory/Shield Grid (1 turn)
  - Garrison: set fighters
  - Truce status if applicable

### 9. Corp
- Overview: name, alignment, bank, notices
- Members: roles, invite buttons
- Assets: planets, sector defenses
- Policies: toggles for storage/defense permissions
- Missions: 1 active mission, accept/abandon

### 10. Leaderboards
- Tabs: Overall, Wealth, Combat, Trade, Explore, Faction, Planets, Bounties
- Season timer countdown
- Row shows rank, anonymized name if privacy set

### 11. Settings
- Profile: display name, privacy toggle
- Controls: haptics, sound
- Danger zone: Leave Galaxy (hard reset flow)

---

## Flow Details

### Movement
- Tap a connected sector chip -> Confirm "Move to X, Costs 1 turn" -> success shows new sector panel
- If encounter spawns, show Encounter card with options: Fight (1 turn), Attempt Retreat

### Docking/Undocking
- Dock button visible if port present in sector
- Docking consumes 1 turn; trader safety indicator shown
- Undock consumes 1 turn; show vulnerability warning

### Trading
- Commodity rows: price, stock, holds available, buy and sell fields
- Instantly updates with logistic curve after transaction
- Taxes/spread shown by port type
- If contraband purchased, tag lots and show smuggling warning

### Shipyard Purchase/Trade-in
- Ship list cards with stats, role, special
- Purchase: confirmation modal
- Trade-in flow shows credits in/out and cargo retained

### Deploy
- List of deployable types in inventory
- Set quantity and Deploy (1 turn)
- Show current sector defense counts (fuzzed for non-owners)

### Combat Resolution
- If player initiates: 1 turn confirmation
- Result screen: winner, loot, attrition, disable/repair options
- Button: Field Repair Kit, Tow, or Back to Map

### Missions
- Accept -> adds to Active
- Complete -> rewards screen with Feed note if applicable

### Planet Raid
- Confirm: "Attempt to capture planet, Costs 1 turn"
- Result: captured or disabled, truce timer if captured

---

## Components
- HeaderBar: region, turns, credits
- SectorChip: shows connected sector, tap to move
- ActionCard: consistent panel with title, cost chip, primary/secondary buttons
- CommodityRow: price, stock, amount selector
- ShipCard: stats grid, role labels, ability text
- MissionCard: faction tag, tier, objective, timer
- FeedItem: category badge, region, summary text, relative time
- ConfirmModal: title, body, cost chips
- Toast: success/warning/error
- EmptyState: icon + tip text

---

## Error and Loading States
- Skeleton loaders on list screens
- Retry banners on network errors
- Greyed buttons with tooltip text explaining why disabled (not enough turns, credits, stock)

---

## Performance
- Use list virtualization for Feed, Missions, Leaderboards
- Cache last known prices per port for quick paint
- Preload Shipyard tables once per session
- Defer heavy scans to background with completion notifications

---

## Privacy and Safety
- Feed items use region tags only; never include sector or player location
- Combat summaries hide names if privacy enabled
- Warn on actions that cost turns or carry risk (embargo, contraband)

---

End of spec.
