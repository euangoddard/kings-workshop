import type Decimal from "break_infinity.js";

export interface TroopUpgrades {
  damage: number; // upgrade level
  health: number;
  special: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number; // timestamp
}

export interface GameState {
  // Resources
  nutsAndBolts: Decimal;
  totalNutsAndBoltsEarned: Decimal;
  totalClicks: number;

  // Soldiers
  soldiers: number;
  totalSoldiersSpawned: number;
  soldierClickCost: number;

  // Troops
  infantry: number;
  archers: number;
  cavalry: number;
  mages: number;

  // Troop upgrades
  infantryUpgrades: TroopUpgrades;
  archerUpgrades: TroopUpgrades;
  cavalryUpgrades: TroopUpgrades;
  mageUpgrades: TroopUpgrades;

  // Collector
  collectorSpeed: number;
  collectorCapacity: number;
  collectorCount: number;
  collectorFill: number;

  // Boss
  currentBoss: number;
  bossHP: Decimal;
  bossMaxHP: Decimal;
  bossActive: boolean;
  totalBossesDefeated: number;

  // Achievements
  achievements: Achievement[];

  // Meta
  lastSaveTime: number;
  lastTickTime: number;
}

export interface GameActions {
  clickScrap: () => boolean;
  clickSpawnSoldier: () => void;
  clickFight: () => void;

  equipInfantry: () => void;
  equipArcher: () => void;
  equipCavalry: () => void;
  equipMage: () => void;

  upgradeTroop: (
    type: "infantry" | "archer" | "cavalry" | "mage",
    branch: "damage" | "health" | "special",
  ) => void;

  upgradeCollectorSpeed: () => void;
  upgradeCollectorCapacity: () => void;
  upgradeCollectorCount: () => void;

  startBoss: () => void;
  _defeatBoss: () => void;

  tick: (deltaMs: number) => void;

  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
}

export type CollectorAttribute = "speed" | "capacity" | "count";
export type TroopType = "infantry" | "archer" | "cavalry" | "mage";
export type UpgradeBranch = "damage" | "health" | "special";

export interface SerializedGameState {
  nutsAndBolts: string;
  totalNutsAndBoltsEarned: string;
  totalClicks: number;
  soldiers: number;
  totalSoldiersSpawned: number;
  infantry: number;
  archers: number;
  cavalry: number;
  mages: number;
  infantryUpgrades: TroopUpgrades;
  archerUpgrades: TroopUpgrades;
  cavalryUpgrades: TroopUpgrades;
  mageUpgrades: TroopUpgrades;
  collectorSpeed: number;
  collectorCapacity: number;
  collectorCount: number;
  collectorFill: number;
  currentBoss: number;
  bossHP: string;
  bossMaxHP: string;
  bossActive: boolean;
  totalBossesDefeated: number;
  achievements: Achievement[];
  lastSaveTime: number;
  lastTickTime: number;
}
