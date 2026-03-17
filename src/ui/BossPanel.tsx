import type Decimal from "break_infinity.js";
import {
  armyDPSFull,
  bossDamage,
  clickFightDamage,
  effectiveBossHP,
  effectiveBossReward,
  isEliteBoss,
} from "../engine/economy";
import { useGameStore } from "../store/gameStore";

function fmt(d: Decimal | number): string {
  const n = typeof d === "number" ? d : d.toNumber();
  if (!Number.isFinite(n)) return "???";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return Math.floor(n).toLocaleString();
}

export default function BossPanel() {
  const currentBoss = useGameStore((s) => s.currentBoss);
  const bossHPVal = useGameStore((s) => s.bossHP);
  const bossMaxHP = useGameStore((s) => s.bossMaxHP);
  const bossActive = useGameStore((s) => s.bossActive);
  const soldiers = useGameStore((s) => s.soldiers);

  const infantry = useGameStore((s) => s.infantry);
  const archers = useGameStore((s) => s.archers);
  const cavalry = useGameStore((s) => s.cavalry);
  const mages = useGameStore((s) => s.mages);
  const infantryUpgrades = useGameStore((s) => s.infantryUpgrades);
  const archerUpgrades = useGameStore((s) => s.archerUpgrades);
  const cavalryUpgrades = useGameStore((s) => s.cavalryUpgrades);
  const mageUpgrades = useGameStore((s) => s.mageUpgrades);

  const startBoss = useGameStore((s) => s.startBoss);
  const clickFight = useGameStore((s) => s.clickFight);

  const elite = isEliteBoss(currentBoss);
  const hpRatio = bossActive
    ? Math.max(0, bossHPVal.div(bossMaxHP).toNumber())
    : 1;
  const nextHP = effectiveBossHP(currentBoss);
  const damage = bossDamage(currentBoss);
  const reward = effectiveBossReward(currentBoss);
  const myDPS = armyDPSFull(
    infantry,
    infantryUpgrades.damage,
    archers,
    archerUpgrades.damage,
    cavalry,
    cavalryUpgrades.damage,
    mages,
    mageUpgrades.damage,
  );
  const clickDmg = clickFightDamage(soldiers);

  return (
    <div
      className="absolute z-40 flex flex-col items-center justify-center px-4"
      style={{ left: 0, right: 0, top: 0, height: "22%" }}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-1.5">
        {/* Title row */}
        <div className="flex items-center gap-3 w-full justify-between">
          <div className="text-slate-600 text-xs tracking-widest uppercase">
            Battlefield
          </div>

          <div className="flex items-center gap-2">
            {elite && (
              <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-500 text-amber-300 text-xs font-bold animate-pulse">
                ⚡ ELITE BOSS
              </span>
            )}
            <div
              className={`font-bold text-sm ${elite ? "text-amber-400" : "text-amber-400"}`}
            >
              Boss #{currentBoss}
            </div>
          </div>

          <div className="text-slate-500 text-xs">
            {bossActive ? `DPS: ${fmt(myDPS)}` : `Reward: ${fmt(reward)} N&B`}
          </div>
        </div>

        {/* Elite note (pre-battle only) */}
        {elite && !bossActive && (
          <div className="w-full text-center text-xs text-amber-400/80">
            ⚡ Elite: 3× HP · 5× Reward
          </div>
        )}

        {bossActive ? (
          <>
            {/* HP bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-200"
                style={{
                  width: `${(hpRatio * 100).toFixed(1)}%`,
                  background: elite
                    ? "linear-gradient(90deg, #b45309, #f59e0b)"
                    : "linear-gradient(90deg, #dc2626, #ef4444)",
                }}
              />
            </div>

            <div className="flex items-center gap-4 w-full justify-between">
              <div
                className={`text-xs font-bold ${elite ? "text-amber-400" : "text-red-400"}`}
              >
                {fmt(bossHPVal)} / {fmt(bossMaxHP)} HP
              </div>
              <div className="text-slate-500 text-xs">
                Boss DMG: {fmt(damage)}/s
              </div>
            </div>

            {/* Fight button */}
            <button
              type="button"
              onClick={clickFight}
              className="w-full py-1.5 bg-red-800 hover:bg-red-700 border border-red-600 rounded text-red-100 font-bold text-sm transition-all active:scale-95 cursor-pointer select-none"
            >
              ⚔️ Fight!{" "}
              <span className="text-red-300 text-xs font-normal">
                (+{fmt(clickDmg)} bonus dmg)
              </span>
            </button>
          </>
        ) : (
          <>
            {/* Pre-battle info */}
            <div className="flex items-center gap-4 w-full justify-center text-xs text-slate-500">
              <span>HP: {fmt(nextHP)}</span>
              <span>•</span>
              <span>DMG: {fmt(damage)}/s</span>
              <span>•</span>
              <span>Reward: {fmt(reward)} N&amp;B</span>
            </div>

            <button
              type="button"
              onClick={startBoss}
              className={`
                w-full py-1.5 rounded font-bold text-sm transition-all active:scale-95 cursor-pointer select-none border
                ${
                  elite
                    ? "bg-amber-700 hover:bg-amber-600 border-amber-400 text-amber-100"
                    : "bg-amber-700 hover:bg-amber-600 border-amber-500 text-amber-100"
                }
              `}
            >
              {elite ? "⚡ Challenge Elite Boss #" : "⚔️ Challenge Boss #"}
              {currentBoss}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
