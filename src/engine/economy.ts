import Decimal from "break_infinity.js";

// ---------------------------------------------------------------------------
// Soldier spawning
// ---------------------------------------------------------------------------

/**
 * Number of N&B clicks required to spawn the next soldier.
 * floor(10 × 1.07^soldierCount)
 */
export function soldierSpawnCost(soldierCount: number): number {
  return Math.floor(10 * 1.07 ** soldierCount);
}

// ---------------------------------------------------------------------------
// Infantry equipping
// ---------------------------------------------------------------------------

/**
 * N&B cost to equip one more infantry unit.
 * floor(10 × 1.10^troopsEquipped)
 */
export function infantryEquipCost(equipped: number): Decimal {
  return new Decimal(Math.floor(10 * 1.1 ** equipped));
}

// ---------------------------------------------------------------------------
// Boss stats
// ---------------------------------------------------------------------------

/**
 * Boss max HP: floor(100 × 2.5^bossNumber)
 */
export function bossHP(bossNumber: number): Decimal {
  return new Decimal(Math.floor(100 * 2.5 ** bossNumber));
}

/**
 * Boss damage per second: floor(10 × 1.8^bossNumber)
 */
export function bossDamage(bossNumber: number): number {
  return Math.floor(10 * 1.8 ** bossNumber);
}

/**
 * Boss N&B reward on defeat: floor(50 × 3.0^bossNumber)
 */
export function bossReward(bossNumber: number): Decimal {
  return new Decimal(Math.floor(50 * 3.0 ** bossNumber));
}

// ---------------------------------------------------------------------------
// Collector
// ---------------------------------------------------------------------------

/** Base speed in fills per second (1 fill = 1 N&B unit queued) */
const COLLECTOR_BASE_SPEED = 1; // units / sec
const COLLECTOR_BASE_CAPACITY = 10;
const COLLECTOR_BASE_COUNT = 1;

/**
 * Effective collector speed (units/sec per collector) for the given speed upgrade level.
 * Each speed upgrade adds +0.5 units/sec.
 */
export function effectiveCollectorSpeed(speedLevel: number): number {
  return COLLECTOR_BASE_SPEED + speedLevel * 0.5;
}

/**
 * Effective collector capacity for the given capacity upgrade level.
 * Each capacity upgrade doubles capacity (multiplicative).
 */
export function effectiveCollectorCapacity(capacityLevel: number): number {
  return COLLECTOR_BASE_CAPACITY * 2 ** capacityLevel;
}

/**
 * Effective collector count for the given count upgrade level.
 */
export function effectiveCollectorCount(countLevel: number): number {
  return COLLECTOR_BASE_COUNT + countLevel;
}

/**
 * Combined rate: total N&B per second from all collectors.
 */
export function collectorRate(speedLevel: number, countLevel: number): Decimal {
  const speed = effectiveCollectorSpeed(speedLevel);
  const count = effectiveCollectorCount(countLevel);
  return new Decimal(speed * count);
}

/**
 * Cost of the next upgrade for a collector attribute.
 *
 * speed:    floor(25 × 2.0^level)
 * capacity: floor(50 × 2.5^level)
 * count:    floor(100 × 3.0^level)
 */
export function collectorUpgradeCost(
  attribute: "speed" | "capacity" | "count",
  level: number,
): Decimal {
  switch (attribute) {
    case "speed":
      return new Decimal(Math.floor(25 * 2.0 ** level));
    case "capacity":
      return new Decimal(Math.floor(50 * 2.5 ** level));
    case "count":
      return new Decimal(Math.floor(100 * 3.0 ** level));
  }
}

// ---------------------------------------------------------------------------
// Combat
// ---------------------------------------------------------------------------

/** Infantry DPS (damage per second per infantry unit) */
export const INFANTRY_DPS = 5;

/** Total army DPS */
export function armyDPS(infantry: number): number {
  return infantry * INFANTRY_DPS;
}

/** Click damage during a boss fight: 10 + 1 per unequipped soldier */
export function clickFightDamage(soldiers: number): number {
  return 10 + soldiers;
}

// ---------------------------------------------------------------------------
// Critical click
// ---------------------------------------------------------------------------
export const CRIT_CHANCE = 0.01; // 1 %
export const CRIT_MULTIPLIER = 5;

// ---------------------------------------------------------------------------
// Additional troop equip costs (Phase 2)
// ---------------------------------------------------------------------------

/** N&B cost to equip one more archer. floor(100 × 1.10^equipped) */
export function archerEquipCost(n: number): Decimal {
  return new Decimal(Math.floor(100 * 1.1 ** n));
}

/** N&B cost to equip one more cavalry. floor(1000 × 1.10^equipped) */
export function cavalryEquipCost(n: number): Decimal {
  return new Decimal(Math.floor(1000 * 1.1 ** n));
}

/** N&B cost to equip one more mage. floor(10000 × 1.10^equipped) */
export function mageEquipCost(n: number): Decimal {
  return new Decimal(Math.floor(10000 * 1.1 ** n));
}

// ---------------------------------------------------------------------------
// Troop DPS constants (Phase 2)
// ---------------------------------------------------------------------------
export const ARCHER_BASE_DPS = 12;
export const CAVALRY_BASE_DPS = 20;
export const MAGE_BASE_DPS = 35;

// ---------------------------------------------------------------------------
// Troop upgrade costs (Phase 2)
// ---------------------------------------------------------------------------
export type TroopType = "infantry" | "archer" | "cavalry" | "mage";
export type UpgradeBranch = "damage" | "health" | "special";

const UPGRADE_BASE_COSTS: Record<TroopType, number> = {
  infantry: 50,
  archer: 500,
  cavalry: 5000,
  mage: 50000,
};

/**
 * Cost of a troop upgrade at the given level.
 * floor(base × 2.0^level)
 */
export function troopUpgradeCost(
  type: TroopType,
  _branch: UpgradeBranch,
  level: number,
): Decimal {
  return new Decimal(Math.floor(UPGRADE_BASE_COSTS[type] * 2.0 ** level));
}

/** Damage multiplier from damage upgrade level: +15% per level */
export function damageMult(level: number): number {
  return 1 + level * 0.15;
}

/** Health multiplier from health upgrade level: +20% per level */
export function healthMult(level: number): number {
  return 1 + level * 0.2;
}

/**
 * Full army DPS incorporating all troop types and their damage upgrade levels.
 */
export function armyDPSFull(
  infantry: number,
  infantryDmgLvl: number,
  archers: number,
  archerDmgLvl: number,
  cavalry: number,
  cavalryDmgLvl: number,
  mages: number,
  mageDmgLvl: number,
): number {
  return (
    infantry * INFANTRY_DPS * damageMult(infantryDmgLvl) +
    archers * ARCHER_BASE_DPS * damageMult(archerDmgLvl) +
    cavalry * CAVALRY_BASE_DPS * damageMult(cavalryDmgLvl) +
    mages * MAGE_BASE_DPS * damageMult(mageDmgLvl)
  );
}

// ---------------------------------------------------------------------------
// Click upgrades
// ---------------------------------------------------------------------------

/**
 * N&B gained per manual click (before crit multiplier).
 * Base 1 + 1 per upgrade level.
 */
export function clickPower(scrapValueLevel: number): number {
  return 1 + scrapValueLevel;
}

/**
 * Effective crit chance including upgrades.
 * Base 1% + 1% per upgrade level.
 */
export function effectiveCritChance(critChanceLevel: number): number {
  return CRIT_CHANCE + critChanceLevel * 0.01;
}

/**
 * Cost to upgrade click power. floor(15 × 3.0^level)
 */
export function clickPowerUpgradeCost(level: number): Decimal {
  return new Decimal(Math.floor(15 * 3.0 ** level));
}

/**
 * Cost to upgrade crit chance. floor(50 × 3.5^level)
 */
export function critChanceUpgradeCost(level: number): Decimal {
  return new Decimal(Math.floor(50 * 3.5 ** level));
}

// ---------------------------------------------------------------------------
// Turrets
// ---------------------------------------------------------------------------

export const TURRET_BASE_DPS = 10;

/**
 * DPS per turret at the given upgrade level.
 * base × 1.5^level
 */
export function turretDPS(turretLevel: number): number {
  return TURRET_BASE_DPS * 1.5 ** turretLevel;
}

/**
 * Cost to build the next turret.
 * floor(200 × 2.5^turretCount)
 */
export function turretBuildCost(turretCount: number): Decimal {
  return new Decimal(Math.floor(200 * 2.5 ** turretCount));
}

/**
 * Cost to upgrade turrets to the next level.
 * floor(500 × 3.0^turretLevel)
 */
export function turretUpgradeCost(turretLevel: number): Decimal {
  return new Decimal(Math.floor(500 * 3.0 ** turretLevel));
}

// ---------------------------------------------------------------------------
// Special Attack
// ---------------------------------------------------------------------------

/** % charge gained per second while a boss battle is active */
export const SPECIAL_CHARGE_RATE = 5;
/** % charge gained per manual "Fight!" click */
export const SPECIAL_CLICK_GAIN = 3;
/** Minimum charge % required to activate the special attack */
export const SPECIAL_MIN_CHARGE = 80;
/** Duration of the troop DPS buff in seconds */
export const SPECIAL_BUFF_DURATION = 15;
/** DPS multiplier applied to the army while the buff is active */
export const SPECIAL_BUFF_MULTIPLIER = 2;

// ---------------------------------------------------------------------------
// Elite boss helpers (Phase 2)
// ---------------------------------------------------------------------------

/** Returns true for every 10th boss (10, 20, 30, ...) */
export function isEliteBoss(bossNumber: number): boolean {
  return bossNumber > 0 && bossNumber % 10 === 0;
}

/** Boss HP, tripled for elite bosses */
export function effectiveBossHP(bossNumber: number): Decimal {
  const base = bossHP(bossNumber);
  return isEliteBoss(bossNumber) ? base.mul(3) : base;
}

/** Boss reward, quintupled for elite bosses */
export function effectiveBossReward(bossNumber: number): Decimal {
  const base = bossReward(bossNumber);
  return isEliteBoss(bossNumber) ? base.mul(5) : base;
}
