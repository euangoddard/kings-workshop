import { useState } from "preact/hooks";
import {
  CRIT_MULTIPLIER,
  clickPower,
  clickPowerUpgradeCost,
  critChanceUpgradeCost,
  effectiveCritChance,
  turretBuildCost,
  turretDPS,
  turretUpgradeCost,
} from "../engine/economy";
import { fmt } from "../lib/format";
import { useGameStore } from "../store/gameStore";
import { useUIStore } from "../store/uiStore";

export default function ScrapPanel() {
  const tab = useUIStore((s) => s.leftPanelTab);
  const setTab = useUIStore((s) => s.setLeftPanelTab);

  const nb = useGameStore((s) => s.nutsAndBolts);
  const clickScrap = useGameStore((s) => s.clickScrap);
  const scrapValueLevel = useGameStore((s) => s.scrapValueLevel);
  const critChanceLevel = useGameStore((s) => s.critChanceLevel);
  const upgradeScrapValue = useGameStore((s) => s.upgradeScrapValue);
  const upgradeCritChance = useGameStore((s) => s.upgradeCritChance);

  const turretCount = useGameStore((s) => s.turretCount);
  const turretLevel = useGameStore((s) => s.turretLevel);
  const buildTurret = useGameStore((s) => s.buildTurret);
  const upgradeTurret = useGameStore((s) => s.upgradeTurret);

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

  const buildCost = turretBuildCost(turretCount);
  const upgCost = turretUpgradeCost(turretLevel);
  const canAffordBuild = nb.gte(buildCost);
  const canAffordUpg = nb.gte(upgCost);
  const dpsPerTurret = turretDPS(turretLevel);
  const totalTurretDps = turretCount * dpsPerTurret;

  return (
    <div
      className="absolute left-0 bottom-0 flex flex-col px-3"
      style={{ width: "28%", top: "22%" }}
    >
      {/* Tab header */}
      <div className="flex gap-1 pt-2">
        <button
          type="button"
          onClick={() => setTab("scrap")}
          className={`flex-1 py-1 rounded text-xs font-bold border transition-all cursor-pointer select-none ${
            tab === "scrap"
              ? "bg-slate-700 border-slate-500 text-slate-200"
              : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600"
          }`}
        >
          {tab === "scrap" ? "🔩 Scrapyard" : "🔩 Scrap"}
        </button>
        <button
          type="button"
          onClick={() => setTab("turrets")}
          className={`flex-1 py-1 rounded text-xs font-bold border transition-all cursor-pointer select-none ${
            tab === "turrets"
              ? "bg-slate-700 border-slate-500 text-slate-200"
              : "bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-600"
          }`}
        >
          🏰 Turrets
          {turretCount > 0 && (
            <span className="ml-1 text-cyan-400">{turretCount}</span>
          )}
        </button>
      </div>

      {tab === "scrap" && (
        <div className="flex flex-col items-center gap-2 pb-6 mt-auto pt-2">
          {/* Click upgrades */}
          <div className="w-full flex gap-2">
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
              <div className="text-slate-400">
                Lv {scrapValueLevel} → +{power} N&B/click
              </div>
              <div
                className={canAffordPower ? "text-amber-300" : "text-slate-500"}
              >
                {fmt(powerCost)} N&B
              </div>
            </button>

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
              <div className="text-slate-400">
                Lv {critChanceLevel} → {(critChance * 100).toFixed(0)}% crit
              </div>
              <div
                className={canAffordCrit ? "text-amber-300" : "text-slate-500"}
              >
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
      )}

      {tab === "turrets" && (
        <div className="flex flex-col gap-2 pb-6 pt-2 mt-auto">
          {/* Turret stats */}
          <div className="w-full bg-slate-800/70 rounded-lg p-3 border border-cyan-900 text-center">
            <div className="text-cyan-300 font-bold text-2xl">
              {turretCount}
            </div>
            <div className="text-slate-500 text-xs">Turrets Built</div>
            <div className="text-slate-600 text-xs mt-1">
              Total DPS:{" "}
              <span className="text-cyan-400">{fmt(totalTurretDps)}</span>
              {turretCount > 0 && (
                <span className="text-slate-600">
                  {" "}
                  ({fmt(dpsPerTurret)}/turret)
                </span>
              )}
            </div>
            <div className="text-slate-600 text-xs mt-0.5">
              Turret Lv <span className="text-cyan-500">{turretLevel}</span>
            </div>
          </div>

          {/* Build turret */}
          <button
            type="button"
            onClick={buildTurret}
            disabled={!canAffordBuild}
            className={`w-full py-2.5 rounded-lg border-2 font-bold text-sm transition-all duration-100 select-none ${
              canAffordBuild
                ? "bg-cyan-800 hover:bg-cyan-700 border-cyan-600 text-cyan-100 cursor-pointer active:scale-95"
                : "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed"
            }`}
          >
            <div>🏰 Build Turret</div>
            <div
              className={`text-xs mt-0.5 font-normal ${canAffordBuild ? "text-cyan-300" : "text-slate-600"}`}
            >
              {fmt(buildCost)} N&amp;B
            </div>
          </button>

          {/* Upgrade turrets */}
          <button
            type="button"
            onClick={upgradeTurret}
            disabled={!canAffordUpg || turretCount === 0}
            className={`w-full py-2.5 rounded-lg border-2 font-bold text-sm transition-all duration-100 select-none ${
              canAffordUpg && turretCount > 0
                ? "bg-cyan-900 hover:bg-cyan-800 border-cyan-700 text-cyan-100 cursor-pointer active:scale-95"
                : "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed"
            }`}
          >
            <div>
              ⬆️ Upgrade Turrets (Lv {turretLevel} → {turretLevel + 1})
            </div>
            <div
              className={`text-xs mt-0.5 font-normal ${canAffordUpg && turretCount > 0 ? "text-cyan-400" : "text-slate-600"}`}
            >
              {fmt(upgCost)} N&amp;B · +{fmt(dpsPerTurret * (1.5 - 1))}{" "}
              DPS/turret
            </div>
          </button>

          <div className="text-slate-600 text-xs text-center px-2 mt-1">
            Turrets deal passive DPS to the boss during battle.
          </div>
        </div>
      )}
    </div>
  );
}
