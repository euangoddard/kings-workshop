import { useEffect, useRef, useState } from "preact/hooks";
import { useGameStore } from "../store/gameStore";
import type { Achievement } from "../types/game";

interface Toast {
  id: number;
  achievement: Achievement;
}

let toastIdCounter = 0;

export default function AchievementsPanel() {
  const achievements = useGameStore((s) => s.achievements);
  const [expanded, setExpanded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevAchievementsRef = useRef<Achievement[]>(achievements);

  // Detect newly unlocked achievements and spawn toasts
  useEffect(() => {
    const prev = prevAchievementsRef.current;
    const newlyUnlocked = achievements.filter((a) => {
      const old = prev.find((p) => p.id === a.id);
      return a.unlocked && old && !old.unlocked;
    });

    if (newlyUnlocked.length > 0) {
      const newToasts = newlyUnlocked.map((a) => ({
        id: ++toastIdCounter,
        achievement: a,
      }));
      setToasts((prev) => [...prev, ...newToasts]);

      // Auto-dismiss each toast after 4 seconds
      newToasts.forEach((t) => {
        setTimeout(() => {
          setToasts((prev) => prev.filter((pt) => pt.id !== t.id));
        }, 4000);
      });
    }

    prevAchievementsRef.current = achievements;
  }, [achievements]);

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const total = achievements.length;

  return (
    <>
      {/* Toast notifications — top right */}
      <div className="fixed top-14 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 px-3 py-2 bg-amber-900/90 border border-amber-500 rounded-lg shadow-lg backdrop-blur-sm animate-in"
            style={{ animation: "fadeInSlide 0.3s ease-out" }}
          >
            <span className="text-amber-300 text-lg">🏆</span>
            <div>
              <div className="text-amber-200 font-bold text-sm">
                {t.achievement.name}
              </div>
              <div className="text-amber-400/80 text-xs">
                {t.achievement.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievement panel — bottom right */}
      <div className="absolute bottom-4 right-4 z-30 flex flex-col items-end">
        {/* Expanded list */}
        {expanded && (
          <div className="mb-2 w-64 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl backdrop-blur-sm max-h-80 overflow-y-auto">
            <div className="sticky top-0 bg-slate-900/95 px-3 py-2 border-b border-slate-700">
              <div className="text-slate-300 font-bold text-sm">
                Achievements
              </div>
              <div className="text-slate-500 text-xs">
                {unlocked} / {total} unlocked
              </div>
            </div>
            <div className="p-2 flex flex-col gap-1">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-start gap-2 px-2 py-1.5 rounded transition-colors ${
                    a.unlocked
                      ? "bg-amber-900/20 border border-amber-800/40"
                      : "opacity-40"
                  }`}
                >
                  <span className="text-sm mt-0.5">
                    {a.unlocked ? "🏆" : "🔒"}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold leading-snug ${a.unlocked ? "text-amber-200" : "text-slate-500"}`}
                    >
                      {a.name}
                    </div>
                    <div
                      className={`text-xs leading-snug ${a.unlocked ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {a.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600 rounded-lg text-xs text-slate-300 font-semibold transition-all cursor-pointer select-none backdrop-blur-sm shadow"
        >
          <span>🏆</span>
          <span>
            {unlocked} / {total} Achievements
          </span>
          <span className="text-slate-500">{expanded ? "▼" : "▲"}</span>
        </button>
      </div>
    </>
  );
}
