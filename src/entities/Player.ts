import Phaser from 'phaser';
import { PHYSICS_CONFIG, COLORS } from '../game/constants';
import { InputState } from '../systems/InputSystem';
import { PlayerSnapshot } from '../types/PlayerSnapshot';

export class Player extends Phaser.GameObjects.Container {
  public declare body: Phaser.Physics.Arcade.Body;
  private graphics: Phaser.GameObjects.Graphics;
  
  private facing: 'left' | 'right' = 'right';
  private lastGroundedTime: number = 0;
  private lastJumpPressTime: number = -Infinity;
  private lastDashTime: number = -Infinity;
  private isDashing: boolean = false;
  private dashEndTime: number = 0;
  private dashDirection: number = 1;
  private isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.body.setSize(PHYSICS_CONFIG.HITBOX_WIDTH, PHYSICS_CONFIG.HITBOX_HEIGHT);
    this.body.setOffset(-PHYSICS_CONFIG.HITBOX_WIDTH / 2, -PHYSICS_CONFIG.HITBOX_HEIGHT / 2);
    this.body.setCollideWorldBounds(true);
    this.body.setMaxVelocity(PHYSICS_CONFIG.DASH_SPEED, 900);

    this.graphics = scene.add.graphics();
    this.add(this.graphics);
    this.setDepth(10);

    this.draw();
  }

  private draw(): void {
    this.graphics.clear();

    const w = PHYSICS_CONFIG.HITBOX_WIDTH;
    const h = PHYSICS_CONFIG.HITBOX_HEIGHT;
    const halfW = w / 2;
    const halfH = h / 2;

    if (this.isDead) return;

    // Outer neon glow
    this.graphics.lineStyle(2, COLORS.PLAYER_GLOW, 0.6);
    this.graphics.strokeRoundedRect(-halfW - 2, -halfH - 2, w + 4, h + 4, 4);

    // Inner player body
    this.graphics.fillStyle(COLORS.PLAYER_CORE, 1);
    this.graphics.fillRoundedRect(-halfW, -halfH, w, h, 3);

    // Cyber visor / eye
    this.graphics.fillStyle(0xffffff, 1);
    const eyeX = this.facing === 'right' ? 2 : -w / 2 + 2;
    this.graphics.fillRect(eyeX, -halfH + 6, 8, 5);

    // Core energy center
    this.graphics.fillStyle(0xffffff, 0.8);
    this.graphics.fillCircle(0, 2, 4);
  }

  public update(time: number, input: InputState): void {
    if (this.isDead) {
      this.body.setVelocity(0, 0);
      this.body.setAcceleration(0, 0);
      return;
    }

    const isGrounded = this.body.blocked.down || this.body.touching.down;
    if (isGrounded) {
      this.lastGroundedTime = time;
    }

    // Handle Dash Trigger
    if (input.dashPressed && time - this.lastDashTime >= PHYSICS_CONFIG.DASH_COOLDOWN_MS && !this.isDashing) {
      this.startDash(time, input.moveX);
    }

    // Handle Active Dash
    if (this.isDashing) {
      if (time >= this.dashEndTime) {
        this.endDash();
      } else {
        this.body.setVelocityX(this.dashDirection * PHYSICS_CONFIG.DASH_SPEED);
        this.body.setVelocityY(0);
        this.emitDashTrail();
        this.draw();
        return;
      }
    }

    // Buffer jump input
    if (input.jumpPressed) {
      this.lastJumpPressTime = time;
    }

    // Check jump with Coyote time & Jump Buffer
    const canJump = (time - this.lastGroundedTime <= PHYSICS_CONFIG.COYOTE_TIME_MS);
    const wantsJump = (time - this.lastJumpPressTime <= PHYSICS_CONFIG.JUMP_BUFFER_MS);

    if (canJump && wantsJump) {
      this.executeJump();
    }

    // Variable jump height / jump cut if released early
    if (!input.jumpHeld && this.body.velocity.y < -150) {
      this.body.setVelocityY(this.body.velocity.y * 0.7);
    }

    // Horizontal Movement
    if (input.moveX !== 0) {
      this.facing = input.moveX > 0 ? 'right' : 'left';
      this.body.setAccelerationX(input.moveX * PHYSICS_CONFIG.PLAYER_ACCEL);
      if (Math.abs(this.body.velocity.x) > PHYSICS_CONFIG.PLAYER_SPEED) {
        this.body.setVelocityX(Math.sign(this.body.velocity.x) * PHYSICS_CONFIG.PLAYER_SPEED);
      }
    } else {
      this.body.setAccelerationX(0);
      this.body.setDragX(PHYSICS_CONFIG.PLAYER_DECEL);
    }

    this.draw();
  }

  private executeJump(): void {
    this.body.setVelocityY(PHYSICS_CONFIG.PLAYER_JUMP_VELOCITY);
    this.lastJumpPressTime = -Infinity;
    this.lastGroundedTime = -Infinity;
    this.createJumpParticles();
  }

  private startDash(time: number, moveInputX: number): void {
    this.isDashing = true;
    this.lastDashTime = time;
    this.dashEndTime = time + PHYSICS_CONFIG.DASH_DURATION_MS;
    this.dashDirection = moveInputX !== 0 ? (moveInputX > 0 ? 1 : -1) : (this.facing === 'right' ? 1 : -1);
    this.facing = this.dashDirection > 0 ? 'right' : 'left';
    this.body.setAllowGravity(false);
    this.body.setVelocityY(0);
    this.createDashBurstParticles();
  }

  private endDash(): void {
    this.isDashing = false;
    this.body.setAllowGravity(true);
    this.body.setVelocityX(this.dashDirection * PHYSICS_CONFIG.PLAYER_SPEED);
  }

  private emitDashTrail(): void {
    const ghost = this.scene.add.graphics();
    ghost.setPosition(this.x, this.y);
    ghost.fillStyle(COLORS.PLAYER_CORE, 0.4);
    ghost.fillRoundedRect(
      -PHYSICS_CONFIG.HITBOX_WIDTH / 2,
      -PHYSICS_CONFIG.HITBOX_HEIGHT / 2,
      PHYSICS_CONFIG.HITBOX_WIDTH,
      PHYSICS_CONFIG.HITBOX_HEIGHT,
      3
    );
    ghost.setDepth(5);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 180,
      onComplete: () => ghost.destroy(),
    });
  }

  private createJumpParticles(): void {
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.graphics();
      p.fillStyle(COLORS.PLAYER_GLOW, 0.8);
      p.fillRect(0, 0, 3, 3);
      p.setPosition(this.x + (Math.random() - 0.5) * 20, this.y + PHYSICS_CONFIG.HITBOX_HEIGHT / 2);
      p.setDepth(6);

      this.scene.tweens.add({
        targets: p,
        x: p.x + (Math.random() - 0.5) * 30,
        y: p.y + Math.random() * 15,
        alpha: 0,
        duration: 250,
        onComplete: () => p.destroy(),
      });
    }
  }

  private createDashBurstParticles(): void {
    for (let i = 0; i < 10; i++) {
      const p = this.scene.add.graphics();
      p.fillStyle(COLORS.PLAYER_CORE, 0.9);
      p.fillRect(0, 0, 4, 4);
      p.setPosition(this.x, this.y + (Math.random() - 0.5) * 20);
      p.setDepth(6);

      this.scene.tweens.add({
        targets: p,
        x: p.x - this.dashDirection * (20 + Math.random() * 40),
        y: p.y + (Math.random() - 0.5) * 20,
        alpha: 0,
        scale: 0.2,
        duration: 300,
        onComplete: () => p.destroy(),
      });
    }
  }

  public getSnapshotData(): Omit<PlayerSnapshot, 'timestamp'> {
    const isGrounded = this.body.blocked.down || this.body.touching.down;
    return {
      x: this.x,
      y: this.y,
      velocityX: this.body.velocity.x,
      velocityY: this.body.velocity.y,
      facing: this.facing,
      grounded: isGrounded,
      dashing: this.isDashing,
    };
  }

  public getDashCooldownProgress(time: number): number {
    const elapsed = time - this.lastDashTime;
    return Math.min(1, Math.max(0, elapsed / PHYSICS_CONFIG.DASH_COOLDOWN_MS));
  }

  public getIsDead(): boolean {
    return this.isDead;
  }

  public kill(): void {
    if (this.isDead) return;
    this.isDead = true;
    this.graphics.clear();
    this.createDeathExplosion();
  }

  private createDeathExplosion(): void {
    for (let i = 0; i < 30; i++) {
      const p = this.scene.add.graphics();
      const color = Math.random() > 0.5 ? COLORS.PLAYER_CORE : 0xffffff;
      p.fillStyle(color, 1);
      const size = 3 + Math.random() * 4;
      p.fillRect(0, 0, size, size);
      p.setPosition(this.x, this.y);
      p.setDepth(20);

      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 260;

      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * speed,
        y: this.y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.1,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  public override destroy(fromScene?: boolean): void {
    if (this.graphics) this.graphics.destroy();
    super.destroy(fromScene);
  }
}
