export interface SpawnPoint {
  id: number;
  x: number;
  y: number;
  name: string;
}

export const ARENA_ORB_SPAWN_POINTS: readonly SpawnPoint[] = [
  // Floor level (above floor y=680)
  { id: 1, x: 220, y: 630, name: 'Floor Left' },
  { id: 2, x: 440, y: 630, name: 'Floor Mid-Left' },
  { id: 3, x: 640, y: 630, name: 'Floor Center' },
  { id: 4, x: 840, y: 630, name: 'Floor Mid-Right' },
  { id: 5, x: 1060, y: 630, name: 'Floor Right' },

  // Lower tier platforms (platform y=530, height=22 -> orb y=490)
  { id: 6, x: 180, y: 490, name: 'Low Left Inner' },
  { id: 7, x: 340, y: 490, name: 'Low Left Outer' },
  { id: 8, x: 940, y: 490, name: 'Low Right Inner' },
  { id: 9, x: 1100, y: 490, name: 'Low Right Outer' },

  // Mid-tier center platform (platform y=410, height=22 -> orb y=370)
  { id: 10, x: 500, y: 370, name: 'Mid Center Left' },
  { id: 11, x: 640, y: 370, name: 'Mid Center Core' },
  { id: 12, x: 780, y: 370, name: 'Mid Center Right' },

  // Upper tier platforms (platform y=270, height=22 -> orb y=230)
  { id: 13, x: 220, y: 230, name: 'High Left Outer' },
  { id: 14, x: 380, y: 230, name: 'High Left Inner' },
  { id: 15, x: 900, y: 230, name: 'High Right Inner' },
  { id: 16, x: 1060, y: 230, name: 'High Right Outer' },

  // Mid-air dynamic spots (reachable via jump / dash)
  { id: 17, x: 380, y: 350, name: 'Air Gap Left' },
  { id: 18, x: 900, y: 350, name: 'Air Gap Right' },
];
