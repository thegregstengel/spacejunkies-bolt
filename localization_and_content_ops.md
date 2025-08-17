# Localization & Content Operations Specification
Version: 1.0
Status: Developer-ready

## Purpose
Provide a framework for translating and managing all player-facing text, region events, missions, and Feed messages in Space Junkies. Ensure text is easy to update without code pushes, supports multiple languages, and respects theming (Star Trek‑flavored but legally distinct).

---

## Scope
- UI text (buttons, labels, error messages)
- Game content (missions, port/sector descriptions, ship names, flavor text)
- Galaxy Feed message templates
- Seasonal event banners and notices

---

## Guiding Principles
- **Key-based lookups**: All text referenced by stable keys.
- **JSON catalogs**: Per-language JSON bundles loaded at runtime.
- **No hardcoded strings** in client or functions; all via catalog.
- **Server emits keys** for Feed/events; client renders localized string.
- **Fallback to English** if missing.
- **Pluralization & interpolation** supported via ICU MessageFormat.
- **Hot reload**: Content ops can update JSON in Firestore, CDN, or storage bucket; clients refetch on version bump.

---

## Structure

### Catalog Example (en-US.json)
```json
{
  "ui": {
    "auth.signInGoogle": "Sign in with Google",
    "auth.signInEmail": "Sign in with Email",
    "nav.map": "Map",
    "nav.ship": "Ship",
    "error.noTurns": "You are out of turns."
  },
  "feed": {
    "player.join": "{name} has joined the galaxy.",
    "combat.pvp.win": "A clash in the {region} ended with a victor.",
    "mission.complete": "A mission was completed in {region}.",
    "planet.captured": "A planet changed hands in {region}."
  },
  "missions": {
    "federation.supplyRun": "Escort a Federation convoy to {region}.",
    "pirate.raid": "Disrupt a trade route in the {region}."
  },
  "ships": {
    "rustbucketMk1": "Rustbucket Mk I",
    "cometRunner": "Comet Runner"
  }
}
```

### Firestore Index
```
/locales/{langCode}
  version:int
  catalog: map (nested)
  updatedAt: timestamp
```

Client caches `version`; refetches when `updatedAt` newer.

---

## Workflow
1. **String extraction**: Developers add new keys in English master.
2. **Translation**: Ops exports JSON, sends to translators, merges back.
3. **QA**: Translators test in build; check fit in UI (no scrollbars, truncation).
4. **Deploy**: Publish new JSON to Firestore bucket; bump version.
5. **Client refresh**: On login or background refresh, if version > cached, pull update.

---

## Galaxy Feed Templates
- All Feed entries use **template keys** and params.
- Example:  
  - Key: `feed.combat.pvp.win`  
  - Params: `{ region: "Outer Rim" }`  
  - Client renders localized string.
- Security: server never interpolates player names or sector IDs into public Feed.

---

## Content Ops Roles
- **Writer**: Adds mission text, flavor.
- **Translator**: Localizes catalogs.
- **Ops**: Publishes to Firestore/CDN, bumps version.

Access via a protected admin panel or CLI tool.

---

## Testing & QA
- Snapshot tests: all keys resolved in each supported language.
- UI screenshot tests per locale to catch truncation.
- Fallback coverage check: warn if >5 percent of keys fallback to English.
- Feed QA: simulate events to ensure templates resolve correctly.

---

## Languages Roadmap
- Phase 1: English, Spanish, German
- Phase 2: French, Japanese, Korean
- Phase 3: Simplified Chinese, Portuguese (BR)

---

## Risks & Mitigations
- **String length growth**: mitigate with flexible UI and scaling fonts.
- **Out-of-sync catalogs**: mitigate with version checks and fallback.
- **Untranslated ship/faction names**: can remain English proper nouns.

---

End of spec.
