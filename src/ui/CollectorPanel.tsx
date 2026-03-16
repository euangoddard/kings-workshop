import { useGameStore } from '../store/gameStore'
import {
  collectorUpgradeCost,
  effectiveCollectorSpeed,
  effectiveCollectorCapacity,
  effectiveCollectorCount,
} from '../engine/economy'
import Decimal from 'break_infinity.js'

function fmt(d: Decimal): string {
  const n = d.toNumber()
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return Math.floor(n).toLocaleString()
}

interface UpgradeRowProps {
  label: string
  current: string
  nextCost: Decimal
  canAfford: boolean
  onUpgrade: () => void
  description: string
}

function UpgradeRow({ label, current, nextCost, canAfford, onUpgrade, description }: UpgradeRowProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 min-w-0">
        <div className="text-slate-300 text-xs font-semibold">{label}</div>
        <div className="text-slate-500 text-xs">{description}</div>
        <div className="text-cyan-400 text-xs">{current}</div>
      </div>
      <button
        onClick={onUpgrade}
        disabled={!canAfford}
        className={`
          shrink-0 px-2 py-1.5 rounded border text-xs font-bold transition-all select-none
          ${canAfford
            ? 'bg-cyan-800 hover:bg-cyan-700 border-cyan-600 text-cyan-100 cursor-pointer active:scale-95'
            : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
          }
        `}
      >
        <div className="whitespace-nowrap">⬆ {fmt(nextCost)}</div>
      </button>
    </div>
  )
}

export default function CollectorPanel() {
  const nb = useGameStore(s => s.nutsAndBolts)
  const speedLevel = useGameStore(s => s.collectorSpeed)
  const capacityLevel = useGameStore(s => s.collectorCapacity)
  const countLevel = useGameStore(s => s.collectorCount)
  const collectorFill = useGameStore(s => s.collectorFill)
  const upgradeCollectorSpeed = useGameStore(s => s.upgradeCollectorSpeed)
  const upgradeCollectorCapacity = useGameStore(s => s.upgradeCollectorCapacity)
  const upgradeCollectorCount = useGameStore(s => s.upgradeCollectorCount)

  const speedCost = collectorUpgradeCost('speed', speedLevel)
  const capacityCost = collectorUpgradeCost('capacity', capacityLevel)
  const countCost = collectorUpgradeCost('count', countLevel)

  const effSpeed = effectiveCollectorSpeed(speedLevel)
  const effCap = effectiveCollectorCapacity(capacityLevel)
  const effCount = effectiveCollectorCount(countLevel)

  const fillPct = Math.min(collectorFill / effCap * 100, 100).toFixed(0)

  return (
    <div
      className="absolute z-30 flex flex-col"
      style={{ left: '28%', width: '44%', top: '22%', padding: '0 1rem' }}
    >
      {/* Collector status */}
      <div className="mt-3 bg-slate-800/80 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-cyan-400 text-xs font-semibold tracking-wider">COLLECTORS</span>
          <span className="text-slate-500 text-xs">{effCount} active</span>
        </div>

        {/* Fill bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
          <div
            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <div className="text-slate-500 text-xs text-right mb-3">
          {collectorFill.toFixed(1)} / {effCap} ({fillPct}%)
        </div>

        <div className="flex flex-col gap-2">
          <UpgradeRow
            label="Speed"
            current={`${effSpeed.toFixed(1)} units/sec`}
            nextCost={speedCost}
            canAfford={nb.gte(speedCost)}
            onUpgrade={upgradeCollectorSpeed}
            description={`Lv ${speedLevel} → ${speedLevel + 1}`}
          />
          <div className="border-t border-slate-700/50" />
          <UpgradeRow
            label="Capacity"
            current={`${effCap} unit cap`}
            nextCost={capacityCost}
            canAfford={nb.gte(capacityCost)}
            onUpgrade={upgradeCollectorCapacity}
            description={`Lv ${capacityLevel} → ${capacityLevel + 1}`}
          />
          <div className="border-t border-slate-700/50" />
          <UpgradeRow
            label="Count"
            current={`${effCount} collectors`}
            nextCost={countCost}
            canAfford={nb.gte(countCost)}
            onUpgrade={upgradeCollectorCount}
            description={`Lv ${countLevel} → ${countLevel + 1}`}
          />
        </div>
      </div>
    </div>
  )
}
