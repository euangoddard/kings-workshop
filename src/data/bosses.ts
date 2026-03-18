export interface BossMetadata {
  id: number;
  name: string;
  image: string;
  description: string;
  color: string;
}

export const BOSS_LIST: BossMetadata[] = [
  {
    id: 0,
    name: "Goliath Guard",
    image: "/assets/bosses/boss_1.png",
    description: "A massive, heavily armored knight with a giant tower shield.",
    color: "#64748b", // slate
  },
  {
    id: 1,
    name: "Scrap Golem",
    image: "/assets/bosses/boss_2.png",
    description: "A large construct made of rusted metal, nuts, and bolts.",
    color: "#b45309", // amber-900
  },
  {
    id: 2,
    name: "Shadow Alchemist",
    image: "/assets/bosses/boss_3.png",
    description: "A mysterious figure shrouded in purple smoke and toxic potions.",
    color: "#7e22ce", // purple-700
  },
  {
    id: 3,
    name: "Ironclad Wyvern",
    image: "/assets/bosses/boss_4.png",
    description: "A fire-breathing dragon with plates of iron bolted to its scales.",
    color: "#dc2626", // red-600
  },
  {
    id: 4,
    name: "Cursed King",
    image: "/assets/bosses/boss_5.png",
    description: "A spectral, decaying king with a broken crown and a glowing blue sword.",
    color: "#3b82f6", // blue-500
  },
  {
    id: 5,
    name: "Siege Breaker",
    image: "/assets/bosses/boss_6.png",
    description: "A massive ogre carrying a giant wooden ram as a club.",
    color: "#166534", // green-800
  },
  {
    id: 6,
    name: "Clockwork Sentinel",
    image: "/assets/bosses/boss_7.png",
    description: "A golden mechanical soldier with four arms and ticking gears.",
    color: "#eab308", // yellow-500
  },
  {
    id: 7,
    name: "Bone Harvester",
    image: "/assets/bosses/boss_8.png",
    description: "A skeletal necromancer with a giant bone scythe and tattered robes.",
    color: "#f8fafc", // slate-50 (bone)
  },
  {
    id: 8,
    name: "Storm Giant",
    image: "/assets/bosses/boss_9.png",
    description: "A towering figure made of storm clouds and crackling lightning.",
    color: "#2dd4bf", // teal-400
  },
  {
    id: 9,
    name: "Apex Predator",
    image: "/assets/bosses/boss_10.png",
    description: "A mutated, monstrous dire wolf with glowing red veins and spikes.",
    color: "#0f172a", // slate-950
  },
];

export function getBossMetadata(id: number): BossMetadata {
  return BOSS_LIST[id % BOSS_LIST.length];
}
