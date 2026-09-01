export interface PlayerSnapshot {
  timestamp: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facing: 'left' | 'right';
  grounded: boolean;
  dashing: boolean;
}
