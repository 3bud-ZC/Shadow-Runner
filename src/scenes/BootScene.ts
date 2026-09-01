import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public preload(): void {
    // Assets can be loaded here if needed
  }

  public create(): void {
    this.scene.start('MenuScene');
  }
}
