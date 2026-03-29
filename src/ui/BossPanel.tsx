import { useEffect, useState } from "preact/hooks";
import { getBossMetadata } from "../data/bosses";
import {
  armyDPSFull,
  bossDamage,
  clickFightDamage,
  effectiveBossHP,
  effectiveBossReward,
  isEliteBoss,
  SPECIAL_BUFF_DURATION,
  SPECIAL_BUFF_MULTIPLIER,
  SPECIAL_MIN_CHARGE,
  turretDPS,
} from "../engine/economy";
import { fmt } from "../lib/format";
import { useGameStore } from "../store/gameStore";

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

  const turretCount = useGameStore((s) => s.turretCount);
  const turretLevel = useGameStore((s) => s.turretLevel);
  const specialAttackCharge = useGameStore((s) => s.specialAttackCharge);
  const specialAttackBuffActive = useGameStore(
    (s) => s.specialAttackBuffActive,
  );
  const specialAttackBuffTimer = useGameStore((s) => s.specialAttackBuffTimer);

  const startBoss = useGameStore((s) => s.startBoss);
  const clickFight = useGameStore((s) => s.clickFight);
  const activateSpecialAttack = useGameStore((s) => s.activateSpecialAttack);

  const elite = isEliteBoss(currentBoss);
  const hpRatio = bossActive
    ? Math.max(0, bossHPVal.div(bossMaxHP).toNumber())
    : 1;
  const nextHP = effectiveBossHP(currentBoss);
  const damage = bossDamage(currentBoss);
  const reward = effectiveBossReward(currentBoss);
  const baseArmyDPS = armyDPSFull(
    infantry,
    infantryUpgrades.damage,
    archers,
    archerUpgrades.damage,
    cavalry,
    cavalryUpgrades.damage,
    mages,
    mageUpgrades.damage,
  );
  const buffMult = specialAttackBuffActive ? SPECIAL_BUFF_MULTIPLIER : 1;
  const totalTurretDPS = turretCount * turretDPS(turretLevel);
  const myDPS = baseArmyDPS * buffMult + totalTurretDPS;
  const clickDmg = clickFightDamage(soldiers);
  const canUseSpecial = specialAttackCharge >= SPECIAL_MIN_CHARGE;
  const burstDmg = (baseArmyDPS * buffMult + totalTurretDPS) * 5;

  const bossInfo = getBossMetadata(currentBoss);
  const [isDamaged, setIsDamaged] = useState(false);

  useEffect(() => {
    if (bossActive) {
      setIsDamaged(true);
      const timer = setTimeout(() => setIsDamaged(false), 200);
      return () => clearTimeout(timer);
    }
  }, [bossHPVal, bossActive]);

  if (bossActive) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-auto">
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
        <div className="relative w-3/4 h-[75vh] flex flex-col items-center justify-between gap-3 px-8 py-6">
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
              <div className="font-bold text-sm text-amber-400">
                Boss #{currentBoss}
              </div>
            </div>
            <div className="text-slate-500 text-xs">DPS: {fmt(myDPS)}</div>
          </div>

          {/* Boss sprite */}
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="relative group flex-1 flex items-center">
              <div
                className={`w-64 h-64 flex items-center justify-center relative z-10 animate-boss-spawn ${isDamaged ? "animate-boss-damage" : ""}`}
              >
                <img
                  src={bossInfo.image}
                  alt={bossInfo.name}
                  className="max-h-full max-w-full drop-shadow-[0_0_4px_rgba(239,68,68,0.2)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent && !parent.querySelector(".boss-fallback")) {
                      const fallback = document.createElement("div");
                      fallback.className =
                        "boss-fallback w-16 h-16 bg-slate-800 border-2 border-red-500/50 rounded flex items-center justify-center text-4xl shadow-lg";
                      fallback.innerText = "👹";
                      parent.appendChild(fallback);
                    }
                  }}
                />
                <div className="absolute -inset-2 bg-red-500/5 blur-lg rounded-full -z-10 group-hover:bg-red-500/10 transition-colors" />
              </div>
            </div>
            <div className="text-red-100 font-bold bg-slate-900/80 px-4 py-0.5 rounded-full border border-red-500/30 text-xs shadow-xl backdrop-blur-sm">
              {bossInfo.name}
            </div>
          </div>

          {/* HP bar */}
          <div className="w-full bg-slate-800 rounded-full h-5 border border-slate-700 overflow-hidden shadow-inner">
            <div
              className="h-5 rounded-full transition-all duration-200"
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
              className={`text-sm font-bold ${elite ? "text-amber-400" : "text-red-400"}`}
            >
              {fmt(bossHPVal)} / {fmt(bossMaxHP)} HP
            </div>
            <div className="text-slate-500 text-sm">
              Boss DMG: {fmt(damage)}/s
            </div>
          </div>

          {/* Special attack bar */}
          <div className="w-full flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-violet-400 font-bold tracking-wide uppercase">
                ⚡ Special Attack
              </span>
              <span className="text-slate-500">
                {specialAttackBuffActive
                  ? `Buff active — ${specialAttackBuffTimer.toFixed(1)}s`
                  : `${specialAttackCharge.toFixed(0)}% / ${SPECIAL_MIN_CHARGE}%`}
              </span>
            </div>
            {/* Charge bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${specialAttackCharge.toFixed(1)}%`,
                  background: specialAttackBuffActive
                    ? "linear-gradient(90deg, #7c3aed, #a855f7)"
                    : canUseSpecial
                      ? "linear-gradient(90deg, #6d28d9, #8b5cf6)"
                      : "linear-gradient(90deg, #4c1d95, #6d28d9)",
                }}
              />
            </div>
            {/* Two activation buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => activateSpecialAttack("damage")}
                disabled={!canUseSpecial}
                className={`flex-1 py-1.5 rounded border text-xs font-bold transition-all select-none ${
                  canUseSpecial
                    ? "bg-violet-800 hover:bg-violet-700 border-violet-500 text-violet-100 cursor-pointer active:scale-95"
                    : "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed"
                }`}
              >
                💥 Burst Attack
                <div
                  className={`text-xs font-normal mt-0.5 ${canUseSpecial ? "text-violet-300" : "text-slate-600"}`}
                >
                  {fmt(burstDmg)} dmg
                </div>
              </button>
              <button
                type="button"
                onClick={() => activateSpecialAttack("buff")}
                disabled={!canUseSpecial}
                className={`flex-1 py-1.5 rounded border text-xs font-bold transition-all select-none ${
                  canUseSpecial
                    ? "bg-indigo-800 hover:bg-indigo-700 border-indigo-500 text-indigo-100 cursor-pointer active:scale-95"
                    : "bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed"
                }`}
              >
                🛡️ Troop Buff
                <div
                  className={`text-xs font-normal mt-0.5 ${canUseSpecial ? "text-indigo-300" : "text-slate-600"}`}
                >
                  {SPECIAL_BUFF_MULTIPLIER}× DPS · {SPECIAL_BUFF_DURATION}s
                </div>
              </button>
            </div>
          </div>

          {/* Fight button */}
          <button
            type="button"
            onClick={clickFight}
            className="w-full py-3 bg-red-800 hover:bg-red-700 border border-red-600 rounded text-red-100 font-bold text-lg transition-all active:scale-95 cursor-pointer select-none"
          >
            ⚔️ Fight!{" "}
            <span className="text-red-300 text-xs font-normal">
              (+{fmt(clickDmg)} bonus dmg)
            </span>
          </button>
        </div>
      </div>
    );
  }

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
            <div className="font-bold text-sm text-amber-400">
              Boss #{currentBoss}
            </div>
          </div>
          <div className="text-slate-500 text-xs">
            Reward: {fmt(reward)} N&B
          </div>
        </div>

        {elite && (
          <div className="w-full text-center text-xs text-amber-400/80">
            ⚡ Elite: 3× HP · 5× Reward
          </div>
        )}

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
          className={`w-full py-1.5 rounded font-bold text-sm transition-all active:scale-95 cursor-pointer select-none border ${
            elite
              ? "bg-amber-700 hover:bg-amber-600 border-amber-400 text-amber-100"
              : "bg-amber-700 hover:bg-amber-600 border-amber-500 text-amber-100"
          }`}
        >
          {elite ? "⚡ Challenge Elite Boss #" : "⚔️ Challenge Boss #"}
          {currentBoss}
        </button>
      </div>
    </div>
  );
}
