import Phaser from 'phaser';
import { PHYSICS_CONFIG, SHADOW_CONFIG } from '../game/constants';
import { PlayerSnapshot } from '../types/PlayerSnapshot';
import { ShadowState } from '../systems/ShadowPlaybackSystem';
import { CartoonRenderer } from '../render/CartoonRenderer';

export class Shadow extends Phaser.GameObjects.Container {
  public declare body: Phaser.Physics.Arcade.Body;
  private graphics: Phaser.GameObjects.Graphics;
  private warningGraphics: Phaser.GameObjects.Graphics;
  private shadowState: ShadowState = ShadowState.DORMANT;
  private facing: 'left' | 'right' = 'right';
  private trailTimer: number = 0;
  private isSlipped: boolean = false;

  private shadowIndex: number;
  private coreColor: number;
  private glowColor: number;
  private baseAlpha: number;

  constructor(scene: Phaser.Scene, x: number, y: number, index: number = 0) {
    super(scene, x, y);
    this.shadowIndex = index;

    this.coreColor = SHADOW_CONFIG.COLORS_CORE[index % SHADOW_CONFIG.COLORS_CORE.length];
    this.glowColor = SHADOW_CONFIG.COLORS_GLOW[index % SHADOW_CONFIG.COLORS_GLOW.length];
    this.baseAlpha = SHADOW_CONFIG.ALPHAS[index % SHADOW_CONFIG.ALPHAS.length];

    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.body.setSize(PHYSICS_CONFIG.HITBOX_WIDTH, PHYSICS_CONFIG.HITBOX_HEIGHT);
    this.body.setOffset(-PHYSICS_CONFIG.HITBOX_WIDTH / 2, -PHYSICS_CONFIG.HITBOX_HEIGHT / 2);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.enable = false;

    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    this.warningGraphics = scene.add.graphics();
    this.warningGraphics.setDepth(8);

    this.setDepth(9 - index * 0.1);
    this.setVisible(false);
  }

  public updateState(
    newState: ShadowState,
    snapshot: PlayerSnapshot | null,
    spawnPosition: { x: number; y: number } | null,
    timeUntilSpawnMs: number
  ): void {
    this.shadowState = newState;

    if (newState === ShadowState.DORMANT) {
      this.setVisible(false);
      this.body.enable = false;
      this.warningGraphics.clear();
      return;
    }

    if (newState === ShadowState.WARNING) {
      this.setVisible(false);
      this.body.enable = false;
      if (spawnPosition) {
        this.renderWarningIndicator(spawnPosition.x, spawnPosition.y, timeUntilSpawnMs);
      }
      return;
    }

    if (newState === ShadowState.ACTIVE && snapshot) {
      this.warningGraphics.clear();
      this.setVisible(true);
      this.body.enable = true;

      this.setPosition(snapshot.x, snapshot.y);
      this.facing = snapshot.facing;

      this.drawActiveShadow(snapshot);

      const now = this.scene.time.now;
      if (now - this.trailTimer > 70) {
        this.trailTimer = now;
        this.emitShadowEcho();
      }
    }
  }

  private renderWarningIndicator(x: number, y: number, timeUntilSpawnMs: number): void {
    this.warningGraphics.clear();

    const warningProgress = 1 - Math.max(0, timeUntilSpawnMs / SHADOW_CONFIG.WARNING_DURATION_MS);
    const pulseRadius = 16 + (1 - warningProgress) * 40;

    // Inky puddle swirling on the ground
    this.warningGraphics.fillStyle(0x090a10, 0.75 + 0.25 * warningProgress);
    this.warningGraphics.lineStyle(2, this.glowColor, 0.9);
    this.warningGraphics.fillEllipse(x, y + 16, pulseRadius * 0.9, 10);
    this.warningGraphics.strokeEllipse(x, y + 16, pulseRadius * 0.9, 10);

    // Menacing ink bubble rising
    const bubbleY = y + 14 - (warningProgress * 28);
    this.warningGraphics.fillStyle(this.glowColor, 0.85);
    this.warningGraphics.fillCircle(x, bubbleY, 6 * warningProgress + 3);

    // Warning text icon: "!"
    this.warningGraphics.fillStyle(0xffffff, 0.9);
    this.warningGraphics.fillRect(x - 2, bubbleY - 14, 4, 8);
    this.warningGraphics.fillRect(x - 2, bubbleY - 3, 4, 3);
  }

  private drawActiveShadow(snapshot: PlayerSnapshot): void {
    CartoonRenderer.drawInkShadow(
      this.graphics,
      this.facing,
      snapshot.grounded,
      snapshot.dashing,
      snapshot.velocityX,
      this.shadowIndex,
      this.baseAlpha,
      this.glowColor,
      this.scene.time.now,
      this.isSlipped
    );
  }

  public tripOnBanana(): void {
    if (this.isSlipped) return;
    this.isSlipped = true;
    this.body.enable = false;

    // 3-second dizzy spin
    this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 6,
      duration: 2800,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.setRotation(0);
        this.isSlipped = false;
        if (this.shadowState === ShadowState.ACTIVE) {
          this.body.enable = true;
        }
      },
    });
  }

  private emitShadowEcho(): void {
    const ghost = this.scene.add.graphics();
    ghost.setPosition(this.x, this.y);
    ghost.fillStyle(this.coreColor, 0.35);
    ghost.fillRoundedRect(
      -PHYSICS_CONFIG.HITBOX_WIDTH / 2,
      -PHYSICS_CONFIG.HITBOX_HEIGHT / 2,
      PHYSICS_CONFIG.HITBOX_WIDTH,
      PHYSICS_CONFIG.HITBOX_HEIGHT,
      6
    );
    ghost.setDepth(4);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 200,
      onComplete: () => ghost.destroy(),
    });
  }

  public getIndex(): number {
    return this.shadowIndex;
  }

  public isShadowActive(): boolean {
    return this.shadowState === ShadowState.ACTIVE;
  }

  public override destroy(fromScene?: boolean): void {
    if (this.graphics) this.graphics.destroy();
    if (this.warningGraphics) this.warningGraphics.destroy();
    super.destroy(fromScene);
  }
}
