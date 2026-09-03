import Phaser from 'phaser';
import { gameConfig } from './game/config';

function initGame(): void {
  const win = window as unknown as { __SHADOW_RUNNER_STARTED__?: boolean };
  if (win.__SHADOW_RUNNER_STARTED__) {
    return;
  }
  win.__SHADOW_RUNNER_STARTED__ = true;

  try {
    new Phaser.Game(gameConfig);
  } catch (err) {
    console.error('Failed to launch Shadow Runner:', err);
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initGame();
} else {
  window.addEventListener('DOMContentLoaded', initGame);
  window.addEventListener('load', initGame);
}
