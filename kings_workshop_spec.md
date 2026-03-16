# KING'S WORKSHOP

## Game Design Specification

*An Incremental Clicker Game*

**Version 1.0 | March 2026 | CONFIDENTIAL**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Game Overview](#2-game-overview)
3. [Core Mechanics](#3-core-mechanics)
4. [Progression Systems](#4-progression-systems)
5. [Game Economy and Balance](#5-game-economy-and-balance)
6. [Visual Design and Aesthetic](#6-visual-design-and-aesthetic)
7. [Technology Evaluation](#7-technology-evaluation)
8. [Technical Architecture](#8-technical-architecture)
9. [Development Roadmap](#9-development-roadmap)
10. [Appendix](#10-appendix)

---

## 1. Executive Summary

King's Workshop is an incremental clicker game in which players build a medieval army to defeat an escalating series of boss enemies. Players click to spawn soldiers, scavenge resources (nuts and bolts), equip troops across four specialisations, and automate collection through upgradable collectors. The game blends active clicking with idle progression, rewarding strategic resource allocation and army composition.

The core loop follows: click to gather resources → equip soldiers → assemble an army → fight bosses → earn large resource drops → repeat at higher tiers. A prestige system resets progress in exchange for permanent bonuses, ensuring long-term engagement.

---

## 2. Game Overview

### 2.1 Genre and Inspiration

King's Workshop sits at the intersection of idle/clicker games and light RPG army management. Inspirations include Cookie Clicker (resource accumulation), Clicker Heroes (boss-fighting progression), and Realm Grinder (multi-layered prestige systems). The medieval military theme differentiates it from the predominantly economic or fantasy settings of existing clicker games.

### 2.2 Target Audience

- Casual gamers who enjoy short-session, low-commitment play
- Fans of incremental/idle games seeking a fresh theme
- Strategy and RPG enthusiasts drawn to army-building and upgrade optimisation
- Mobile-first players (primary platform target), with web as secondary

### 2.3 Core Pillars

1. **Satisfying Progression:** Every click and decision should feel meaningful. Numbers go up in gratifying ways.
2. **Strategic Depth:** Choosing how to allocate resources across troop types creates genuine tactical decisions.
3. **Visual Feedback:** The workshop, army, and battles should feel alive, rewarding player action with animation and spectacle.
4. **Long-term Engagement:** Prestige systems, achievements, and unlockable content keep players returning over weeks and months.

---

## 3. Core Mechanics

### 3.1 The Click Loop

The fundamental action is clicking. Players click on two primary targets: a soldier icon to accumulate spawn progress, and scrap piles to gather nuts and bolts. Initially, 10 clicks are required to spawn a single soldier. This threshold scales with each soldier spawned, following an exponential cost curve.

#### 3.1.1 Soldier Spawning Formula

> Clicks required = `floor(baseCost × growthRate ^ soldierCount)`

Where `baseCost = 10` and `growthRate = 1.07`. This means the 10th soldier costs approximately 20 clicks, the 50th costs approximately 295 clicks, and the 100th costs approximately 8,676 clicks — encouraging automation investment.

### 3.2 Resource System: Nuts and Bolts

Nuts and bolts are the universal currency. They are earned through clicking on scrap piles (early game), collector automation (mid game), and boss defeat rewards (late game). The economy is designed so that clicking remains viable early on but becomes insufficient without automation.

#### 3.2.1 Scrap Clicking

Each click on a scrap pile yields 1 unit initially, upgradable through research. A "Scrap Value" multiplier can be purchased that increases yield per click. Critical clicks (random chance, starting at 1%) yield 5× the normal value.

#### 3.2.2 Collectors

Collectors are automated units that gather nuts and bolts without player input. They have three upgradeable attributes:

| Attribute | Base Value | Upgrade Cost Curve | Effect |
|-----------|------------|-------------------|--------|
| Speed | 1 unit/sec | `50 × 1.15^level` | Increases collection rate |
| Capacity | 10 units | `75 × 1.12^level` | Units held before returning to stockpile |
| Count | 1 collector | `200 × 1.25^level` | Additional parallel collectors |

Collectors visually move between scrap piles and the central stockpile. When their capacity is full, they return to deposit resources before heading back out. This creates a satisfying visual rhythm.

### 3.3 Troop Equipment System

Once spawned, soldiers are unequipped and cannot fight. Players must assign them to one of four equipment stations, each producing a distinct troop type with different combat strengths.

| Troop Type | Equipment | Base Cost | Damage Type | Combat Role |
|------------|-----------|-----------|-------------|-------------|
| Infantry | Sword + Shield | 10 units | Melee (sustained) | Tank / front line |
| Archer | Bow + Arrow | 100 units | Ranged (single target) | DPS / back line |
| Cavalry | Horse + Spear | 1,000 units | Charge (burst) | Flanker / burst damage |
| Mage | Staff + Spellbook | 10,000 units | AoE magic | Support / area damage |

Equipment costs scale exponentially per troop equipped. The formula mirrors the standard incremental pattern:

> Cost = `baseCost × 1.10 ^ troopsEquipped`

#### 3.3.1 Troop Upgrades

Each troop type has a dedicated upgrade tree with three branches:

- **Damage:** Increases base damage output per troop unit
- **Armour/Health:** Increases survivability in boss encounters
- **Special Ability:** Unlocks and improves a unique ability (e.g., Infantry taunt, Archer volley, Cavalry charge, Mage fireball)

### 3.4 Boss Battle System

Bosses are the progression gates. Each boss has a health pool, damage output, and special abilities. The player's army fights the boss automatically, but the player can click to deal bonus damage during the fight. Boss difficulty scales exponentially.

#### 3.4.1 Boss Scaling

> Boss HP = `100 × 2.5 ^ bossNumber`
>
> Boss Damage = `10 × 1.8 ^ bossNumber`

Every 10th boss is an "Elite Boss" with 3× normal HP, unique mechanics, and substantially better loot. Every 50th boss is a "Legendary Boss" with 10× HP and exclusive cosmetic rewards.

#### 3.4.2 Boss Rewards

Defeating a boss yields nuts and bolts proportional to its difficulty. The reward formula ensures that boss farming overtakes clicking as the primary resource source by mid-game:

> Reward = `50 × 3.0 ^ bossNumber`

Elite bosses drop 5× normal rewards plus a random equipment blueprint. Legendary bosses drop 20× rewards, a guaranteed rare blueprint, and a prestige token.

---

## 4. Progression Systems

### 4.1 Prestige: The Royal Decree

When progression slows, players can issue a "Royal Decree" (prestige reset). This resets soldiers, equipment, collectors, and boss progress but grants Royal Crowns — a permanent meta-currency that provides multipliers across all systems.

> Royal Crowns = `floor((totalNutsAndBoltsEarned / 1,000,000) ^ 0.6)`

Royal Crowns can be spent on permanent upgrades in the Throne Room:

- **Royal Forge:** Reduces all equipment costs by 5% per level
- **King's Treasury:** Increases all resource income by 10% per level
- **Master Recruiter:** Reduces soldier spawn clicks by 1 per level (minimum 2)
- **Battle Hardened:** Increases all troop damage by 15% per level
- **Swift Couriers:** Increases collector speed by 8% per level

### 4.2 Achievement System

Achievements provide small permanent bonuses and track player milestones. Categories include:

- Production milestones (total nuts and bolts earned)
- Army milestones (total troops equipped of each type)
- Boss milestones (highest boss defeated, bosses defeated total)
- Click milestones (total clicks, clicks per second records)
- Prestige milestones (number of Royal Decrees issued)

### 4.3 Blueprints and Rare Equipment

Blueprints are rare drops from elite and legendary bosses. They unlock unique equipment variants that provide synergy bonuses when combined. For example, "Flaming Sword" (Infantry) paired with "Enchanted Shield" (Infantry) grants a 25% damage bonus to all Infantry. This encourages diverse army composition and gives players goals beyond raw number growth.

### 4.4 Research Tree

A branching research tree unlocked after the first prestige provides global upgrades. Research costs Royal Crowns and unlocks new mechanics: offline progression, auto-spawn, critical click chance, collector pathfinding optimisation, and troop synergy bonuses.

---

## 5. Game Economy and Balance

### 5.1 Pacing Philosophy

The economy follows a "bumpy" pacing model common to successful incremental games. Players should experience alternating phases of rapid progress and deliberate slowdown. Fast phases feel exciting; slow phases create anticipation and make the next breakthrough satisfying. The target cadence is approximately 5–10 minutes of active play to reach each new boss, with prestige resets becoming attractive every 30–60 minutes.

### 5.2 Exponential Scaling Reference

All major costs and rewards use exponential curves. The following table summarises the growth rates:

| System | Base | Growth Rate | Notes |
|--------|------|-------------|-------|
| Soldier spawn cost | 10 clicks | 1.07x | Slow growth; automation handles by mid-game |
| Infantry equip cost | 10 N&B | 1.10x | Affordable front-line troops |
| Archer equip cost | 100 N&B | 1.10x | Mid-tier investment |
| Cavalry equip cost | 1,000 N&B | 1.10x | Significant commitment |
| Mage equip cost | 10,000 N&B | 1.10x | Premium late-game troops |
| Boss HP | 100 | 2.50x | Steep; requires army growth |
| Boss reward | 50 N&B | 3.00x | Outpaces costs to prevent dead ends |
| Collector speed upgrade | 50 N&B | 1.15x | Moderate investment |
| Collector count | 200 N&B | 1.25x | Expensive but high-impact |

### 5.3 Anti-Stagnation Mechanisms

Several mechanisms prevent the player from hitting unrecoverable walls:

- Boss rewards scale faster than costs, so persistent players always make progress
- Prestige multipliers compound, making each reset more impactful than the last
- Achievements provide passive bonuses that accumulate over time
- Lucky events (golden scrap piles, visiting merchants) provide periodic windfalls
- Offline progression allows collectors to work while the player is away

---

## 6. Visual Design and Aesthetic

### 6.1 Art Direction

The visual style should be stylised pixel art with a warm, inviting palette. Think of a cross between medieval manuscript illuminations and modern pixel RPGs (similar to games like Shovel Knight or Kingdom: Two Crowns). The pixel art approach has several advantages: it is faster and cheaper to produce, scales well across screen sizes, has nostalgic appeal, and suits the whimsical tone of a workshop-themed clicker game.

### 6.2 Colour Palette

The palette should evoke a warm medieval workshop:

- **Primary backgrounds:** warm wood tones (browns, tans, ambers)
- **Accent colours:** royal gold (#E8C547) and deep navy (#2E4057) for UI elements
- **Troop colours:** Infantry (steel grey/red), Archer (forest green), Cavalry (brown/gold), Mage (purple/blue)
- **Boss encounters:** dramatic reds and blacks with particle effects
- **Resource indicators:** metallic silver for nuts and bolts with a subtle gleam animation

### 6.3 Key Visual Elements

The main screen is divided into zones, each with distinct visual identity:

- **The Workshop (centre):** Where soldiers are spawned; an animated anvil or forge serves as the click target
- **The Scrapyard (left):** Piles of nuts and bolts with collectors moving between them and the workshop
- **The Armoury (right):** Four equipment stations, each visually themed to its troop type
- **The Battlefield (top):** A progress bar showing the current boss, with a miniature battle scene during encounters
- **The Throne Room (overlay):** Prestige shop and research tree, styled as a royal court

### 6.4 Animation and Feedback

Visual and audio feedback is critical to the satisfying feel of a clicker game:

- **Click feedback:** Sparks fly from the anvil, numbers pop up showing progress
- **Collector movement:** Smooth pathing with a slight bobble, capacity bar visible above each collector
- **Equipping:** A brief forging animation as the soldier transforms into their specialisation
- **Boss battles:** Troop sprites advance and attack with type-specific animations; screen shake on big hits
- **Prestige:** A dramatic "royal decree" scroll unrolls with trumpets before the reset
- **Milestones:** Achievement badges slide in from the side with a satisfying chime

### 6.5 Sound Design

Audio should be layered and non-fatiguing:

- **Background music:** A warm, looping medieval lute/tavern track; shifts to dramatic orchestral during boss fights
- **Click sounds:** Varied hammer-on-anvil clinks (3–4 variations to avoid repetition)
- **Collector sounds:** Subtle clinking of metal as they gather and deposit
- **Battle sounds:** Type-specific attack sounds; satisfying impact effects
- **UI sounds:** Parchment unrolling for menus, coin-drop for purchases

---

## 7. Technology Evaluation

### 7.1 Framework Comparison

The following frameworks have been evaluated for suitability. The recommendation is to use Phaser 3 for the game engine with React for UI overlay, deployed as a Progressive Web App with optional Capacitor wrapping for mobile app stores.

#### 7.1.1 Phaser 3 (Recommended Game Engine)

| Pros | Cons |
|------|------|
| Mature, battle-tested HTML5 game framework | Learning curve for developers new to game frameworks |
| Excellent sprite, animation, and particle support | Requires separate UI solution for complex menus |
| Built-in physics, tweening, and input handling | Not a full application framework (needs pairing) |
| Large community, extensive documentation | Performance ceiling lower than native engines |
| WebGL and Canvas rendering with auto-fallback | Plugin ecosystem is useful but uneven in quality |
| Free and open-source (MIT licence) | |

#### 7.1.2 React (Recommended UI Layer)

| Pros | Cons |
|------|------|
| Ideal for complex UI: menus, inventories, tooltips | Not designed for game rendering or animation |
| Component-based architecture for reusable UI elements | DOM rendering has performance limits for game objects |
| Huge ecosystem (state management, routing) | Adds bundle size and complexity |
| Strong typing with TypeScript integration | Two rendering systems to coordinate (React + Phaser) |
| Pairs well with Phaser via overlay pattern | |

#### 7.1.3 Unity (Alternative: Full Engine)

| Pros | Cons |
|------|------|
| Industry-standard game engine with massive ecosystem | Heavy for a 2D clicker; overkill for the scope |
| Excellent cross-platform export (iOS, Android, Web) | WebGL builds can be large (10–30MB+) |
| Built-in UI system (UI Toolkit or uGUI) | Requires Unity licence for revenue above threshold |
| Asset Store has pre-built clicker/idle templates | C# only; limits web developer hiring pool |
| Strong profiling and debugging tools | Slower iteration cycle than web-based stacks |

#### 7.1.4 Godot 4 (Alternative: Lightweight Engine)

| Pros | Cons |
|------|------|
| Free, open-source, no revenue share | Smaller community than Unity or Phaser |
| Lightweight and fast for 2D games | Web export still maturing (less stable than Phaser) |
| GDScript is easy to learn | Fewer third-party assets and plugins |
| Scene/node system suits UI-heavy games well | GDScript has limited external tooling support |
| Good mobile export pipeline | Less corporate backing and enterprise support |

#### 7.1.5 Pure React + Canvas/SVG (Lightweight Web-Only)

| Pros | Cons |
|------|------|
| No game framework dependency; full control | Must build game loop, rendering, animation from scratch |
| Minimal bundle size | No built-in sprite sheets, tweening, or particle systems |
| Familiar stack for web developers | Performance issues with complex animations on Canvas |
| Easy deployment as a standard web app | Not suitable if the game grows beyond a simple clicker |
| Works with any web hosting | No physics or collision detection out of the box |

### 7.2 Recommended Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Game Engine | Phaser 3 | Best balance of capability and weight for a 2D clicker |
| UI Overlay | React + TypeScript | Complex menus, tooltips, inventory management |
| State Management | Zustand or Redux Toolkit | Predictable state for game economy calculations |
| Styling | Tailwind CSS | Rapid UI development for overlay components |
| Build Tool | Vite | Fast HMR, excellent Phaser/React integration |
| Big Numbers | break_infinity.js | Handles exponentially large values common in idle games |
| Persistence | localStorage + IndexedDB | Save game state; IndexedDB for large save files |
| Mobile Wrapper | Capacitor (Ionic) | Wrap PWA for iOS/Android app store distribution |
| Audio | Howler.js (via Phaser) | Phaser's built-in audio; Howler as fallback |
| Analytics | Mixpanel or Amplitude | Track progression curves, drop-off points, balancing data |

---

## 8. Technical Architecture

### 8.1 Application Structure

The application follows a layered architecture:

- **Game Layer (Phaser):** Handles rendering, sprite animation, particle effects, input for the game canvas. Manages the visual representation of the workshop, scrapyard, armoury, and battlefield.
- **UI Layer (React):** Renders HTML/CSS overlay for menus, upgrade panels, achievement notifications, settings, and the prestige screen. Communicates with the game layer via a shared state store.
- **State Layer (Zustand):** Central source of truth for all game data: resources, troop counts, upgrade levels, boss progress, prestige stats. Both Phaser and React read from and write to this store.
- **Persistence Layer:** Auto-saves to localStorage every 30 seconds. Full state snapshots to IndexedDB every 5 minutes. Import/export functionality for save file portability.
- **Economy Engine:** A pure-function module that calculates costs, production rates, damage, and rewards. No side effects; fully testable. Uses break_infinity.js for large number arithmetic.

### 8.2 Offline Progression

When the player returns after being away, the game calculates offline earnings based on elapsed time and the player's collector configuration at the time of departure. A cap of 8 hours prevents runaway accumulation. The offline calculation runs as a single deterministic function:

> `offlineEarnings = collectorRate × min(elapsedSeconds, 28800) × offlineEfficiency`

Where `offlineEfficiency` starts at 50% and is upgradeable through research.

### 8.3 Save System

The save system must be robust against data loss:

- Auto-save to localStorage every 30 seconds (fast, small)
- Full snapshot to IndexedDB every 5 minutes (complete state backup)
- Manual save/load buttons in settings
- Base64-encoded export string for sharing saves across devices
- Version-tagged save format with migration functions for future updates
- Integrity checksum to detect corruption

---

## 9. Development Roadmap

### 9.1 Phase 1: Core Loop (Weeks 1–4)

Deliver the minimum playable game:

- Click-to-spawn soldier mechanic with exponential cost scaling
- Nuts and bolts clicking with basic resource display
- Single troop type (Infantry) with equipping cost
- First boss encounter with auto-battle
- Basic Phaser canvas with placeholder art
- React UI overlay for resource counters and upgrade buttons
- localStorage save/load

### 9.2 Phase 2: Full Army (Weeks 5–8)

- All four troop types with equipping stations
- Troop upgrade trees (damage, health, special ability)
- Collector system with speed, capacity, and count upgrades
- Boss scaling to level 50 with elite bosses every 10th level
- Pixel art sprites for all troop types, collectors, and first 5 bosses
- Sound effects and background music (first pass)
- Achievement system (first 20 achievements)

### 9.3 Phase 3: Prestige and Polish (Weeks 9–12)

- Royal Decree prestige system with Throne Room upgrades
- Research tree (post-first-prestige unlocks)
- Blueprint drops and rare equipment
- Offline progression calculation
- Full pixel art for all game screens
- Animation polish: equipping sequences, boss battle effects, prestige ceremony
- Sound design: full audio pass with variation and layering
- Balancing pass based on internal playtesting data

### 9.4 Phase 4: Platform and Launch (Weeks 13–16)

- Progressive Web App configuration (manifest, service worker, offline support)
- Capacitor wrapping for iOS and Android
- Performance optimisation and device testing
- Analytics integration for progression tracking
- Final balancing pass with external playtesters
- App store submission and web deployment
- Marketing materials and launch plan

---

## 10. Appendix

### 10.1 Glossary

| Term | Definition |
|------|-----------|
| Nuts and Bolts (N&B) | The primary currency used for all equipment and upgrades |
| Royal Crowns | Prestige currency earned on reset; spent on permanent upgrades |
| Royal Decree | The prestige action that resets progress for Royal Crowns |
| Collector | Automated unit that gathers nuts and bolts from scrap piles |
| Blueprint | Rare drop that unlocks unique equipment variants with synergy bonuses |
| Elite Boss | Every 10th boss; 3× HP, unique mechanics, better loot |
| Legendary Boss | Every 50th boss; 10× HP, exclusive cosmetics, prestige tokens |
| Throne Room | Prestige shop where Royal Crowns buy permanent multipliers |
| Research Tree | Post-prestige unlock tree providing global upgrades and new mechanics |

### 10.2 Key Formulas Reference

| Formula | Expression | Variables |
|---------|-----------|-----------|
| Soldier spawn cost | `floor(10 × 1.07^n)` | n = soldiers spawned |
| Equipment cost | `floor(base × 1.10^n)` | base = type base cost, n = troops equipped |
| Boss HP | `floor(100 × 2.50^b)` | b = boss number (0-indexed) |
| Boss reward | `floor(50 × 3.00^b)` | b = boss number |
| Prestige currency | `floor((total / 1,000,000)^0.6)` | total = lifetime N&B earned |
| Collector upgrade cost | `floor(base × rate^level)` | See collector table for base/rate |
| Offline earnings | `rate × min(t, 28800) × eff` | t = seconds away, eff = efficiency % |

---

*End of Specification*
