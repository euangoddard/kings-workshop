import Decimal from "break_infinity.js";
import { armyDPSFull } from "../engine/economy";
import { useGameStore } from "../store/gameStore";

function fmt(d: Decimal): string {
  const n = d.toNumber();
  if (!Number.isFinite(n) || d.gte(new Decimal("1e15"))) return d.toExponential(2);
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

function fmtNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(1);
}

export default function ResourceBar() {
  const nb = useGameStore((s) => s.nutsAndBolts);
  const soldiers = useGameStore((s) => s.soldiers);
  const infantry = useGameStore((s) => s.infantry);
  const archers = useGameStore((s) => s.archers);
  const cavalry = useGameStore((s) => s.cavalry);
  const mages = useGameStore((s) => s.mages);
  const infantryUpgrades = useGameStore((s) => s.infantryUpgrades);
  const archerUpgrades = useGameStore((s) => s.archerUpgrades);
  const cavalryUpgrades = useGameStore((s) => s.cavalryUpgrades);
  const mageUpgrades = useGameStore((s) => s.mageUpgrades);
  const totalClicks = useGameStore((s) => s.totalClicks);
  const saveGame = useGameStore((s) => s.saveGame);
  const resetGame = useGameStore((s) => s.resetGame);

  const dps = armyDPSFull(
    infantry,
    infantryUpgrades.damage,
    archers,
    archerUpgrades.damage,
    cavalry,
    cavalryUpgrades.damage,
    mages,
    mageUpgrades.damage,
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-slate-900/95 border-b border-slate-700 backdrop-blur-sm">
      {/* Left: resources */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg font-bold">⚙</span>
          <div>
            <div className="text-amber-300 font-bold text-sm leading-none">
              {fmt(nb)}
            </div>
            <div className="text-slate-500 text-xs">Nuts &amp; Bolts</div>
          </div>
        </div>

        <div className="w-px h-8 bg-slate-700" />

        <div className="flex items-center gap-2">
          <span className="text-indigo-400 text-lg">⚔</span>
          <div>
            <div className="text-indigo-300 font-bold text-sm leading-none">
              {soldiers}
            </div>
            <div className="text-slate-500 text-xs">Soldiers (free)</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-sm">🛡</span>
          <div>
            <div className="text-purple-300 font-bold text-sm leading-none">
              {infantry}
            </div>
            <div className="text-slate-500 text-xs">Infantry</div>
          </div>
        </div>

        {archers > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm">🏹</span>
            <div>
              <div className="text-green-300 font-bold text-sm leading-none">
                {archers}
              </div>
              <div className="text-slate-500 text-xs">Archers</div>
            </div>
          </div>
        )}

        {cavalry > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">🐴</span>
            <div>
              <div className="text-amber-300 font-bold text-sm leading-none">
                {cavalry}
              </div>
              <div className="text-slate-500 text-xs">Cavalry</div>
            </div>
          </div>
        )}

        {mages > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-sm">🔮</span>
            <div>
              <div className="text-blue-300 font-bold text-sm leading-none">
                {mages}
              </div>
              <div className="text-slate-500 text-xs">Mages</div>
            </div>
          </div>
        )}

        <div className="w-px h-8 bg-slate-700" />

        <div className="flex items-center gap-2">
          <span className="text-red-400 text-sm">⚡</span>
          <div>
            <div className="text-red-300 font-bold text-sm leading-none">
              {fmtNum(dps)}
            </div>
            <div className="text-slate-500 text-xs">Army DPS</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">👆</span>
          <div>
            <div className="text-slate-300 text-sm leading-none">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-slate-500 text-xs">Total clicks</div>
          </div>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        <a
          href="/help.html"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded border border-slate-600 transition-colors"
        >
          Help
        </a>
        <button
          type="button"
          onClick={saveGame}
          className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded border border-slate-600 transition-colors"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset all progress? This cannot be undone."))
              resetGame();
          }}
          className="px-3 py-1 text-xs bg-red-900/60 hover:bg-red-800/60 text-red-300 rounded border border-red-800 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
