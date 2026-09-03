import Phaser from 'phaser';
import { CartoonRenderer } from '../render/CartoonRenderer';
import { ParticleEffects } from '../effects/Particles';
import { AudioSystem } from '../systems/AudioSystem';
import { Shadow } from './Shadow';

export class BananaPowerUp extends Phaser.GameObjects.Container {
  public declare body: Phaser.Physics.Arcade.Body;
  private graphics: Phaser.GameObjects.Graphics;
  private isUsed: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.body.setSize(24, 18);
    this.body.setOffset(-12, -9);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    this.graphics = scene.add.graphics();
    this.add(this.graphics);
    this.setDepth(6);

    this.draw();
  }

  private draw(): void {
    CartoonRenderer.drawBananaPeel(this.graphics, this.scene.time.now);
  }

  public update(): void {
    if (!this.isUsed && this.visible) {
      this.draw();
    }
  }

  public tripShadow(shadow: Shadow): void {
    if (this.isUsed) return;
    this.isUsed = true;
    this.body.enable = false;

    // Trigger shadow slip & spin
    shadow.tripOnBanana();

    // Audio & Comic VFX
    AudioSystem.getInstance().playBananaSlip();
    ParticleEffects.createComicPopup(this.scene, this.x, this.y - 25, 'SLIP!', 0xffbe0b);
    ParticleEffects.createComicStars(this.scene, this.x, this.y);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy(),
    });
  }

  public getIsUsed(): boolean {
    return this.isUsed;
  }

  public override destroy(fromScene?: boolean): void {
    if (this.graphics) this.graphics.destroy();
    super.destroy(fromScene);
  }
}
