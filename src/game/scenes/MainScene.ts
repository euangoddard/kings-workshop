import Phaser from "phaser";
import { gameStore } from "../../store/gameStore";
import {
  effectiveCollectorCapacity,
  effectiveCollectorCount,
  armyDPSFull,
} from "../../engine/economy";

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------
const C = {
  bg: 0x0f172a,
  panel: 0x1e293b,
  border: 0x334155,
  gold: 0xf59e0b,
  goldLight: 0xfcd34d,
  red: 0xdc2626,
  redDark: 0x991b1b,
  green: 0x16a34a,
  scrap: 0x64748b,
  collector: 0x22d3ee,
  text: 0xf1f5f9,
  textDim: 0x94a3b8,
  soldier: 0x6366f1,
  infantry: 0x8b5cf6,
  archer: 0x22c55e,
  cavalry: 0xf59e0b,
  mage: 0x3b82f6,
};

interface CollectorVisual {
  rect: Phaser.GameObjects.Rectangle;
  direction: 1 | -1; // 1 = moving right (to workshop), -1 = moving left (to scrap)
  x: number; // logical x in 0..1 range
}

export class MainScene extends Phaser.Scene {
  private collectors: CollectorVisual[] = [];
  private scrapLabel!: Phaser.GameObjects.Text;
  private scrapSubLabel!: Phaser.GameObjects.Text;
  private workshopLabel!: Phaser.GameObjects.Text;
  private bossZone!: Phaser.GameObjects.Rectangle;
  private floatTexts: Array<{
    text: Phaser.GameObjects.Text;
    vy: number;
    life: number;
  }> = [];
  private lastCollectorCount = 0;
  private layoutObjects: Phaser.GameObjects.GameObject[] = [];
  private maskGraphics: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    this.load.image("boss_bg", "/assets/boss_bg.png");
    this.load.image("scrap_bg", "/assets/scrapyard_bg.png");
    this.load.image("workshop_bg", "/assets/workshop_bg.png");
    this.load.image("armoury_bg", "/assets/armoury_bg.png");
  }

  create() {
    this.cameras.main.setBackgroundColor(C.bg);
    this.buildLayout();
    this.buildCollectors();

    this.scale.on("resize", () => {
      this.layoutObjects.forEach((obj) => obj.destroy());
      this.layoutObjects = [];
      this.maskGraphics.forEach((g) => g.destroy());
      this.maskGraphics = [];
      this.buildLayout();
      this.buildCollectors();
    });
  }

  private buildLayout() {
    const { width, height } = this.scale;

    // -----------------------------------------------------------------------
    // Layout regions (approximate – React UI panels overlay these)
    // -----------------------------------------------------------------------
    const bossH = height * 0.22;
    const mainY = bossH;
    const mainH = height - bossH;
    const scrapW = width * 0.28;
    const workshopW = width * 0.44;
    const armouryW = width * 0.28;

    // Helper to track layout objects for cleanup on resize
    const track = <T extends Phaser.GameObjects.GameObject>(obj: T): T => {
      this.layoutObjects.push(obj);
      return obj;
    };

    // Helper to add cropped background image
    const addZoneBackground = (
      key: string,
      x: number,
      y: number,
      w: number,
      h: number,
    ) => {
      const img = track(this.add.image(x, y, key).setOrigin(0.5));
      const scaleX = w / (img as Phaser.GameObjects.Image).width;
      const scaleY = h / (img as Phaser.GameObjects.Image).height;
      const scale = Math.max(scaleX, scaleY);
      (img as Phaser.GameObjects.Image).setScale(scale);
      (img as Phaser.GameObjects.Image).setAlpha(0.6);
      const shape = this.make.graphics();
      this.maskGraphics.push(shape);
      shape.fillStyle(0xffffff);
      shape.fillRect(x - w / 2, y - h / 2, w, h);
      (img as Phaser.GameObjects.Image).setMask(shape.createGeometryMask());
      return img;
    };

    // -----------------------------------------------------------------------
    // Boss zone (top strip)
    // -----------------------------------------------------------------------
    const bossRect = track(
      this.add.rectangle(width / 2, bossH / 2, width - 4, bossH - 4, C.panel),
    ) as Phaser.GameObjects.Rectangle;
    this.bossZone = bossRect;
    addZoneBackground("boss_bg", width / 2, bossH / 2, width - 4, bossH - 4);
    bossRect.setStrokeStyle(1, C.border);

    // -----------------------------------------------------------------------
    // Scrap zone (left)
    // -----------------------------------------------------------------------
    const scrapX = scrapW / 2;
    const scrapY = mainY + mainH / 2;
    const scrapBg = track(
      this.add.rectangle(scrapX, mainY + mainH / 2, scrapW - 4, mainH - 4, C.panel),
    ) as Phaser.GameObjects.Rectangle;
    addZoneBackground("scrap_bg", scrapX, mainY + mainH / 2, scrapW - 4, mainH - 4);
    scrapBg.setStrokeStyle(1, C.border);

    // Scrap pile visual — layered rects
    const pileX = scrapX;
    const pileY = scrapY + 40;
    track(this.add.rectangle(pileX, pileY + 10, 70, 18, C.scrap));
    track(this.add.rectangle(pileX - 8, pileY - 4, 50, 14, 0x475569));
    track(this.add.rectangle(pileX + 10, pileY - 14, 40, 12, 0x64748b));
    track(this.add.rectangle(pileX - 4, pileY - 22, 30, 10, 0x475569));

    track(this.add.rectangle(scrapX, mainY + 28, 140, 24, 0x000000, 0.5));
    this.scrapLabel = track(
      this.add
        .text(scrapX, mainY + 28, "SCRAPYARD", {
          fontSize: "11px",
          color: "#94a3b8",
          fontFamily: "Georgia, serif",
          letterSpacing: 3,
        })
        .setOrigin(0.5),
    ) as Phaser.GameObjects.Text;

    this.scrapSubLabel = track(
      this.add
        .text(scrapX, mainY + 46, "Click to collect", {
          fontSize: "10px",
          color: "#e2e8f0",
          fontFamily: "Georgia, serif",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5),
    ) as Phaser.GameObjects.Text;

    // -----------------------------------------------------------------------
    // Workshop zone (center)
    // -----------------------------------------------------------------------
    const wsX = scrapW + workshopW / 2;
    const wsY = mainY + mainH / 2;
    const wsBg = track(
      this.add.rectangle(wsX, wsY, workshopW - 4, mainH - 4, C.panel),
    ) as Phaser.GameObjects.Rectangle;
    addZoneBackground("workshop_bg", wsX, wsY, workshopW - 4, mainH - 4);
    wsBg.setStrokeStyle(2, C.gold);

    track(this.add.rectangle(wsX, mainY + 28, 160, 24, 0x000000, 0.5));
    this.workshopLabel = track(
      this.add
        .text(wsX, mainY + 28, "KING'S WORKSHOP", {
          fontSize: "11px",
          color: "#f59e0b",
          fontFamily: "Georgia, serif",
          letterSpacing: 2,
        })
        .setOrigin(0.5),
    ) as Phaser.GameObjects.Text;

    // Anvil visual
    const anvX = wsX;
    const anvY = wsY + 30;
    track(this.add.rectangle(anvX, anvY + 10, 60, 12, 0x3f3f46)); // base
    track(this.add.rectangle(anvX - 4, anvY - 2, 52, 10, 0x52525b)); // body lower
    track(this.add.rectangle(anvX + 2, anvY - 14, 44, 14, 0x71717a)); // top
    track(this.add.rectangle(anvX + 22, anvY - 8, 10, 6, 0x52525b)); // horn

    // Collector track (horizontal dashed line between scrap and workshop)
    const trackY = wsY + 70;
    const trackX1 = 20;
    const trackX2 = scrapW + workshopW - 20;
    const dashW = 8;
    const gap = 6;
    let dx = trackX1;
    while (dx < trackX2) {
      track(this.add.rectangle(dx + dashW / 2, trackY, dashW, 2, 0x334155));
      dx += dashW + gap;
    }

    // -----------------------------------------------------------------------
    // Armoury zone (right)
    // -----------------------------------------------------------------------
    const armX = scrapW + workshopW + armouryW / 2;
    const armY = mainY + mainH / 2;
    const armBg = track(
      this.add.rectangle(armX, armY, armouryW - 4, mainH - 4, C.panel),
    ) as Phaser.GameObjects.Rectangle;
    addZoneBackground("armoury_bg", armX, armY, armouryW - 4, mainH - 4);
    armBg.setStrokeStyle(1, C.border);

    // Four troop station visuals
    const stY = armY - mainH * 0.25;
    const stSpacing = 20;

    // Infantry shields (purple)
    const infX = armX - stSpacing * 1.5;
    track(this.add.rectangle(infX, stY, 14, 18, 0x4338ca).setStrokeStyle(1, 0x8b5cf6));
    track(this.add.triangle(infX, stY + 10, -7, 0, 7, 0, 0, 8, 0x3730a3));

    // Archer station (green bow shape)
    const archX = armX - stSpacing * 0.5;
    track(this.add.rectangle(archX, stY, 5, 18, 0x15803d).setStrokeStyle(1, 0x22c55e));
    track(this.add.rectangle(archX + 6, stY, 12, 3, 0x854d0e));

    // Cavalry station (amber horseshoe shape)
    const cavX = armX + stSpacing * 0.5;
    track(this.add.rectangle(cavX, stY, 16, 12, 0xb45309).setStrokeStyle(1, 0xf59e0b));
    track(this.add.rectangle(cavX, stY + 8, 10, 4, 0x92400e));

    // Mage station (blue crystal)
    const mageX = armX + stSpacing * 1.5;
    track(
      this.add.rectangle(mageX, stY - 4, 10, 14, 0x1d4ed8).setStrokeStyle(1, 0x3b82f6),
    );
    track(this.add.triangle(mageX, stY - 12, -5, 0, 5, 0, 0, -8, 0x1e40af));
  }

  private buildCollectors() {
    const { width, height } = this.scale;
    const bossH = height * 0.22;
    const mainH = height - bossH;
    const scrapW = width * 0.28;
    const workshopW = width * 0.44;
    const trackY = bossH + mainH / 2 + 70;

    // destroy old
    this.collectors.forEach((c) => c.rect.destroy());
    this.collectors = [];

    const state = gameStore.getState();
    const count = effectiveCollectorCount(state.collectorCount);

    for (let i = 0; i < count; i++) {
      const rect = this.add.rectangle(
        20,
        trackY - 6 + i * 14,
        22,
        10,
        C.collector,
      );
      rect.setStrokeStyle(1, 0x0e7490);
      rect.setAlpha(0.9);
      this.collectors.push({ rect, direction: 1, x: 0 });
    }
    this.lastCollectorCount = count;
  }

  private scrapX(): number {
    return 20;
  }
  private workshopX(): number {
    const { width } = this.scale;
    const scrapW = width * 0.28;
    return scrapW + width * 0.44 * 0.5;
  }
  private trackY(index: number): number {
    const { height } = this.scale;
    const bossH = height * 0.22;
    const mainH = height - bossH;
    return bossH + mainH / 2 + 70 - 6 + index * 14;
  }

  update(_time: number, delta: number) {
    const state = gameStore.getState();

    // Rebuild collector visuals if count changed
    const count = effectiveCollectorCount(state.collectorCount);
    if (count !== this.lastCollectorCount) {
      this.buildCollectors();
    }

    // Tick game state
    gameStore.getState().tick(delta);

    // Animate collectors
    const capacity = effectiveCollectorCapacity(state.collectorCapacity);
    const fillRatio = Math.min(state.collectorFill / capacity, 1);
    const sx = this.scrapX();
    const wx = this.workshopX();

    this.collectors.forEach((c, i) => {
      const logicalX = fillRatio; // 0 at scrap, 1 at workshop
      const px = sx + (wx - sx) * logicalX;
      c.rect.x = px;
      c.rect.y = this.trackY(i);
      // Color reflects fill
      const r = Math.floor(0x22 + (0xf5 - 0x22) * fillRatio);
      const g = Math.floor(0xd3 - 0x44 * fillRatio);
      const b = Math.floor(0xee - 0xa4 * fillRatio);
      c.rect.setFillStyle((r << 16) | (g << 8) | b);
    });

    // Boss HP bar logic removed to prevent overlap with React UI


    // Float text cleanup
    this.floatTexts = this.floatTexts.filter((ft) => {
      ft.text.y -= ft.vy;
      ft.life -= 1;
      ft.text.setAlpha(ft.life / 60);
      if (ft.life <= 0) {
        ft.text.destroy();
        return false;
      }
      return true;
    });
  }

  spawnFloatText(x: number, y: number, msg: string, color = "#fcd34d") {
    const t = this.add
      .text(x, y, msg, {
        fontSize: "14px",
        color,
        fontFamily: "Georgia, serif",
      })
      .setOrigin(0.5);
    this.floatTexts.push({ text: t, vy: 1.2, life: 60 });
  }
}

function formatBig(d: { toString(): string; toNumber(): number }): string {
  const n = d.toNumber();
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toString();
}
