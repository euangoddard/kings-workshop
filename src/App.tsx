import { useEffect } from 'preact/hooks'
import GameCanvas from './game/GameCanvas'
import ResourceBar from './ui/ResourceBar'
import ScrapPanel from './ui/ScrapPanel'
import WorkshopPanel from './ui/WorkshopPanel'
import ArmouryPanel from './ui/ArmouryPanel'
import CollectorPanel from './ui/CollectorPanel'
import BossPanel from './ui/BossPanel'
import AchievementsPanel from './ui/AchievementsPanel'
import { useGameStore } from './store/gameStore'

export default function App() {
  const loadGame = useGameStore(s => s.loadGame)

  useEffect(() => {
    loadGame()
  }, [loadGame])

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* Phaser canvas layer */}
      <GameCanvas />

      {/* React UI overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {/* All interactive elements re-enable pointer events */}
        <div className="pointer-events-auto">
          <ResourceBar />
        </div>

        {/* Main game area — starts below resource bar (top bar ~48px) */}
        <div
          className="absolute"
          style={{ top: '48px', left: 0, right: 0, bottom: 0 }}
        >
          {/* Boss panel — top 22% of remaining area */}
          <div className="pointer-events-auto">
            <BossPanel />
          </div>

          {/* Three-column layout for main gameplay */}
          {/* ScrapPanel — left 28% */}
          <div className="pointer-events-auto">
            <ScrapPanel />
          </div>

          {/* WorkshopPanel — center 44% */}
          <div className="pointer-events-auto">
            <WorkshopPanel />
          </div>

          {/* CollectorPanel — center 44%, top portion */}
          <div className="pointer-events-auto">
            <CollectorPanel />
          </div>

          {/* ArmouryPanel — right 28% */}
          <div className="pointer-events-auto">
            <ArmouryPanel />
          </div>

          {/* AchievementsPanel — bottom-left overlay */}
          <div className="pointer-events-auto">
            <AchievementsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
