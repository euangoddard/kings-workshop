import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { CRIT_CHANCE, CRIT_MULTIPLIER } from '../engine/economy'

export default function ScrapPanel() {
  const clickScrap = useGameStore(s => s.clickScrap)
  const [lastCrit, setLastCrit] = useState(false)
  const [flash, setFlash] = useState(false)

  const handleClick = () => {
    const isCrit = clickScrap()
    setLastCrit(isCrit)
    setFlash(true)
    setTimeout(() => setFlash(false), 150)
  }

  return (
    <div className="absolute left-0 bottom-0 flex flex-col items-center justify-end pb-6 px-3"
         style={{ width: '28%', top: '22%' }}>
      <div className="w-full flex flex-col items-center gap-3">
        <button
          onClick={handleClick}
          className={`
            w-full py-4 rounded-lg border-2 font-bold text-sm transition-all duration-100 select-none
            active:scale-95 cursor-pointer
            ${flash
              ? lastCrit
                ? 'bg-amber-400 border-amber-300 text-slate-900 scale-95'
                : 'bg-slate-600 border-slate-500 text-white scale-95'
              : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500 text-slate-200'
            }
          `}
        >
          <div className="text-2xl mb-1">🔩</div>
          <div>Collect Scrap</div>
          <div className="text-xs text-slate-400 mt-1 font-normal">
            +1 N&amp;B <span className="text-amber-500">({(CRIT_CHANCE * 100).toFixed(0)}% crit = {CRIT_MULTIPLIER}x)</span>
          </div>
          {lastCrit && flash && (
            <div className="text-amber-300 font-bold text-xs mt-1 animate-bounce">CRITICAL!</div>
          )}
        </button>
      </div>
    </div>
  )
}
