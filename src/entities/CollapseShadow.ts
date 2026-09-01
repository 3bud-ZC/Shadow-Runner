import Phaser from 'phaser';
import { PHYSICS_CONFIG, COLORS } from '../game/constants';
import { PlayerSnapshot } from '../types/PlayerSnapshot';

export class CollapseShadow extends Phaser.GameObjects.Container {
  public declare body: Phaser.Physics.Arcade.Body;
  private graphics: Phaser.GameObjects.Graphics;
  private facing: 'left' | 'right' = 'right';
  private trailTimer: number = 0;
  private isDangerous: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.body.setSize(PHYSICS_CONFIG.HITBOX_WIDTH, PHYSICS_CONFIG.HITBOX_HEIGHT);
    this.body.setOffset(-PHYSICS_CONFIG.HITBOX_WIDTH / 2, -PHYSICS_CONFIG.HITBOX_HEIGHT / 2);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.enable = false;

    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    this.setDepth(12);
    this.setVisible(false);
  }

  public updateActiveState(snapshot: PlayerSnapshot | null): void {
    if (!snapshot) {
      this.setVisible(false);
      this.body.enable = false;
      this.isDangerous = false;
      this.graphics.clear();
      return;
    }

    this.setVisible(true);
    this.body.enable = true;
    this.isDangerous = true;

    this.setPosition(snapshot.x, snapshot.y);
    this.facing = snapshot.facing;

    this.drawUnstableVisuals(snapshot);

    const now = this.scene.time.now;
    if (now - this.trailTimer > 45) {
      this.trailTimer = now;
      this.emitHyperTrail();
    }
  }

  private drawUnstableVisuals(snapshot: PlayerSnapshot): void {
    this.graphics.clear();

    const w = PHYSICS_CONFIG.HITBOX_WIDTH;
    const h = PHYSICS_CONFIG.HITBOX_HEIGHT;
    const halfW = w / 2;
    const halfH = h / 2;

    // Chromatic glitch jitter offsets
    const jitterX = (Math.random() - 0.5) * 4;
    const jitterY = (Math.random() - 0.5) * 3;

    // Outer unstable magenta/crimson aura
    this.graphics.lineStyle(3, COLORS.COLLAPSE_AURA, 0.9);
    this.graphics.strokeRoundedRect(-halfW - 3 + jitterX, -halfH - 3 + jitterY, w + 6, h + 6, 4);

    // Inner electric gold/cyan core
    this.graphics.fillStyle(COLORS.ORB_CORE, 0.85);
    this.graphics.fillRoundedRect(-halfW, -halfH, w, h, 3);

    // Electric visor
    this.graphics.fillStyle(COLORS.COLLAPSE_CORE, 1);
    const eyeX = this.facing === 'right' ? 3 : -w / 2 + 3;
    this.graphics.fillRect(eyeX + jitterX, -halfH + 5, 8, 6);

    // Split scanline distortion
    this.graphics.fillStyle(0xffffff, 0.6);
    const scanlineY = ((this.scene.time.now * 0.25) % h) - halfH;
    this.graphics.fillRect(-halfW - 2, scanlineY, w + 4, 3);

    if (snapshot.dashing) {
      this.graphics.lineStyle(4, 0xffffff, 1);
      this.graphics.strokeRect(-halfW - 6, -halfH - 6, w + 12, h + 12);
    }
  }

  private emitHyperTrail(): void {
    const ghost = this.scene.add.graphics();
    ghost.setPosition(this.x, this.y);
    ghost.fillStyle(COLORS.COLLAPSE_AURA, 0.45);
    ghost.fillRoundedRect(
      -PHYSICS_CONFIG.HITBOX_WIDTH / 2,
      -PHYSICS_CONFIG.HITBOX_HEIGHT / 2,
      PHYSICS_CONFIG.HITBOX_WIDTH,
      PHYSICS_CONFIG.HITBOX_HEIGHT,
      3
    );
    ghost.setDepth(11);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 250,
      onComplete: () => ghost.destroy(),
    });
  }

  public getIsDangerous(): boolean {
    return this.isDangerous && this.visible;
  }

  public override destroy(fromScene?: boolean): void {
    if (this.graphics) this.graphics.destroy();
    super.destroy(fromScene);
  }
}
