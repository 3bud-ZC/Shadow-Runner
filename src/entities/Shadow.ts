import Phaser from 'phaser';
import { PHYSICS_CONFIG, SHADOW_CONFIG } from '../game/constants';
import { PlayerSnapshot } from '../types/PlayerSnapshot';
import { ShadowState } from '../systems/ShadowPlaybackSystem';

export class Shadow extends Phaser.GameObjects.Container {
  public declare body: Phaser.Physics.Arcade.Body;
  private graphics: Phaser.GameObjects.Graphics;
  private warningGraphics: Phaser.GameObjects.Graphics;
  private shadowState: ShadowState = ShadowState.DORMANT;
  private facing: 'left' | 'right' = 'right';
  private trailTimer: number = 0;

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
    this.body.enable = false; // Disabled until active

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

      // Position update from deterministic delayed replay
      this.setPosition(snapshot.x, snapshot.y);
      this.facing = snapshot.facing;

      this.drawActiveShadow(snapshot);

      // Shadow trail emission (interval throttled to avoid perf overhead)
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
    const pulseRadius = 15 + (1 - warningProgress) * 45;

    // Glowing warning ring
    this.warningGraphics.lineStyle(2, this.coreColor, 0.85 * (0.5 + 0.5 * Math.sin(this.scene.time.now * 0.02 + this.shadowIndex)));
    this.warningGraphics.strokeCircle(x, y, pulseRadius);

    // Inner pulsing glitch core
    this.warningGraphics.fillStyle(this.glowColor, 0.3 + 0.4 * warningProgress);
    this.warningGraphics.fillCircle(x, y, 12 * warningProgress + 4);

    // Glitch spikes
    const angle = (this.scene.time.now * 0.005 + this.shadowIndex * 0.8) % (Math.PI * 2);
    for (let i = 0; i < 4; i++) {
      const a = angle + (i * Math.PI) / 2;
      this.warningGraphics.lineStyle(2, this.coreColor, 0.7);
      this.warningGraphics.lineBetween(
        x + Math.cos(a) * (pulseRadius - 6),
        y + Math.sin(a) * (pulseRadius - 6),
        x + Math.cos(a) * (pulseRadius + 10),
        y + Math.sin(a) * (pulseRadius + 10)
      );
    }
  }

  private drawActiveShadow(snapshot: PlayerSnapshot): void {
    this.graphics.clear();

    const w = PHYSICS_CONFIG.HITBOX_WIDTH;
    const h = PHYSICS_CONFIG.HITBOX_HEIGHT;
    const halfW = w / 2;
    const halfH = h / 2;

    // Glitch jitter
    const jitterX = (Math.random() - 0.5) * 2;
    const jitterY = (Math.random() - 0.5) * 1.5;

    // Distorted shadow aura
    this.graphics.lineStyle(2, this.coreColor, 0.9);
    this.graphics.strokeRoundedRect(-halfW - 2 + jitterX, -halfH - 2 + jitterY, w + 4, h + 4, 4);

    // Dark crimson / violet shadow core
    this.graphics.fillStyle(this.glowColor, this.baseAlpha);
    this.graphics.fillRoundedRect(-halfW, -halfH, w, h, 3);

    // Visor / eye
    this.graphics.fillStyle(this.coreColor, 1);
    const eyeX = this.facing === 'right' ? 2 : -w / 2 + 2;
    this.graphics.fillRect(eyeX + jitterX, -halfH + 6, 8, 5);

    // Glitch scanline across shadow
    this.graphics.fillStyle(0xffffff, 0.4);
    const scanlineY = (((this.scene.time.now * 0.1) + this.shadowIndex * 10) % h) - halfH;
    this.graphics.fillRect(-halfW, scanlineY, w, 2);

    // Echo rank dots on upper torso for identification
    this.graphics.fillStyle(0xffffff, 0.8);
    for (let d = 0; d <= this.shadowIndex; d++) {
      this.graphics.fillRect(-halfW + 4 + d * 4, -halfH + 14, 2, 2);
    }

    if (snapshot.dashing) {
      // Extra surge during shadow dash
      this.graphics.lineStyle(3, this.coreColor, 1);
      this.graphics.strokeRect(-halfW - 4, -halfH - 4, w + 8, h + 8);
    }
  }

  private emitShadowEcho(): void {
    const ghost = this.scene.add.graphics();
    ghost.setPosition(this.x, this.y);
    ghost.fillStyle(this.coreColor, 0.3);
    ghost.fillRoundedRect(
      -PHYSICS_CONFIG.HITBOX_WIDTH / 2,
      -PHYSICS_CONFIG.HITBOX_HEIGHT / 2,
      PHYSICS_CONFIG.HITBOX_WIDTH,
      PHYSICS_CONFIG.HITBOX_HEIGHT,
      3
    );
    ghost.setDepth(4);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.1,
      scaleY: 1.1,
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
