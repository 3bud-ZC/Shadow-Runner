import Phaser from 'phaser';
import { ORB_CONFIG, COLORS } from '../game/constants';

export class EnergyOrb extends Phaser.GameObjects.Container {
  public declare body: Phaser.Physics.Arcade.Body;
  private graphics: Phaser.GameObjects.Graphics;
  private pulseTween!: Phaser.Tweens.Tween;
  private floatTween!: Phaser.Tweens.Tween;
  private isCollected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.body.setCircle(ORB_CONFIG.HITBOX_RADIUS);
    this.body.setOffset(-ORB_CONFIG.HITBOX_RADIUS, -ORB_CONFIG.HITBOX_RADIUS);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    this.graphics = scene.add.graphics();
    this.add(this.graphics);
    this.setDepth(7);

    this.draw();
    this.startAnimations();
  }

  private draw(): void {
    this.graphics.clear();

    const r = ORB_CONFIG.RADIUS;

    // Outer warm glow
    this.graphics.fillStyle(COLORS.ORB_GLOW, 0.35);
    this.graphics.fillCircle(0, 0, r + 6);

    // Mid neon gold shell
    this.graphics.fillStyle(COLORS.ORB_CORE, 0.85);
    this.graphics.fillCircle(0, 0, r);

    // Inner bright core
    this.graphics.fillStyle(COLORS.ORB_INNER, 1);
    this.graphics.fillCircle(0, 0, r * 0.45);

    // Accent sparkle diamond
    this.graphics.fillStyle(0xffffff, 0.9);
    this.graphics.fillRect(-2, -r - 2, 4, 4);
    this.graphics.fillRect(-2, r - 2, 4, 4);
    this.graphics.fillRect(-r - 2, -2, 4, 4);
    this.graphics.fillRect(r - 2, -2, 4, 4);
  }

  private startAnimations(): void {
    // Pulsing scale tween
    this.pulseTween = this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: ORB_CONFIG.PULSE_DURATION_MS,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Gentle vertical bobbing
    this.floatTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public reposition(newX: number, newY: number): void {
    this.isCollected = false;
    this.setPosition(newX, newY);
    this.setVisible(true);
    this.body.enable = true;
    this.setScale(1);

    if (this.floatTween) {
      this.floatTween.remove();
    }
    this.floatTween = this.scene.tweens.add({
      targets: this,
      y: newY - 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.spawnSpawnParticles(newX, newY);
  }

  public collect(): void {
    if (this.isCollected) return;
    this.isCollected = true;
    this.body.enable = false;

    this.createCollectionBurst();

    // Scale down & fade out before reposition
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 160,
      onComplete: () => {
        this.setVisible(false);
        this.setAlpha(1);
      },
    });
  }

  private createCollectionBurst(): void {
    for (let i = 0; i < 18; i++) {
      const p = this.scene.add.graphics();
      const color = Math.random() > 0.3 ? COLORS.ORB_CORE : COLORS.ORB_INNER;
      p.fillStyle(color, 1);
      const size = 3 + Math.random() * 3;
      p.fillRect(0, 0, size, size);
      p.setPosition(this.x, this.y);
      p.setDepth(15);

      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 60;

      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 350 + Math.random() * 150,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  private spawnSpawnParticles(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.graphics();
      p.fillStyle(COLORS.ORB_GLOW, 0.8);
      p.fillRect(0, 0, 3, 3);
      p.setPosition(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
      p.setDepth(14);

      this.scene.tweens.add({
        targets: p,
        x: x,
        y: y,
        alpha: 0,
        duration: 300,
        ease: 'Sine.easeIn',
        onComplete: () => p.destroy(),
      });
    }
  }

  public getIsCollected(): boolean {
    return this.isCollected;
  }

  public override destroy(fromScene?: boolean): void {
    if (this.pulseTween) this.pulseTween.remove();
    if (this.floatTween) this.floatTween.remove();
    if (this.graphics) this.graphics.destroy();
    super.destroy(fromScene);
  }
}
