import Phaser from 'phaser';
import { gameConfig } from './game/config';

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(gameConfig);
});
