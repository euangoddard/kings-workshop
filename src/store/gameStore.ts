import { create } from 'zustand'
import Decimal from 'break_infinity.js'
import {
  soldierSpawnCost,
  infantryEquipCost,
  archerEquipCost,
  cavalryEquipCost,
  mageEquipCost,
  troopUpgradeCost,
  effectiveBossHP,
  effectiveBossReward,
  bossDamage,
  effectiveCollectorSpeed,
  effectiveCollectorCapacity,
  effectiveCollectorCount,
  collectorUpgradeCost,
  armyDPSFull,
  clickFightDamage,
  CRIT_CHANCE,
  CRIT_MULTIPLIER,
  isEliteBoss,
} from '../engine/economy'
import type {
  GameState,
  GameActions,
  SerializedGameState,
  TroopUpgrades,
  Achievement,
} from '../types/game'

const SAVE_KEY = 'kings_workshop_save_v1'

// ---------------------------------------------------------------------------
// Achievement definitions
// ---------------------------------------------------------------------------
function defaultAchievements(): Achievement[] {
  return [
    // Production
    { id: 'first_100',    name: 'Scrap Hunter',       description: 'Earn 100 total N&B',              unlocked: false },
    { id: 'first_1k',     name: 'Scrap Collector',    description: 'Earn 1,000 total N&B',            unlocked: false },
    { id: 'first_10k',    name: 'Hoarder',            description: 'Earn 10,000 total N&B',           unlocked: false },
    { id: 'first_100k',   name: 'Treasure Trove',     description: 'Earn 100,000 total N&B',          unlocked: false },
    { id: 'first_1m',     name: 'Royal Fortune',      description: 'Earn 1,000,000 total N&B',        unlocked: false },
    // Army
    { id: 'first_soldier', name: 'First Recruit',     description: 'Spawn 1 soldier',                 unlocked: false },
    { id: 'infantry_5',   name: 'Shieldwall',         description: 'Equip 5 infantry',                unlocked: false },
    { id: 'infantry_10',  name: 'Iron Guard',         description: 'Equip 10 infantry',               unlocked: false },
    { id: 'first_archer', name: 'Marksmen',           description: 'Equip first archer',              unlocked: false },
    { id: 'archer_5',     name: 'Arrow Storm',        description: 'Equip 5 archers',                 unlocked: false },
    { id: 'first_cavalry', name: 'Cavalry Charge',   description: 'Equip first cavalry',             unlocked: false },
    { id: 'first_mage',   name: 'Arcane Power',       description: 'Equip first mage',                unlocked: false },
    { id: 'full_army',    name: 'Full Army',          description: 'Have all 4 troop types (1+ each)', unlocked: false },
    { id: 'upgrade_1',    name: "Blacksmith's Touch", description: 'Buy any troop upgrade',           unlocked: false },
    // Clicks
    { id: 'clicks_100',   name: 'Quick Hands',        description: '100 total clicks',                unlocked: false },
    { id: 'clicks_1k',    name: 'Tireless Worker',    description: '1,000 total clicks',              unlocked: false },
    { id: 'clicks_10k',   name: 'Click Master',       description: '10,000 total clicks',             unlocked: false },
    // Boss
    { id: 'first_boss',   name: 'First Blood',        description: 'Defeat boss #0',                  unlocked: false },
    { id: 'boss_5',       name: 'Veteran',            description: 'Defeat 5 bosses total',           unlocked: false },
    { id: 'elite_slayer', name: 'Elite Slayer',       description: 'Defeat first elite boss',         unlocked: false },
    // Collector
    { id: 'first_upgrade', name: 'Automation',        description: 'Buy first collector upgrade',     unlocked: false },
  ]
}

// ---------------------------------------------------------------------------
// Achievement checking
// ---------------------------------------------------------------------------
function checkAchievements(s: GameState): Achievement[] {
  const now = Date.now()
  let changed = false
  const updated = s.achievements.map(a => {
    if (a.unlocked) return a

    let shouldUnlock = false
    switch (a.id) {
      case 'first_100':    shouldUnlock = s.totalNutsAndBoltsEarned.gte(100); break
      case 'first_1k':     shouldUnlock = s.totalNutsAndBoltsEarned.gte(1000); break
      case 'first_10k':    shouldUnlock = s.totalNutsAndBoltsEarned.gte(10000); break
      case 'first_100k':   shouldUnlock = s.totalNutsAndBoltsEarned.gte(100000); break
      case 'first_1m':     shouldUnlock = s.totalNutsAndBoltsEarned.gte(1000000); break
      case 'first_soldier': shouldUnlock = s.totalSoldiersSpawned >= 1; break
      case 'infantry_5':   shouldUnlock = s.infantry >= 5; break
      case 'infantry_10':  shouldUnlock = s.infantry >= 10; break
      case 'first_archer': shouldUnlock = s.archers >= 1; break
      case 'archer_5':     shouldUnlock = s.archers >= 5; break
      case 'first_cavalry': shouldUnlock = s.cavalry >= 1; break
      case 'first_mage':   shouldUnlock = s.mages >= 1; break
      case 'full_army':    shouldUnlock = s.infantry >= 1 && s.archers >= 1 && s.cavalry >= 1 && s.mages >= 1; break
      case 'upgrade_1':
        shouldUnlock = (
          s.infantryUpgrades.damage > 0 || s.infantryUpgrades.health > 0 || s.infantryUpgrades.special > 0 ||
          s.archerUpgrades.damage > 0 || s.archerUpgrades.health > 0 || s.archerUpgrades.special > 0 ||
          s.cavalryUpgrades.damage > 0 || s.cavalryUpgrades.health > 0 || s.cavalryUpgrades.special > 0 ||
          s.mageUpgrades.damage > 0 || s.mageUpgrades.health > 0 || s.mageUpgrades.special > 0
        )
        break
      case 'clicks_100':   shouldUnlock = s.totalClicks >= 100; break
      case 'clicks_1k':    shouldUnlock = s.totalClicks >= 1000; break
      case 'clicks_10k':   shouldUnlock = s.totalClicks >= 10000; break
      case 'first_boss':   shouldUnlock = s.totalBossesDefeated >= 1; break
      case 'boss_5':       shouldUnlock = s.totalBossesDefeated >= 5; break
      case 'elite_slayer':
        // Unlocks when any elite boss has been defeated — elite bosses are every 10th
        // We detect this by checking if defeated count means we've passed boss 10+
        shouldUnlock = s.totalBossesDefeated >= 10 || (
          // Or currentBoss > 10 which means boss 10 was defeated
          s.currentBoss > 10
        )
        break
      case 'first_upgrade':
        shouldUnlock = s.collectorSpeed > 0 || s.collectorCapacity > 0 || s.collectorCount > 0
        break
    }

    if (shouldUnlock) {
      changed = true
      return { ...a, unlocked: true, unlockedAt: now }
    }
    return a
  })

  return changed ? updated : s.achievements
}

// ---------------------------------------------------------------------------
// Default fresh state
// ---------------------------------------------------------------------------
const defaultUpgrades = (): TroopUpgrades => ({ damage: 0, health: 0, special: 0 })

function freshState(): GameState {
  const boss = 0
  const hp = effectiveBossHP(boss)
  return {
    nutsAndBolts: new Decimal(0),
    totalNutsAndBoltsEarned: new Decimal(0),
    totalClicks: 0,

    soldiers: 0,
    totalSoldiersSpawned: 0,
    soldierClickCost: soldierSpawnCost(0),

    infantry: 0,
    archers: 0,
    cavalry: 0,
    mages: 0,

    infantryUpgrades: defaultUpgrades(),
    archerUpgrades: defaultUpgrades(),
    cavalryUpgrades: defaultUpgrades(),
    mageUpgrades: defaultUpgrades(),

    collectorSpeed: 0,
    collectorCapacity: 0,
    collectorCount: 0,
    collectorFill: 0,

    currentBoss: boss,
    bossHP: hp,
    bossMaxHP: hp,
    bossActive: false,
    totalBossesDefeated: 0,

    achievements: defaultAchievements(),

    lastSaveTime: Date.now(),
    lastTickTime: Date.now(),
  }
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------
function serialize(s: GameState): SerializedGameState {
  return {
    nutsAndBolts: s.nutsAndBolts.toString(),
    totalNutsAndBoltsEarned: s.totalNutsAndBoltsEarned.toString(),
    totalClicks: s.totalClicks,
    soldiers: s.soldiers,
    totalSoldiersSpawned: s.totalSoldiersSpawned,
    infantry: s.infantry,
    archers: s.archers,
    cavalry: s.cavalry,
    mages: s.mages,
    infantryUpgrades: s.infantryUpgrades,
    archerUpgrades: s.archerUpgrades,
    cavalryUpgrades: s.cavalryUpgrades,
    mageUpgrades: s.mageUpgrades,
    collectorSpeed: s.collectorSpeed,
    collectorCapacity: s.collectorCapacity,
    collectorCount: s.collectorCount,
    collectorFill: s.collectorFill,
    currentBoss: s.currentBoss,
    bossHP: s.bossHP.toString(),
    bossMaxHP: s.bossMaxHP.toString(),
    bossActive: s.bossActive,
    totalBossesDefeated: s.totalBossesDefeated,
    achievements: s.achievements,
    lastSaveTime: s.lastSaveTime,
    lastTickTime: Date.now(),
  }
}

function deserialize(raw: SerializedGameState): GameState {
  // Merge saved achievements with the default list so new achievements appear
  const defaults = defaultAchievements()
  const savedAchievements: Achievement[] = raw.achievements ?? []
  const savedMap = new Map(savedAchievements.map(a => [a.id, a]))
  const mergedAchievements = defaults.map(d => savedMap.get(d.id) ?? d)

  return {
    nutsAndBolts: new Decimal(raw.nutsAndBolts),
    totalNutsAndBoltsEarned: new Decimal(raw.totalNutsAndBoltsEarned),
    totalClicks: raw.totalClicks,
    soldiers: raw.soldiers,
    totalSoldiersSpawned: raw.totalSoldiersSpawned,
    soldierClickCost: soldierSpawnCost(raw.totalSoldiersSpawned),
    infantry: raw.infantry,
    archers: raw.archers ?? 0,
    cavalry: raw.cavalry ?? 0,
    mages: raw.mages ?? 0,
    infantryUpgrades: raw.infantryUpgrades ?? defaultUpgrades(),
    archerUpgrades: raw.archerUpgrades ?? defaultUpgrades(),
    cavalryUpgrades: raw.cavalryUpgrades ?? defaultUpgrades(),
    mageUpgrades: raw.mageUpgrades ?? defaultUpgrades(),
    collectorSpeed: raw.collectorSpeed,
    collectorCapacity: raw.collectorCapacity,
    collectorCount: raw.collectorCount,
    collectorFill: raw.collectorFill,
    currentBoss: raw.currentBoss,
    bossHP: new Decimal(raw.bossHP),
    bossMaxHP: new Decimal(raw.bossMaxHP),
    bossActive: raw.bossActive,
    totalBossesDefeated: raw.totalBossesDefeated ?? 0,
    achievements: mergedAchievements,
    lastSaveTime: raw.lastSaveTime,
    lastTickTime: raw.lastTickTime,
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
type Store = GameState & GameActions

export const useGameStore = create<Store>((set, get) => ({
  ...freshState(),

  // -------------------------------------------------------------------------
  // Clicking the scrap pile — earns 1 N&B (or 5x on crit)
  // -------------------------------------------------------------------------
  clickScrap: () => {
    const isCrit = Math.random() < CRIT_CHANCE
    const gain = isCrit ? CRIT_MULTIPLIER : 1
    set((s) => {
      const next: Partial<GameState> = {
        nutsAndBolts: s.nutsAndBolts.add(gain),
        totalNutsAndBoltsEarned: s.totalNutsAndBoltsEarned.add(gain),
        totalClicks: s.totalClicks + 1,
      }
      const partial = { ...s, ...next }
      next.achievements = checkAchievements(partial as GameState)
      return next
    })
    return isCrit
  },

  // -------------------------------------------------------------------------
  // Spawn soldier
  // -------------------------------------------------------------------------
  clickSpawnSoldier: () => {
    const s = get()
    const cost = new Decimal(s.soldierClickCost)
    if (s.nutsAndBolts.lt(cost)) return
    const newTotal = s.totalSoldiersSpawned + 1
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.sub(cost),
      soldiers: s.soldiers + 1,
      totalSoldiersSpawned: newTotal,
      soldierClickCost: soldierSpawnCost(newTotal),
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  // -------------------------------------------------------------------------
  // Equip troops
  // -------------------------------------------------------------------------
  equipInfantry: () => {
    const s = get()
    if (s.soldiers < 1) return
    const cost = infantryEquipCost(s.infantry)
    if (s.nutsAndBolts.lt(cost)) return
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.sub(cost),
      soldiers: s.soldiers - 1,
      infantry: s.infantry + 1,
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  equipArcher: () => {
    const s = get()
    if (s.soldiers < 1) return
    const cost = archerEquipCost(s.archers)
    if (s.nutsAndBolts.lt(cost)) return
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.sub(cost),
      soldiers: s.soldiers - 1,
      archers: s.archers + 1,
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  equipCavalry: () => {
    const s = get()
    if (s.soldiers < 1) return
    const cost = cavalryEquipCost(s.cavalry)
    if (s.nutsAndBolts.lt(cost)) return
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.sub(cost),
      soldiers: s.soldiers - 1,
      cavalry: s.cavalry + 1,
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  equipMage: () => {
    const s = get()
    if (s.soldiers < 1) return
    const cost = mageEquipCost(s.mages)
    if (s.nutsAndBolts.lt(cost)) return
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.sub(cost),
      soldiers: s.soldiers - 1,
      mages: s.mages + 1,
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  // -------------------------------------------------------------------------
  // Troop upgrades
  // -------------------------------------------------------------------------
  upgradeTroop: (type, branch) => {
    const s = get()
    const upgradeKey = `${type}Upgrades` as keyof GameState
    const upgrades = s[upgradeKey] as typeof s.infantryUpgrades
    const currentLevel = upgrades[branch]
    const cost = troopUpgradeCost(type, branch, currentLevel)
    if (s.nutsAndBolts.lt(cost)) return

    const updatedUpgrades = { ...upgrades, [branch]: currentLevel + 1 }
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.sub(cost),
      [upgradeKey]: updatedUpgrades,
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  // -------------------------------------------------------------------------
  // Collector upgrades
  // -------------------------------------------------------------------------
  upgradeCollectorSpeed: () => {
    const s = get()
    const cost = collectorUpgradeCost('speed', s.collectorSpeed)
    if (s.nutsAndBolts.lt(cost)) return
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.sub(cost),
      collectorSpeed: s.collectorSpeed + 1,
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  upgradeCollectorCapacity: () => {
    const s = get()
    const cost = collectorUpgradeCost('capacity', s.collectorCapacity)
    if (s.nutsAndBolts.lt(cost)) return
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.sub(cost),
      collectorCapacity: s.collectorCapacity + 1,
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  upgradeCollectorCount: () => {
    const s = get()
    const cost = collectorUpgradeCost('count', s.collectorCount)
    if (s.nutsAndBolts.lt(cost)) return
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.sub(cost),
      collectorCount: s.collectorCount + 1,
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  // -------------------------------------------------------------------------
  // Boss
  // -------------------------------------------------------------------------
  startBoss: () => {
    const s = get()
    if (s.bossActive) return
    const hp = effectiveBossHP(s.currentBoss)
    set({ bossActive: true, bossHP: hp, bossMaxHP: hp })
  },

  clickFight: () => {
    const s = get()
    if (!s.bossActive) return
    const dmg = new Decimal(clickFightDamage(s.soldiers))
    const newHP = Decimal.max(new Decimal(0), s.bossHP.sub(dmg))
    if (newHP.lte(0)) {
      get()._defeatBoss()
    } else {
      set({ bossHP: newHP })
    }
  },

  _defeatBoss: () => {
    const s = get()
    const reward = effectiveBossReward(s.currentBoss)
    const nextBoss = s.currentBoss + 1
    const nextHP = effectiveBossHP(nextBoss)
    const newDefeated = s.totalBossesDefeated + 1
    const next: Partial<GameState> = {
      nutsAndBolts: s.nutsAndBolts.add(reward),
      totalNutsAndBoltsEarned: s.totalNutsAndBoltsEarned.add(reward),
      bossActive: false,
      currentBoss: nextBoss,
      bossHP: nextHP,
      bossMaxHP: nextHP,
      totalBossesDefeated: newDefeated,
    }
    const partial = { ...s, ...next }
    next.achievements = checkAchievements(partial as GameState)
    set(next)
  },

  // -------------------------------------------------------------------------
  // Game tick
  // -------------------------------------------------------------------------
  tick: (deltaMs: number) => {
    const s = get()
    const deltaSec = deltaMs / 1000
    const updates: Partial<GameState> = {}

    // --- Collectors ---
    const speed = effectiveCollectorSpeed(s.collectorSpeed)
    const capacity = effectiveCollectorCapacity(s.collectorCapacity)
    const count = effectiveCollectorCount(s.collectorCount)

    const fillGain = speed * count * deltaSec
    let newFill = s.collectorFill + fillGain

    let earned = new Decimal(0)
    while (newFill >= capacity) {
      newFill -= capacity
      earned = earned.add(capacity)
    }
    if (earned.gt(0)) {
      updates.nutsAndBolts = s.nutsAndBolts.add(earned)
      updates.totalNutsAndBoltsEarned = s.totalNutsAndBoltsEarned.add(earned)
    }
    updates.collectorFill = newFill

    // --- Boss auto-battle ---
    if (s.bossActive) {
      const dps = new Decimal(armyDPSFull(
        s.infantry, s.infantryUpgrades.damage,
        s.archers, s.archerUpgrades.damage,
        s.cavalry, s.cavalryUpgrades.damage,
        s.mages, s.mageUpgrades.damage,
      ))
      const dmg = dps.mul(deltaSec)
      const newHP = Decimal.max(new Decimal(0), s.bossHP.sub(dmg))
      if (newHP.lte(0)) {
        set(updates)
        get()._defeatBoss()
        return
      }
      updates.bossHP = newHP
    }

    // --- Boss passive damage (boss damages player economy) ---
    // (Not implemented in Phase 1 either — kept for future)

    // --- Auto-save every 30 seconds ---
    if (Date.now() - s.lastSaveTime > 30_000) {
      get().saveGame()
      updates.lastSaveTime = Date.now()
    }

    // Check achievements on tick (for passive gains like collector N&B)
    if (updates.totalNutsAndBoltsEarned) {
      const partial = { ...s, ...updates }
      const newAchievements = checkAchievements(partial as GameState)
      if (newAchievements !== s.achievements) {
        updates.achievements = newAchievements
      }
    }

    updates.lastTickTime = Date.now()
    set(updates)
  },

  // -------------------------------------------------------------------------
  // Save / Load / Reset
  // -------------------------------------------------------------------------
  saveGame: () => {
    try {
      const data = serialize(get())
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Failed to save game', e)
    }
  },

  loadGame: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const data: SerializedGameState = JSON.parse(raw)
      set(deserialize(data))
    } catch (e) {
      console.warn('Failed to load save', e)
    }
  },

  resetGame: () => {
    localStorage.removeItem(SAVE_KEY)
    set(freshState())
  },
}))

// Expose a stable reference for Phaser (no React hooks needed in scenes)
export const gameStore = useGameStore

// Re-export bossDamage for consumers that need it alongside other store imports
export { bossDamage, isEliteBoss }
