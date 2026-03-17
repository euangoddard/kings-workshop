import Decimal from "break_infinity.js";
import { useGameStore } from "../store/gameStore";

function fmt(n: number | Decimal): string {
  const v = typeof n === "number" ? n : n.toNumber();
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return Math.floor(v).toLocaleString();
}

export default function WorkshopPanel() {
  const nutsAndBolts = useGameStore((s) => s.nutsAndBolts);
  const soldiers = useGameStore((s) => s.soldiers);
  const totalSoldiersSpawned = useGameStore((s) => s.totalSoldiersSpawned);
  const soldierClickCost = useGameStore((s) => s.soldierClickCost);
  const clickSpawnSoldier = useGameStore((s) => s.clickSpawnSoldier);

  const canAfford = nutsAndBolts.gte(new Decimal(soldierClickCost));

  return (
    <div
      className="absolute flex flex-col items-center justify-end pb-6 px-4"
      style={{ left: "28%", width: "44%", top: "22%", bottom: 0 }}
    >
      <div className="w-full flex flex-col items-center gap-3">
        {/* Soldier stats */}
        <div className="w-full grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-800/70 rounded-lg p-2 border border-slate-700">
            <div className="text-indigo-300 font-bold text-lg">{soldiers}</div>
            <div className="text-slate-500 text-xs">Free Soldiers</div>
          </div>
          <div className="bg-slate-800/70 rounded-lg p-2 border border-slate-700">
            <div className="text-slate-300 font-bold text-lg">
              {totalSoldiersSpawned}
            </div>
            <div className="text-slate-500 text-xs">Total Spawned</div>
          </div>
        </div>

        {/* Spawn button */}
        <button
          onClick={clickSpawnSoldier}
          disabled={!canAfford}
          className={`
            w-full h-28 flex flex-col items-center justify-center rounded-lg border-2 font-bold text-sm transition-all duration-100 select-none
            ${
              canAfford
                ? "bg-indigo-700 hover:bg-indigo-600 border-indigo-500 text-white cursor-pointer active:scale-95"
                : "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed"
            }
          `}
        >
          <div className="text-3xl mb-1">⚔️</div>
          <div>Spawn Soldier</div>
          <div
            className={`text-xs mt-1 font-normal ${canAfford ? "text-indigo-300" : "text-slate-600"}`}
          >
            Cost: {fmt(soldierClickCost)} N&amp;B
          </div>
          <div className="h-4 mt-1" />
        </button>
      </div>
    </div>
  );
}
