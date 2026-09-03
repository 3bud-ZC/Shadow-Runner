import Phaser from 'phaser';
import { ORB_CONFIG, COLORS } from '../game/constants';
import { CartoonRenderer } from '../render/CartoonRenderer';
import { ParticleEffects } from '../effects/Particles';

export class EnergyOrb extends Phaser.GameObjects.Container {
  public declare body: Phaser.Physics.Arcade.Body;
  private graphics: Phaser.GameObjects.Graphics;
  private pulseTween!: Phaser.Tweens.Tween;
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
    CartoonRenderer.drawShinobiScroll(this.graphics, this.scene.time.now);
  }

  public update(): void {
    if (!this.isCollected && this.visible) {
      this.draw();
    }
  }

  private startAnimations(): void {
    this.pulseTween = this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: ORB_CONFIG.PULSE_DURATION_MS,
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

    this.spawnSpawnParticles(newX, newY);
  }

  public collect(): void {
    if (this.isCollected) return;
    this.isCollected = true;
    this.body.enable = false;

    // Comic "DING!" popup & sparkles
    ParticleEffects.createComicPopup(this.scene, this.x, this.y - 20, 'DING!', 0xffbe0b);
    this.createCollectionBurst();

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 160,
      onComplete: () => {
        this.setVisible(false);
        this.setAlpha(1);
      },
    });
  }

  private createCollectionBurst(): void {
    for (let i = 0; i < 14; i++) {
      const p = this.scene.add.graphics();
      const color = Math.random() > 0.4 ? COLORS.CARTOON_SCROLL_GOLD : 0xffffff;
      p.fillStyle(color, 1);
      p.lineStyle(1, 0x000000, 1);

      // Star sparkle
      p.fillTriangle(-5, 0, 5, 0, 0, -4);
      p.fillTriangle(-5, 0, 5, 0, 0, 4);

      p.setPosition(this.x, this.y);
      p.setDepth(15);

      const angle = Math.random() * Math.PI * 2;
      const dist = 25 + Math.random() * 55;

      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        rotation: 3.14,
        duration: 350 + Math.random() * 150,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  private spawnSpawnParticles(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.graphics();
      p.fillStyle(COLORS.CARTOON_SCROLL_GOLD, 0.9);
      p.fillRect(0, 0, 4, 4);
      p.setPosition(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
      p.setDepth(14);

      this.scene.tweens.add({
        targets: p,
        x: x,
        y: y,
        alpha: 0,
        duration: 260,
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
    if (this.graphics) this.graphics.destroy();
    super.destroy(fromScene);
  }
}
