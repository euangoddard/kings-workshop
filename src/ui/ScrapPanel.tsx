import { useState } from "preact/hooks";
import {
  CRIT_MULTIPLIER,
  clickPower,
  clickPowerUpgradeCost,
  critChanceUpgradeCost,
  effectiveCritChance,
} from "../engine/economy";
import { fmt } from "../lib/format";
import { useGameStore } from "../store/gameStore";

export default function ScrapPanel() {
  const nb = useGameStore((s) => s.nutsAndBolts);
  const clickScrap = useGameStore((s) => s.clickScrap);
  const scrapValueLevel = useGameStore((s) => s.scrapValueLevel);
  const critChanceLevel = useGameStore((s) => s.critChanceLevel);
  const upgradeScrapValue = useGameStore((s) => s.upgradeScrapValue);
  const upgradeCritChance = useGameStore((s) => s.upgradeCritChance);

  const [lastCrit, setLastCrit] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleClick = () => {
    const isCrit = clickScrap();
    setLastCrit(isCrit);
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  const power = clickPower(scrapValueLevel);
  const critChance = effectiveCritChance(critChanceLevel);
  const powerCost = clickPowerUpgradeCost(scrapValueLevel);
  const critCost = critChanceUpgradeCost(critChanceLevel);
  const canAffordPower = nb.gte(powerCost);
  const canAffordCrit = nb.gte(critCost);

  return (
    <div
      className="absolute left-0 bottom-0 flex flex-col items-center justify-end pb-6 px-3 gap-2"
      style={{ width: "28%", top: "22%" }}
    >
      <div className="w-full flex flex-col items-center gap-2">
        {/* Click upgrades */}
        <div className="w-full flex gap-2">
          {/* Click Power upgrade */}
          <button
            type="button"
            onClick={upgradeScrapValue}
            disabled={!canAffordPower}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded border text-xs transition-all ${
              canAffordPower
                ? "bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-amber-500 text-slate-200 cursor-pointer"
                : "bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            <div className="font-bold text-amber-400">⚡ Click Power</div>
            <div className="text-slate-400">Lv {scrapValueLevel} → +{power} N&B/click</div>
            <div className={canAffordPower ? "text-amber-300" : "text-slate-500"}>
              {fmt(powerCost)} N&B
            </div>
          </button>

          {/* Crit Chance upgrade */}
          <button
            type="button"
            onClick={upgradeCritChance}
            disabled={!canAffordCrit}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded border text-xs transition-all ${
              canAffordCrit
                ? "bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-amber-500 text-slate-200 cursor-pointer"
                : "bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            <div className="font-bold text-amber-400">🎯 Crit Chance</div>
            <div className="text-slate-400">Lv {critChanceLevel} → {(critChance * 100).toFixed(0)}% crit</div>
            <div className={canAffordCrit ? "text-amber-300" : "text-slate-500"}>
              {fmt(critCost)} N&B
            </div>
          </button>
        </div>

        {/* Main click button */}
        <button
          type="button"
          onClick={handleClick}
          className={`
            w-full h-28 flex flex-col items-center justify-center rounded-lg border-2 font-bold text-sm transition-all duration-100 select-none
            active:scale-95 cursor-pointer
            ${
              flash
                ? lastCrit
                  ? "bg-amber-400 border-amber-300 text-slate-900 scale-95"
                  : "bg-slate-600 border-slate-500 text-white scale-95"
                : "bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500 text-slate-200"
            }
          `}
        >
          <div className="text-3xl mb-1">🔩</div>
          <div>Collect Scrap</div>
          <div className="text-xs text-slate-400 mt-1 font-normal">
            +{power} N&amp;B{" "}
            <span className="text-amber-500">
              ({(critChance * 100).toFixed(0)}% crit = {CRIT_MULTIPLIER}×)
            </span>
          </div>
          <div className="h-4 mt-1 flex items-center justify-center">
            {lastCrit && flash && (
              <div className="text-amber-300 font-bold text-xs animate-bounce">
                CRITICAL!
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
