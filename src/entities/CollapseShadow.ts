import Phaser from 'phaser';
import { PHYSICS_CONFIG } from '../game/constants';
import { PlayerSnapshot } from '../types/PlayerSnapshot';
import { CartoonRenderer } from '../render/CartoonRenderer';

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

    const pulse = 1 + Math.sin(this.scene.time.now * 0.02) * 0.1;
    CartoonRenderer.drawCollapseShogun(this.graphics, this.facing, this.scene.time.now, pulse);

    const now = this.scene.time.now;
    if (now - this.trailTimer > 45) {
      this.trailTimer = now;
      this.emitHyperTrail();
    }
  }

  private emitHyperTrail(): void {
    const ghost = this.scene.add.graphics();
    ghost.setPosition(this.x, this.y);
    ghost.fillStyle(0xff0055, 0.45);
    ghost.fillRoundedRect(
      -PHYSICS_CONFIG.HITBOX_WIDTH / 2,
      -PHYSICS_CONFIG.HITBOX_HEIGHT / 2,
      PHYSICS_CONFIG.HITBOX_WIDTH,
      PHYSICS_CONFIG.HITBOX_HEIGHT,
      6
    );
    ghost.setDepth(11);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.35,
      scaleY: 1.35,
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
