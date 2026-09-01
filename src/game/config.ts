import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS_CONFIG, COLORS } from './constants';
import { BootScene } from '../scenes/BootScene';
import { MenuScene } from '../scenes/MenuScene';
import { TutorialScene } from '../scenes/TutorialScene';
import { SettingsScene } from '../scenes/SettingsScene';
import { GameScene } from '../scenes/GameScene';
import { PauseScene } from '../scenes/PauseScene';
import { GameOverScene } from '../scenes/GameOverScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.BG_DARK,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PHYSICS_CONFIG.GRAVITY_Y },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, TutorialScene, SettingsScene, GameScene, PauseScene, GameOverScene],
};
