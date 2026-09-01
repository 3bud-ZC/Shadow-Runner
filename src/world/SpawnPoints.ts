export type SpawnRiskTier = 'low' | 'medium' | 'high';

export interface SpawnPoint {
  id: number;
  x: number;
  y: number;
  name: string;
  riskTier: SpawnRiskTier;
}

export const ARENA_ORB_SPAWN_POINTS: readonly SpawnPoint[] = [
  // Floor level (above floor y=680)
  { id: 1, x: 220, y: 630, name: 'Floor Left', riskTier: 'low' },
  { id: 2, x: 440, y: 630, name: 'Floor Mid-Left', riskTier: 'medium' },
  { id: 3, x: 640, y: 630, name: 'Floor Center', riskTier: 'high' },
  { id: 4, x: 840, y: 630, name: 'Floor Mid-Right', riskTier: 'medium' },
  { id: 5, x: 1060, y: 630, name: 'Floor Right', riskTier: 'low' },

  // Lower tier platforms
  { id: 6, x: 180, y: 490, name: 'Low Left Inner', riskTier: 'low' },
  { id: 7, x: 340, y: 490, name: 'Low Left Outer', riskTier: 'medium' },
  { id: 8, x: 940, y: 490, name: 'Low Right Inner', riskTier: 'medium' },
  { id: 9, x: 1100, y: 490, name: 'Low Right Outer', riskTier: 'low' },

  // Mid-tier center platform
  { id: 10, x: 500, y: 370, name: 'Mid Center Left', riskTier: 'medium' },
  { id: 11, x: 640, y: 370, name: 'Mid Center Core', riskTier: 'high' },
  { id: 12, x: 780, y: 370, name: 'Mid Center Right', riskTier: 'medium' },

  // Upper tier platforms
  { id: 13, x: 220, y: 230, name: 'High Left Outer', riskTier: 'low' },
  { id: 14, x: 380, y: 230, name: 'High Left Inner', riskTier: 'medium' },
  { id: 15, x: 900, y: 230, name: 'High Right Inner', riskTier: 'medium' },
  { id: 16, x: 1060, y: 230, name: 'High Right Outer', riskTier: 'low' },

  // Mid-air dynamic spots (Jump / Dash gaps)
  { id: 17, x: 380, y: 350, name: 'Air Gap Left', riskTier: 'high' },
  { id: 18, x: 900, y: 350, name: 'Air Gap Right', riskTier: 'high' },
];
