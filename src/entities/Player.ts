import Phaser from 'phaser';
import { PHYSICS_CONFIG, COLORS } from '../game/constants';
import { InputState } from '../systems/InputSystem';
import { PlayerSnapshot } from '../types/PlayerSnapshot';
import { CartoonRenderer } from '../render/CartoonRenderer';
import { ParticleEffects } from '../effects/Particles';
import { AudioSystem } from '../systems/AudioSystem';

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

  private wasGroundedLastFrame: boolean = true;
  private headbandAngle: number = 0;

  // New Cartoon Ninja Abilities & Reactions
  private canDoubleJump: boolean = true;
  private isWallSliding: boolean = false;
  private isScared: boolean = false;
  private isFlipping: boolean = false;

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

    this.draw(0);
  }

  private draw(animTime: number): void {
    if (this.isDead) return;

    const isGrounded = Boolean(this.body.blocked.down || this.body.touching.down);

    CartoonRenderer.drawNinja(
      this.graphics,
      this.facing,
      isGrounded,
      this.isDashing,
      this.body.velocity.x,
      this.body.velocity.y,
      this.headbandAngle,
      animTime,
      this.isDead,
      this.isScared,
      this.isWallSliding
    );
  }

  public update(time: number, input: InputState): void {
    if (this.isDead) {
      this.body.setVelocity(0, 0);
      this.body.setAcceleration(0, 0);
      return;
    }

    const isGrounded = Boolean(this.body.blocked.down || this.body.touching.down);
    if (isGrounded) {
      this.lastGroundedTime = time;
      this.canDoubleJump = true;
      this.isWallSliding = false;
    }

    // Landing Squash & Stretch detection
    if (!this.wasGroundedLastFrame && isGrounded) {
      this.triggerLandSquash();
      ParticleEffects.createLandImpact(this.scene, this.x, this.y + PHYSICS_CONFIG.HITBOX_HEIGHT / 2);
    }
    this.wasGroundedLastFrame = isGrounded;

    // --- WALL SLIDE DETECTION ---
    const isTouchingWall = (this.body.blocked.left || this.body.blocked.right) && !isGrounded;
    if (isTouchingWall && this.body.velocity.y > 0) {
      this.isWallSliding = true;
      // Cap downward slide velocity for slow ninja glide
      this.body.setVelocityY(Math.min(this.body.velocity.y, 110));

      if (Math.random() < 0.25) {
        ParticleEffects.createRunDust(this.scene, this.x, this.y, this.body.blocked.left ? 'left' : 'right');
      }
    } else {
      this.isWallSliding = false;
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
        this.draw(time);
        return;
      }
    }

    // --- JUMP LOGIC (Ground, Wall Jump, and Double Jump) ---
    if (input.jumpPressed) {
      this.lastJumpPressTime = time;

      // 1. Wall Jump
      if (this.isWallSliding) {
        this.executeWallJump();
        return;
      }

      // 2. Double Jump (in air when coyote time has expired)
      const inCoyoteTime = (time - this.lastGroundedTime <= PHYSICS_CONFIG.COYOTE_TIME_MS);
      if (!inCoyoteTime && this.canDoubleJump && !isGrounded) {
        this.executeDoubleJump();
        return;
      }
    }

    // Standard Ground Jump with Coyote time & Jump Buffer
    const canJump = (time - this.lastGroundedTime <= PHYSICS_CONFIG.COYOTE_TIME_MS);
    const wantsJump = (time - this.lastJumpPressTime <= PHYSICS_CONFIG.JUMP_BUFFER_MS);

    if (canJump && wantsJump) {
      this.executeJump();
    }

    // Variable jump height / jump cut if released early
    if (!input.jumpHeld && this.body.velocity.y < -240) {
      this.body.setVelocityY(this.body.velocity.y * 0.75);
    }

    // Horizontal Movement
    if (input.moveX !== 0) {
      this.facing = input.moveX > 0 ? 'right' : 'left';
      this.body.setAccelerationX(input.moveX * PHYSICS_CONFIG.PLAYER_ACCEL);
      if (Math.abs(this.body.velocity.x) > PHYSICS_CONFIG.PLAYER_SPEED) {
        this.body.setVelocityX(Math.sign(this.body.velocity.x) * PHYSICS_CONFIG.PLAYER_SPEED);
      }

      if (isGrounded && Math.random() < 0.25) {
        ParticleEffects.createRunDust(this.scene, this.x, this.y + PHYSICS_CONFIG.HITBOX_HEIGHT / 2, this.facing);
      }
    } else {
      this.body.setAccelerationX(0);
      this.body.setDragX(PHYSICS_CONFIG.PLAYER_DECEL);
    }

    // Dynamic Headband sway
    const targetHeadband = -(this.body.velocity.x * 0.015);
    this.headbandAngle += (targetHeadband - this.headbandAngle) * 0.2;

    this.draw(time);
  }

  private executeJump(): void {
    this.body.setVelocityY(PHYSICS_CONFIG.PLAYER_JUMP_VELOCITY);
    this.lastJumpPressTime = -Infinity;
    this.lastGroundedTime = -Infinity;

    this.scene.tweens.killTweensOf(this);
    this.setScale(0.82, 1.28);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });

    ParticleEffects.createJumpPuff(this.scene, this.x, this.y + PHYSICS_CONFIG.HITBOX_HEIGHT / 2);
  }

  private executeDoubleJump(): void {
    this.canDoubleJump = false;
    this.body.setVelocityY(PHYSICS_CONFIG.PLAYER_JUMP_VELOCITY * 0.95);
    this.lastJumpPressTime = -Infinity;

    // 360-degree Cartoon Front Flip!
    if (!this.isFlipping) {
      this.isFlipping = true;
      const flipDir = this.facing === 'right' ? 1 : -1;
      this.scene.tweens.add({
        targets: this,
        rotation: flipDir * Math.PI * 2,
        duration: 260,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.setRotation(0);
          this.isFlipping = false;
        },
      });
    }

    AudioSystem.getInstance().playDoubleJump();
    ParticleEffects.createJumpPuff(this.scene, this.x, this.y);
    ParticleEffects.createComicPopup(this.scene, this.x, this.y - 30, 'FLIP!', 0x00f0ff);
  }

  private executeWallJump(): void {
    const wallDir = this.body.blocked.left ? 1 : -1;
    this.facing = wallDir > 0 ? 'right' : 'left';
    this.body.setVelocityX(wallDir * 360);
    this.body.setVelocityY(-580);
    this.canDoubleJump = true;
    this.lastJumpPressTime = -Infinity;

    AudioSystem.getInstance().playWallJump();
    ParticleEffects.createJumpPuff(this.scene, this.x, this.y);
    ParticleEffects.createComicPopup(this.scene, this.x, this.y - 30, 'WALL KICK!', 0xffbe0b);
  }

  public launchSuperBounce(): void {
    this.body.setVelocityY(-850);
    this.canDoubleJump = true;

    this.scene.tweens.killTweensOf(this);
    this.setScale(0.7, 1.45);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Back.easeOut',
    });

    AudioSystem.getInstance().playSpringBounce();
    ParticleEffects.createJumpPuff(this.scene, this.x, this.y + 15);
    ParticleEffects.createComicPopup(this.scene, this.x, this.y - 35, 'SUPER BOING!', 0xff0054);
  }

  private triggerLandSquash(): void {
    this.scene.tweens.killTweensOf(this);
    this.setScale(1.32, 0.72);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: 'Elastic.easeOut',
    });
  }

  private startDash(time: number, moveInputX: number): void {
    this.isDashing = true;
    this.lastDashTime = time;
    this.dashEndTime = time + PHYSICS_CONFIG.DASH_DURATION_MS;
    this.dashDirection = moveInputX !== 0 ? (moveInputX > 0 ? 1 : -1) : (this.facing === 'right' ? 1 : -1);
    this.facing = this.dashDirection > 0 ? 'right' : 'left';
    this.body.setAllowGravity(false);
    this.body.setVelocityY(0);

    ParticleEffects.createSmokeBomb(this.scene, this.x, this.y);
    ParticleEffects.createComicPopup(this.scene, this.x, this.y - 28, 'POOF!');

    this.setScale(1.3, 0.75);
  }

  private endDash(): void {
    this.isDashing = false;
    this.body.setAllowGravity(true);
    this.body.setVelocityX(this.dashDirection * PHYSICS_CONFIG.PLAYER_SPEED);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 120,
      ease: 'Quad.easeOut',
    });
  }

  private emitDashTrail(): void {
    const ghost = this.scene.add.graphics();
    ghost.setPosition(this.x, this.y);
    ghost.fillStyle(COLORS.CARTOON_INK, 0.35);
    ghost.fillRoundedRect(
      -PHYSICS_CONFIG.HITBOX_WIDTH / 2,
      -PHYSICS_CONFIG.HITBOX_HEIGHT / 2,
      PHYSICS_CONFIG.HITBOX_WIDTH,
      PHYSICS_CONFIG.HITBOX_HEIGHT,
      6
    );
    ghost.setDepth(5);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.25,
      scaleY: 0.8,
      duration: 160,
      onComplete: () => ghost.destroy(),
    });
  }

  public setScared(scared: boolean): void {
    this.isScared = scared;
  }

  public getCanDoubleJump(): boolean {
    return this.canDoubleJump;
  }

  public getIsWallSliding(): boolean {
    return this.isWallSliding;
  }

  public getSnapshotData(): Omit<PlayerSnapshot, 'timestamp'> {
    const isGrounded = Boolean(this.body.blocked.down || this.body.touching.down);
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
    this.createCartoonDeath();
  }

  private createCartoonDeath(): void {
    ParticleEffects.createComicPopup(this.scene, this.x, this.y - 35, 'SPLAT!', 0xff0055);
    ParticleEffects.createInkSplatter(this.scene, this.x, this.y);
    ParticleEffects.createComicStars(this.scene, this.x, this.y);

    const ghost = this.scene.add.graphics();
    ghost.setPosition(this.x, this.y);
    ghost.fillStyle(COLORS.CARTOON_WHITE, 0.7);
    ghost.lineStyle(1.5, 0x000000, 0.8);
    ghost.fillCircle(0, -10, 10);
    ghost.strokeCircle(0, -10, 10);
    ghost.fillRoundedRect(-8, -4, 16, 18, 4);
    ghost.strokeRoundedRect(-8, -4, 16, 18, 4);
    ghost.lineStyle(2, COLORS.CARTOON_HEADBAND, 0.9);
    ghost.strokeCircle(0, -22, 6);
    ghost.setDepth(25);

    this.scene.tweens.add({
      targets: ghost,
      y: this.y - 90,
      alpha: 0,
      scale: 1.3,
      duration: 1100,
      ease: 'Quad.easeOut',
      onComplete: () => ghost.destroy(),
    });
  }

  public override destroy(fromScene?: boolean): void {
    if (this.graphics) this.graphics.destroy();
    super.destroy(fromScene);
  }
}
