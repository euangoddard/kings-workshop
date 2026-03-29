import gsap from "gsap";
import { useEffect, useRef } from "preact/hooks";
import {
  effectiveCollectorCapacity,
  effectiveCollectorCount,
} from "../engine/economy";
import { useGameStore } from "../store/gameStore";
import { useUIStore } from "../store/uiStore";

// ─── Colour palette (matches former Phaser palette) ──────────────────────────
// Collector cyan→amber interpolation: #22d3ee → ~#f58f4a
const COLLECTOR_R0 = 0x22,
  COLLECTOR_R1 = 0xf5;
const COLLECTOR_G0 = 0xd3,
  COLLECTOR_G1 = 0x8f;
const COLLECTOR_B0 = 0xee,
  COLLECTOR_B1 = 0x4a;

// ─── Zone background image ───────────────────────────────────────────────────
function ZoneBg({ src }: { src: string }) {
  return (
    <img
      src={src}
      className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none select-none"
      alt=""
    />
  );
}

// ─── Scrap pile ───────────────────────────────────────────────────────────────
function ScrapPile() {
  // Layered rectangles matching the Phaser scrap pile visual
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "calc(50% + 40px)",
        transform: "translateX(-50%)",
      }}
    >
      <div className="relative" style={{ width: 70, height: 42 }}>
        {/* bottom layer */}
        <div
          className="absolute"
          style={{
            left: 0,
            bottom: 0,
            width: 70,
            height: 18,
            background: "#64748b",
          }}
        />
        {/* second layer */}
        <div
          className="absolute"
          style={{
            left: 4,
            bottom: 14,
            width: 50,
            height: 14,
            background: "#475569",
          }}
        />
        {/* third layer */}
        <div
          className="absolute"
          style={{
            left: 15,
            bottom: 24,
            width: 40,
            height: 12,
            background: "#64748b",
          }}
        />
        {/* top layer */}
        <div
          className="absolute"
          style={{
            left: 20,
            bottom: 32,
            width: 30,
            height: 10,
            background: "#475569",
          }}
        />
      </div>
    </div>
  );
}

// ─── Anvil ────────────────────────────────────────────────────────────────────
function Anvil() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "calc(50% + 30px)",
        transform: "translateX(-50%)",
      }}
    >
      <div className="relative" style={{ width: 60, height: 36 }}>
        {/* base */}
        <div
          className="absolute"
          style={{
            left: 0,
            bottom: 0,
            width: 60,
            height: 12,
            background: "#3f3f46",
          }}
        />
        {/* body lower */}
        <div
          className="absolute"
          style={{
            left: -4,
            bottom: 10,
            width: 52,
            height: 10,
            background: "#52525b",
          }}
        />
        {/* top face */}
        <div
          className="absolute"
          style={{
            left: 2,
            bottom: 18,
            width: 44,
            height: 14,
            background: "#71717a",
          }}
        />
        {/* horn */}
        <div
          className="absolute"
          style={{
            right: -10,
            bottom: 14,
            width: 10,
            height: 6,
            background: "#52525b",
          }}
        />
      </div>
    </div>
  );
}

// ─── Troop station icons (armoury) ───────────────────────────────────────────
function TroopIcons() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: "50%", top: "25%", transform: "translateX(-50%)" }}
    >
      {/* SVG handles triangles for shield bottom and mage crystal top */}
      <svg width="120" height="48" viewBox="-60 -24 120 48" overflow="visible" aria-hidden="true">
        {/* Infantry shield */}
        <rect
          x="-53"
          y="-9"
          width="14"
          height="18"
          fill="#4338ca"
          stroke="#8b5cf6"
          strokeWidth="1"
        />
        <polygon points="-46,-1 -53,-1 -49.5,7" fill="#3730a3" />

        {/* Archer — bow stave + arrow */}
        <rect
          x="-33"
          y="-9"
          width="5"
          height="18"
          fill="#15803d"
          stroke="#22c55e"
          strokeWidth="1"
        />
        <rect x="-28" y="-1" width="12" height="3" fill="#854d0e" />

        {/* Cavalry — horseshoe blocks */}
        <rect
          x="-8"
          y="-6"
          width="16"
          height="12"
          fill="#b45309"
          stroke="#f59e0b"
          strokeWidth="1"
        />
        <rect x="-5" y="6" width="10" height="4" fill="#92400e" />

        {/* Mage crystal */}
        <rect
          x="19"
          y="-2"
          width="10"
          height="14"
          fill="#1d4ed8"
          stroke="#3b82f6"
          strokeWidth="1"
        />
        <polygon points="24,-12 29,-2 19,-2" fill="#1e40af" />
      </svg>
    </div>
  );
}

// ─── Collector track ──────────────────────────────────────────────────────────
// Positioned absolutely within the main-row relative wrapper, spanning from the
// left edge of the scrap zone to the centre of the workshop zone (~50% of width).
function CollectorTrack() {
  const collectorCount = useGameStore((s) =>
    effectiveCollectorCount(s.collectorCount),
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Trim stale refs when count shrinks
  useEffect(() => {
    dotsRef.current = dotsRef.current.slice(0, collectorCount);
  }, [collectorCount]);

  // GSAP ticker drives position + colour without triggering React re-renders
  useEffect(() => {
    const update = () => {
      const state = useGameStore.getState();
      const capacity = effectiveCollectorCapacity(state.collectorCapacity);
      const fillRatio =
        capacity > 0 ? Math.min(state.collectorFill / capacity, 1) : 0;

      const r = Math.round(
        COLLECTOR_R0 + (COLLECTOR_R1 - COLLECTOR_R0) * fillRatio,
      );
      const g = Math.round(
        COLLECTOR_G0 + (COLLECTOR_G1 - COLLECTOR_G0) * fillRatio,
      );
      const b = Math.round(
        COLLECTOR_B0 + (COLLECTOR_B1 - COLLECTOR_B0) * fillRatio,
      );
      const color = `rgb(${r},${g},${b})`;

      const track = trackRef.current;
      if (!track) {
        return;
      }
      const trackWidth = track.offsetWidth;

      for (const dot of dotsRef.current) {
        if (!dot) {
          continue;
        }
        const x = fillRatio * (trackWidth - 22);
        gsap.set(dot, { x });
        dot.style.background = `rgba(${r},${g},${b},0.9)`;
        dot.style.borderColor = color;
      }
    };

    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, []);

  const stackHeight = Math.max(10, (collectorCount - 1) * 14 + 10);

  return (
    <div
      ref={trackRef}
      className="absolute pointer-events-none"
      style={{
        // Vertically: 50% down the main row + 70px offset (matches Phaser layout)
        top: "calc(50% + 70px)",
        left: 20,
        // Right boundary: workshop centre ≈ 50% of full width; track ends 20px short
        width: "calc(50% - 40px)",
        height: stackHeight + 20,
        transform: `translateY(-50%)`,
      }}
    >
      {/* Dashed track line */}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: 0,
          right: 0,
          height: 2,
          backgroundImage:
            "repeating-linear-gradient(to right, #334155 0px, #334155 8px, transparent 8px, transparent 14px)",
        }}
      />

      {/* Collector dots */}
      {Array.from({ length: collectorCount }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            dotsRef.current[i] = el;
          }}
          className="absolute"
          style={{
            width: 22,
            height: 10,
            left: 0,
            // Centre the stack on the track line
            top: `calc(50% + ${(i - (collectorCount - 1) / 2) * 14 - 5}px)`,
            background: "#22d3ee",
            border: "1px solid #0e7490",
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────────────
export default function GameScene() {
  const leftPanelTab = useUIStore((s) => s.leftPanelTab);

  return (
    // Sits at z-index 0, starts below the 48px resource bar — mirrors old canvas position
    <div className="absolute inset-x-0 bottom-0" style={{ top: 48, zIndex: 0 }}>
      {/* Boss zone — top 22% */}
      <div
        className="absolute inset-x-0 top-0 overflow-hidden"
        style={{
          height: "22%",
          background: "#1e293b",
          borderBottom: "1px solid #334155",
        }}
      >
        <ZoneBg src="/assets/boss_bg.png" />
      </div>

      {/* Main area — absolutely fills from 22% to bottom */}
      <div className="absolute inset-x-0 bottom-0" style={{ top: "22%" }}>
        {/* Relative wrapper: sizing context for CollectorTrack + flex row for zones */}
        <div className="relative flex w-full h-full">
          {/* Scrap zone */}
          <div
            className="relative overflow-hidden flex-shrink-0 h-full"
            style={{
              width: "28%",
              background: "#1e293b",
              borderRight: "1px solid #334155",
            }}
          >
            <ZoneBg src="/assets/scrapyard_bg.png" />
            <p
              className="absolute inset-x-0 text-center pointer-events-none uppercase"
              style={{
                top: 40,
                fontSize: 11,
                color: "#94a3b8",
                fontFamily: "Georgia, serif",
                letterSpacing: 3,
              }}
            >
              {leftPanelTab === "turrets" ? "turrets" : "scrapyard"}
            </p>
            <ScrapPile />
          </div>

          {/* Workshop zone */}
          <div
            className="relative overflow-hidden flex-shrink-0 h-full"
            style={{
              width: "44%",
              background: "#1e293b",
              border: "2px solid #f59e0b",
            }}
          >
            <ZoneBg src="/assets/workshop_bg.png" />
            <p
              className="absolute inset-x-0 text-center pointer-events-none uppercase"
              style={{
                top: 28,
                fontSize: 11,
                color: "#f59e0b",
                fontFamily: "Georgia, serif",
                letterSpacing: 2,
              }}
            >
              King's Workshop
            </p>
            <Anvil />
          </div>

          {/* Armoury zone */}
          <div
            className="relative overflow-hidden flex-shrink-0 h-full"
            style={{
              width: "28%",
              background: "#1e293b",
              borderLeft: "1px solid #334155",
            }}
          >
            <ZoneBg src="/assets/armoury_bg.png" />
            <TroopIcons />
          </div>

          {/* Collector track — absolute within relative wrapper, spans scrap + workshop */}
          <CollectorTrack />
        </div>
      </div>
    </div>
  );
}
