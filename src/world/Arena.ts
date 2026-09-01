import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';

export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Arena {
  private scene: Phaser.Scene;
  public platforms!: Phaser.Physics.Arcade.StaticGroup;
  private graphics!: Phaser.GameObjects.Graphics;

  private platformConfigs: PlatformConfig[] = [
    // Bottom floor
    { x: 0, y: GAME_HEIGHT - 40, width: GAME_WIDTH, height: 40 },
    // Side boundaries
    { x: 0, y: 0, width: 24, height: GAME_HEIGHT },
    { x: GAME_WIDTH - 24, y: 0, width: 24, height: GAME_HEIGHT },
    // Ceiling
    { x: 0, y: 0, width: GAME_WIDTH, height: 24 },
    // Lower tier platforms
    { x: 120, y: 530, width: 300, height: 22 },
    { x: GAME_WIDTH - 420, y: 530, width: 300, height: 22 },
    // Mid tier center platform
    { x: 440, y: 410, width: 400, height: 22 },
    // Upper tier platforms
    { x: 160, y: 270, width: 280, height: 22 },
    { x: GAME_WIDTH - 440, y: 270, width: 280, height: 22 },
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    this.drawBackground();
    this.createPhysicsPlatforms();
    this.drawPlatforms();
  }

  private drawBackground(): void {
    const bg = this.scene.add.graphics();
    bg.setDepth(-10);

    // Deep gradient-like background fill
    bg.fillStyle(COLORS.BG_DARK, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Cyber simulation grid
    bg.lineStyle(1, COLORS.BG_GRID, 0.4);
    const gridSize = 40;
    for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
      bg.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += gridSize) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Subtle center arena marker
    bg.lineStyle(1, 0x00f0ff, 0.15);
    bg.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 180);
    bg.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 320);
  }

  private createPhysicsPlatforms(): void {
    this.platforms = this.scene.physics.add.staticGroup();

    for (const config of this.platformConfigs) {
      // Create an invisible arcade body for each platform
      const zone = this.scene.add.zone(
        config.x + config.width / 2,
        config.y + config.height / 2,
        config.width,
        config.height
      );
      this.scene.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
      this.platforms.add(zone);
    }
  }

  private drawPlatforms(): void {
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(1);

    for (const config of this.platformConfigs) {
      // Platform fill
      this.graphics.fillStyle(COLORS.PLATFORM_FILL, 0.95);
      this.graphics.fillRect(config.x, config.y, config.width, config.height);

      // Outer border stroke
      this.graphics.lineStyle(2, 0x1f2a44, 1);
      this.graphics.strokeRect(config.x, config.y, config.width, config.height);

      // Glowing top accent edge for platforms
      if (config.y > 0 && config.height < 50) {
        this.graphics.lineStyle(2, COLORS.PLATFORM_TOP, 0.85);
        this.graphics.lineBetween(config.x, config.y, config.x + config.width, config.y);

        // Subtle glow line below top edge
        this.graphics.lineStyle(1, COLORS.PLATFORM_STROKE, 0.3);
        this.graphics.lineBetween(config.x + 2, config.y + 3, config.x + config.width - 2, config.y + 3);
      }
    }
  }

  public getSpawnPosition(): { x: number; y: number } {
    return { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 120 };
  }

  public destroy(): void {
    if (this.graphics) this.graphics.destroy();
  }
}
