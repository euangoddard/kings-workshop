import { useState } from 'preact/hooks'
import { useGameStore } from '../store/gameStore'
import {
  infantryEquipCost,
  archerEquipCost,
  cavalryEquipCost,
  mageEquipCost,
  troopUpgradeCost,
  INFANTRY_DPS,
  ARCHER_BASE_DPS,
  CAVALRY_BASE_DPS,
  MAGE_BASE_DPS,
  damageMult,
  armyDPSFull,
} from '../engine/economy'
import type { TroopType, UpgradeBranch } from '../types/game'
import Decimal from 'break_infinity.js'

function fmt(d: Decimal | number): string {
  const n = typeof d === 'number' ? d : d.toNumber()
  if (!isFinite(n)) return '???'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return Math.floor(n).toLocaleString()
}

type Tab = TroopType

interface TroopConfig {
  type: TroopType
  label: string
  icon: string
  color: string
  activeColor: string
  baseDPS: number
  equipCostFn: (n: number) => Decimal
}

const TROOPS: TroopConfig[] = [
  {
    type: 'infantry',
    label: 'Infantry',
    icon: '🛡️',
    color: 'purple',
    activeColor: 'bg-purple-900/60 border-purple-500',
    baseDPS: INFANTRY_DPS,
    equipCostFn: infantryEquipCost,
  },
  {
    type: 'archer',
    label: 'Archer',
    icon: '🏹',
    color: 'green',
    activeColor: 'bg-green-900/60 border-green-500',
    baseDPS: ARCHER_BASE_DPS,
    equipCostFn: archerEquipCost,
  },
  {
    type: 'cavalry',
    label: 'Cavalry',
    icon: '🐴',
    color: 'amber',
    activeColor: 'bg-amber-900/60 border-amber-500',
    baseDPS: CAVALRY_BASE_DPS,
    equipCostFn: cavalryEquipCost,
  },
  {
    type: 'mage',
    label: 'Mage',
    icon: '🔮',
    color: 'blue',
    activeColor: 'bg-blue-900/60 border-blue-500',
    baseDPS: MAGE_BASE_DPS,
    equipCostFn: mageEquipCost,
  },
]

const BRANCH_LABELS: Record<UpgradeBranch, string> = {
  damage: 'Damage',
  health: 'Health',
  special: 'Special',
}

const BRANCH_ICONS: Record<UpgradeBranch, string> = {
  damage: '⚔️',
  health: '❤️',
  special: '✨',
}

function colorClass(color: string, variant: string): string {
  const map: Record<string, Record<string, string>> = {
    purple: {
      text: 'text-purple-300',
      textDim: 'text-purple-500',
      bg: 'bg-purple-700 hover:bg-purple-600',
      bgDisabled: 'bg-purple-900/30',
      border: 'border-purple-500',
      borderDim: 'border-purple-800',
      badge: 'text-purple-200',
    },
    green: {
      text: 'text-green-300',
      textDim: 'text-green-500',
      bg: 'bg-green-700 hover:bg-green-600',
      bgDisabled: 'bg-green-900/30',
      border: 'border-green-500',
      borderDim: 'border-green-800',
      badge: 'text-green-200',
    },
    amber: {
      text: 'text-amber-300',
      textDim: 'text-amber-500',
      bg: 'bg-amber-700 hover:bg-amber-600',
      bgDisabled: 'bg-amber-900/30',
      border: 'border-amber-500',
      borderDim: 'border-amber-800',
      badge: 'text-amber-200',
    },
    blue: {
      text: 'text-blue-300',
      textDim: 'text-blue-500',
      bg: 'bg-blue-700 hover:bg-blue-600',
      bgDisabled: 'bg-blue-900/30',
      border: 'border-blue-500',
      borderDim: 'border-blue-800',
      badge: 'text-blue-200',
    },
  }
  return map[color]?.[variant] ?? ''
}

export default function ArmouryPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('infantry')

  const nutsAndBolts = useGameStore(s => s.nutsAndBolts)
  const soldiers = useGameStore(s => s.soldiers)

  const infantry = useGameStore(s => s.infantry)
  const archers = useGameStore(s => s.archers)
  const cavalry = useGameStore(s => s.cavalry)
  const mages = useGameStore(s => s.mages)

  const infantryUpgrades = useGameStore(s => s.infantryUpgrades)
  const archerUpgrades = useGameStore(s => s.archerUpgrades)
  const cavalryUpgrades = useGameStore(s => s.cavalryUpgrades)
  const mageUpgrades = useGameStore(s => s.mageUpgrades)

  const equipInfantry = useGameStore(s => s.equipInfantry)
  const equipArcher = useGameStore(s => s.equipArcher)
  const equipCavalry = useGameStore(s => s.equipCavalry)
  const equipMage = useGameStore(s => s.equipMage)
  const upgradeTroop = useGameStore(s => s.upgradeTroop)

  const troopCounts: Record<TroopType, number> = { infantry, archer: archers, cavalry, mage: mages }
  const troopUpgrades = { infantry: infantryUpgrades, archer: archerUpgrades, cavalry: cavalryUpgrades, mage: mageUpgrades }
  const equipActions: Record<TroopType, () => void> = { infantry: equipInfantry, archer: equipArcher, cavalry: equipCavalry, mage: equipMage }

  const totalDPS = armyDPSFull(
    infantry, infantryUpgrades.damage,
    archers, archerUpgrades.damage,
    cavalry, cavalryUpgrades.damage,
    mages, mageUpgrades.damage,
  )

  const cfg = TROOPS.find(t => t.type === activeTab)!
  const count = troopCounts[activeTab]
  const upgrades = troopUpgrades[activeTab]
  const equipCost = cfg.equipCostFn(count)
  const canEquip = soldiers >= 1 && nutsAndBolts.gte(equipCost)
  const effectiveDPS = (count * cfg.baseDPS * damageMult(upgrades.damage)).toFixed(1)

  const BRANCHES: UpgradeBranch[] = ['damage', 'health', 'special']

  return (
    <div
      className="absolute flex flex-col"
      style={{ right: 0, width: '28%', top: '22%', bottom: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/70 border-b border-slate-700">
        <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">Armoury</span>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {TROOPS.map(t => (
            <span key={t.type}>{t.icon}{troopCounts[t.type]}</span>
          ))}
          <span className="text-slate-500">|</span>
          <span>DPS: <span className="text-amber-400">{fmt(totalDPS)}</span></span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
      {/* Vertical tab list */}
      <div className="flex flex-col gap-1 pt-4 px-1 bg-slate-900/40">
        {TROOPS.map(t => {
          const isActive = t.type === activeTab
          return (
            <button
              key={t.type}
              onClick={() => setActiveTab(t.type)}
              className={`
                flex flex-col items-center px-2 py-2 rounded-lg border text-xs font-bold transition-all select-none cursor-pointer
                ${isActive ? t.activeColor : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500'}
              `}
            >
              <span className="text-base">{t.icon}</span>
              <span className={`mt-0.5 ${isActive ? colorClass(t.color, 'badge') : ''}`}>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col gap-2 px-2 pt-4 pb-4 overflow-y-auto">
        {/* Troop header */}
        <div className={`w-full bg-slate-800/70 rounded-lg p-2.5 border ${colorClass(cfg.color, 'borderDim')} text-center`}>
          <div className={`${colorClass(cfg.color, 'text')} font-bold text-xl`}>{count}</div>
          <div className="text-slate-500 text-xs">{cfg.label} Equipped</div>
          <div className="text-slate-600 text-xs mt-0.5">
            DPS: <span className={colorClass(cfg.color, 'textDim')}>{effectiveDPS}</span>
          </div>
        </div>

        {/* Equip button */}
        <button
          onClick={equipActions[activeTab]}
          disabled={!canEquip}
          className={`
            w-full py-2 rounded-lg border-2 font-bold text-sm transition-all duration-100 select-none
            ${canEquip
              ? `${colorClass(cfg.color, 'bg')} ${colorClass(cfg.color, 'border')} text-white cursor-pointer active:scale-95`
              : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
            }
          `}
        >
          <span className="text-base">{cfg.icon}</span>
          <span className="ml-1">Equip {cfg.label}</span>
          <div className={`text-xs mt-0.5 font-normal ${canEquip ? colorClass(cfg.color, 'textDim') : 'text-slate-600'}`}>
            {fmt(equipCost)} N&amp;B + 1 Soldier
          </div>
        </button>

        {/* Upgrade branches */}
        <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest pl-0.5">Upgrades</div>
        {BRANCHES.map(branch => {
          const level = upgrades[branch]
          const cost = troopUpgradeCost(activeTab, branch, level)
          const canAfford = nutsAndBolts.gte(cost)
          return (
            <div
              key={branch}
              className={`w-full bg-slate-800/60 rounded-lg p-2 border ${colorClass(cfg.color, 'borderDim')} flex items-center justify-between gap-1`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{BRANCH_ICONS[branch]}</span>
                  <span className={`text-xs font-bold ${colorClass(cfg.color, 'text')}`}>{BRANCH_LABELS[branch]}</span>
                  <span className="text-slate-600 text-xs">Lv.{level}</span>
                </div>
                <div className="text-slate-600 text-xs mt-0.5">
                  Cost: {fmt(cost)} N&amp;B
                </div>
              </div>
              <button
                onClick={() => upgradeTroop(activeTab, branch)}
                disabled={!canAfford}
                className={`
                  px-2 py-1 rounded border text-xs font-bold transition-all select-none shrink-0
                  ${canAfford
                    ? `${colorClass(cfg.color, 'bg')} ${colorClass(cfg.color, 'border')} text-white cursor-pointer active:scale-95`
                    : 'bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                Up
              </button>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
