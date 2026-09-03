import Phaser from 'phaser';
import { COLORS } from '../game/constants';

export class CartoonRenderer {
  /**
   * Draws the Ink Shinobi (Rubber Hose Cartoon Ninja)
   */
  public static drawNinja(
    g: Phaser.GameObjects.Graphics,
    facing: 'left' | 'right',
    grounded: boolean,
    dashing: boolean,
    velocityX: number,
    velocityY: number,
    headbandAngle: number,
    animTime: number,
    isDead: boolean = false
  ): void {
    g.clear();
    if (isDead) return;

    const dir = facing === 'right' ? 1 : -1;
    const isMoving = Math.abs(velocityX) > 20 && grounded;

    // --- 1. KATANA SCABBARD (ON BACK) ---
    g.save();
    g.fillStyle(0x0a0a0f, 1);
    g.lineStyle(1.5, 0x000000, 1);
    const swordX = -dir * 6;
    const swordAngle = dir > 0 ? -0.45 : 0.45;
    g.translateCanvas(swordX, -4);
    g.rotateCanvas(swordAngle);
    g.fillRoundedRect(-3, -16, 5, 26, 2);
    g.strokeRoundedRect(-3, -16, 5, 26, 2);
    // Hilt wrap (white)
    g.fillStyle(COLORS.CARTOON_WHITE, 1);
    g.fillRect(-3, -16, 5, 6);
    g.restore();

    // --- 2. DYNAMIC HEADBAND TAILS (FLAPPING BEHIND HEAD) ---
    g.save();
    const ribbonOriginX = -dir * 10;
    const ribbonOriginY = -12;
    g.fillStyle(COLORS.CARTOON_HEADBAND, 1);
    g.lineStyle(1.5, 0x000000, 1);

    // Wave calculation based on time and velocity
    const wave1 = Math.sin(animTime * 0.015) * 4 + headbandAngle;
    const wave2 = Math.cos(animTime * 0.018) * 5 + headbandAngle;

    // Top ribbon
    const r1X = ribbonOriginX - dir * (12 + Math.abs(velocityX) * 0.04);
    const r1Y = ribbonOriginY + wave1 - (velocityY * 0.02);
    g.fillTriangle(ribbonOriginX, ribbonOriginY - 2, ribbonOriginX, ribbonOriginY + 3, r1X, r1Y);
    g.lineBetween(ribbonOriginX, ribbonOriginY - 2, r1X, r1Y);
    g.lineBetween(ribbonOriginX, ribbonOriginY + 3, r1X, r1Y);

    // Bottom ribbon
    const r2X = ribbonOriginX - dir * (16 + Math.abs(velocityX) * 0.05);
    const r2Y = ribbonOriginY + 5 + wave2 - (velocityY * 0.02);
    g.fillTriangle(ribbonOriginX, ribbonOriginY + 2, ribbonOriginX, ribbonOriginY + 7, r2X, r2Y);
    g.lineBetween(ribbonOriginX, ribbonOriginY + 2, r2X, r2Y);
    g.lineBetween(ribbonOriginX, ribbonOriginY + 7, r2X, r2Y);
    g.restore();

    // --- 3. LEGS & FEET (RUBBER HOSE RUN OR JUMP POSE) ---
    g.fillStyle(COLORS.CARTOON_INK, 1);
    g.lineStyle(2, 0x000000, 1);

    if (isMoving) {
      // Classic cartoon rolling wheel effect
      const runCycle = (animTime * 0.02) % (Math.PI * 2);
      const leg1X = Math.cos(runCycle) * 8;
      const leg1Y = 12 + Math.sin(runCycle) * 4;
      const leg2X = Math.cos(runCycle + Math.PI) * 8;
      const leg2Y = 12 + Math.sin(runCycle + Math.PI) * 4;

      // Leg 1
      g.fillEllipse(leg1X, leg1Y, 10, 6);
      g.strokeEllipse(leg1X, leg1Y, 10, 6);
      // Leg 2
      g.fillEllipse(leg2X, leg2Y, 10, 6);
      g.strokeEllipse(leg2X, leg2Y, 10, 6);
    } else if (!grounded) {
      // Jumping / Air pose: one leg tucked, one extended
      g.fillRoundedRect(-10, 10, 8, 8, 3);
      g.strokeRoundedRect(-10, 10, 8, 8, 3);
      g.fillRoundedRect(2, 8, 9, 10, 3);
      g.strokeRoundedRect(2, 8, 9, 10, 3);
    } else {
      // Idle standing shoes
      g.fillRoundedRect(-11, 12, 10, 6, 3);
      g.strokeRoundedRect(-11, 12, 10, 6, 3);
      g.fillRoundedRect(1, 12, 10, 6, 3);
      g.strokeRoundedRect(1, 12, 10, 6, 3);
    }

    // --- 4. NINJA TORSO & BELT ---
    // Inky body
    g.fillStyle(COLORS.CARTOON_INK, 1);
    g.lineStyle(2, 0x000000, 1);
    g.fillRoundedRect(-11, -6, 22, 20, 6);
    g.strokeRoundedRect(-11, -6, 22, 20, 6);

    // White Obi (belt)
    g.fillStyle(COLORS.CARTOON_WHITE, 1);
    g.fillRect(-10, 3, 20, 4);
    g.strokeRect(-10, 3, 20, 4);

    // Obi knot
    g.fillCircle(dir * 2, 5, 3);
    g.strokeCircle(dir * 2, 5, 3);

    // --- 5. CARTOON WHITE GLOVES (HANDS) ---
    g.fillStyle(COLORS.CARTOON_WHITE, 1);
    g.lineStyle(1.5, 0x000000, 1);
    if (dashing) {
      // Hands thrust forward or back
      g.fillCircle(dir * 12, 0, 5);
      g.strokeCircle(dir * 12, 0, 5);
      g.fillCircle(-dir * 10, 2, 4);
      g.strokeCircle(-dir * 10, 2, 4);
    } else if (isMoving) {
      const armSwing = Math.sin(animTime * 0.02) * 6;
      g.fillCircle(-dir * 8 + armSwing, 2, 4.5);
      g.strokeCircle(-dir * 8 + armSwing, 2, 4.5);
      g.fillCircle(dir * 8 - armSwing, 2, 4.5);
      g.strokeCircle(dir * 8 - armSwing, 2, 4.5);
    } else {
      // Relaxed hands
      g.fillCircle(-10, 2, 4.5);
      g.strokeCircle(-10, 2, 4.5);
      g.fillCircle(10, 2, 4.5);
      g.strokeCircle(10, 2, 4.5);
    }

    // --- 6. NINJA HEAD & MASK ---
    // Cowl
    g.fillStyle(COLORS.CARTOON_INK, 1);
    g.lineStyle(2, 0x000000, 1);
    g.fillCircle(0, -12, 13);
    g.strokeCircle(0, -12, 13);

    // Face slit cutout (skin)
    g.fillStyle(COLORS.CARTOON_SKIN, 1);
    const faceX = dir * 2;
    g.fillRoundedRect(faceX - 8, -16, 16, 9, 3);
    g.strokeRoundedRect(faceX - 8, -16, 16, 9, 3);

    // Red Headband wrap
    g.fillStyle(COLORS.CARTOON_HEADBAND, 1);
    g.fillRect(-11, -21, 22, 5);
    g.strokeRect(-11, -21, 22, 5);

    // Forehead ninja emblem / plate
    g.fillStyle(COLORS.CARTOON_WHITE, 1);
    g.fillRoundedRect(faceX - 5, -21, 10, 4, 1);
    g.strokeRoundedRect(faceX - 5, -21, 10, 4, 1);

    // --- 7. CLASSIC RUBBER HOSE PIE-EYES ---
    // Eye whites
    g.fillStyle(COLORS.CARTOON_WHITE, 1);
    const eye1X = faceX - (dir > 0 ? 4 : 5);
    const eye2X = faceX + (dir > 0 ? 3 : 2);
    g.fillEllipse(eye1X, -12, 4, 6);
    g.strokeEllipse(eye1X, -12, 4, 6);
    g.fillEllipse(eye2X, -12, 4, 6);
    g.strokeEllipse(eye2X, -12, 4, 6);

    // Pupils with 1930s pie slice cut
    g.fillStyle(0x000000, 1);
    g.fillCircle(eye1X + dir * 0.8, -12, 2);
    g.fillCircle(eye2X + dir * 0.8, -12, 2);

    // Highlight glimmer
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(eye1X - 0.5, -13.5, 1, 1);
    g.fillRect(eye2X - 0.5, -13.5, 1, 1);
  }

  /**
   * Draws an Ink Doppelganger Shadow (Sinister Inky Echo)
   */
  public static drawInkShadow(
    g: Phaser.GameObjects.Graphics,
    facing: 'left' | 'right',
    grounded: boolean,
    dashing: boolean,
    velocityX: number,
    shadowIndex: number,
    alpha: number,
    glowColor: number,
    animTime: number
  ): void {
    g.clear();
    const dir = facing === 'right' ? 1 : -1;

    // Outer inky aura pulse
    g.lineStyle(3, glowColor, 0.55 * alpha);
    g.strokeCircle(0, -12, 16);
    g.strokeRoundedRect(-13, -7, 26, 24, 7);

    // Dripping Inky Body
    g.fillStyle(COLORS.CARTOON_SHADOW_INK, 0.95 * alpha);
    g.lineStyle(2, glowColor, 0.85 * alpha);

    // Torso
    g.fillRoundedRect(-12, -7, 24, 22, 6);
    g.strokeRoundedRect(-12, -7, 24, 22, 6);

    // Inky dash streaks
    if (dashing) {
      g.fillStyle(glowColor, 0.5 * alpha);
      g.fillTriangle(-dir * 14, -2, -dir * 14, 10, -dir * 28, 4);
    }

    // Inky running/jumping legs
    if (!grounded) {
      g.fillRoundedRect(-10, 10, 8, 8, 3);
      g.fillRoundedRect(2, 8, 9, 10, 3);
    } else if (Math.abs(velocityX) > 20) {
      const legOffset = Math.sin(animTime * 0.02) * 5;
      g.fillCircle(-6 + legOffset, 14, 4);
      g.fillCircle(6 - legOffset, 14, 4);
    }

    // Head
    g.fillCircle(0, -12, 14);
    g.strokeCircle(0, -12, 14);

    // Inky dripping tendrils below
    const drip1 = Math.sin(animTime * 0.01 + shadowIndex) * 4;
    const drip2 = Math.cos(animTime * 0.012 + shadowIndex) * 4;
    g.fillTriangle(-8, 12, -4, 12, -6, 17 + drip1);
    g.fillTriangle(4, 12, 8, 12, 6, 18 + drip2);

    // Tattered shadow headband
    g.fillStyle(glowColor, 0.85 * alpha);
    g.fillRect(-12, -22, 24, 5);
    const flap = Math.sin(animTime * 0.016 + shadowIndex) * 6;
    g.fillTriangle(-dir * 12, -21, -dir * 12, -16, -dir * 24, -18 + flap);

    // Menacing glowing eyes (angled and sharp)
    g.fillStyle(COLORS.CARTOON_WHITE, alpha);
    const eyeOffsetX = dir * 2;
    g.fillTriangle(eyeOffsetX - 7, -15, eyeOffsetX - 1, -12, eyeOffsetX - 7, -10);
    g.fillTriangle(eyeOffsetX + 7, -15, eyeOffsetX + 1, -12, eyeOffsetX + 7, -10);

    // Red pupil glow
    g.fillStyle(COLORS.CARTOON_SHADOW_EYE, alpha);
    g.fillCircle(eyeOffsetX - 4, -12.5, 1.5);
    g.fillCircle(eyeOffsetX + 4, -12.5, 1.5);

    // Jagged white cartoon grin with sharp teeth
    g.fillStyle(COLORS.CARTOON_WHITE, 0.9 * alpha);
    g.lineStyle(1, 0x000000, alpha);
    g.beginPath();
    g.arc(eyeOffsetX, -6, 7, 0.1, Math.PI - 0.1);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Sharp teeth lines
    g.lineBetween(eyeOffsetX - 4, -5, eyeOffsetX - 4, -2);
    g.lineBetween(eyeOffsetX, -5, eyeOffsetX, -1);
    g.lineBetween(eyeOffsetX + 4, -5, eyeOffsetX + 4, -2);
  }

  /**
   * Draws the Memory Collapse Boss — "The Shadow Shogun"
   */
  public static drawCollapseShogun(
    g: Phaser.GameObjects.Graphics,
    facing: 'left' | 'right',
    animTime: number,
    pulseScale: number
  ): void {
    g.clear();
    const dir = facing === 'right' ? 1 : -1;

    // Violent Inky Shockwave / Aura
    const auraWave = Math.sin(animTime * 0.02) * 5;
    g.lineStyle(4, 0x00f0ff, 0.6);
    g.strokeCircle(0, -12, (22 + auraWave) * pulseScale);
    g.lineStyle(2, 0xff0055, 0.8);
    g.strokeCircle(0, -12, (26 + auraWave) * pulseScale);

    // Large Shadow Demon Body
    g.fillStyle(0x050508, 0.98);
    g.lineStyle(2.5, 0x00f0ff, 0.9);
    g.fillRoundedRect(-16, -9, 32, 26, 8);
    g.strokeRoundedRect(-16, -9, 32, 26, 8);

    // Demon Head with Shogun Horns
    g.fillCircle(0, -14, 17);
    g.strokeCircle(0, -14, 17);

    // Kabuto Horns
    g.fillStyle(0xff0055, 1);
    g.fillTriangle(-12, -26, -5, -18, -16, -18);
    g.fillTriangle(12, -26, 5, -18, 16, -18);

    // Glowing cyan headband
    g.fillStyle(0x00f0ff, 1);
    g.fillRect(-15, -24, 30, 6);

    // Demonic Piercing Eyes
    g.fillStyle(0x00f0ff, 1);
    g.fillEllipse(-6, -14, 5, 8);
    g.fillEllipse(6, -14, 5, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-6 + dir, -14, 2);
    g.fillCircle(6 + dir, -14, 2);

    // Huge Grinning Maw
    g.fillStyle(0xffffff, 0.95);
    g.lineStyle(1.5, 0x000000, 1);
    g.beginPath();
    g.arc(0, -6, 10, 0.1, Math.PI - 0.1);
    g.closePath();
    g.fillPath();
    g.strokePath();

    // Jagged fangs
    g.lineBetween(-6, -5, -6, -1);
    g.lineBetween(-2, -5, -2, 0);
    g.lineBetween(2, -5, 2, 0);
    g.lineBetween(6, -5, 6, -1);
  }

  /**
   * Draws the Ancient Shinobi Scroll Collectible
   */
  public static drawShinobiScroll(
    g: Phaser.GameObjects.Graphics,
    animTime: number
  ): void {
    g.clear();

    const floatY = Math.sin(animTime * 0.005) * 3;
    const sparkleAngle = (animTime * 0.003) % (Math.PI * 2);

    // Rotating 4-point cartoon sparkle
    g.save();
    g.translateCanvas(0, floatY);
    g.rotateCanvas(sparkleAngle);
    g.fillStyle(0xffffff, 0.8);
    g.fillTriangle(-16, 0, 16, 0, 0, -5);
    g.fillTriangle(-16, 0, 16, 0, 0, 5);
    g.fillTriangle(0, -16, 0, 16, -5, 0);
    g.fillTriangle(0, -16, 0, 16, 5, 0);
    g.restore();

    // Scroll outer glow
    g.fillStyle(COLORS.CARTOON_SCROLL_GOLD, 0.35);
    g.fillCircle(0, floatY, 18);

    // Scroll Body (Golden Parchment cylinder)
    g.fillStyle(COLORS.CARTOON_SCROLL_PAPER, 1);
    g.lineStyle(2, 0x12131a, 1);
    g.fillRoundedRect(-9, floatY - 11, 18, 22, 4);
    g.strokeRoundedRect(-9, floatY - 11, 18, 22, 4);

    // Scroll Handles (Top & Bottom wooden knobs)
    g.fillStyle(0x7f4f24, 1);
    g.fillRect(-12, floatY - 13, 24, 3);
    g.strokeRect(-12, floatY - 13, 24, 3);
    g.fillRect(-12, floatY + 10, 24, 3);
    g.strokeRect(-12, floatY + 10, 24, 3);

    // Red Shinobi Ribbon tied around the scroll
    g.fillStyle(COLORS.CARTOON_SCROLL_RED, 1);
    g.fillRect(-9, floatY - 2, 18, 4);
    g.strokeRect(-9, floatY - 2, 18, 4);

    // Gold Wax Seal in center
    g.fillStyle(COLORS.CARTOON_SCROLL_GOLD, 1);
    g.fillCircle(0, floatY, 4);
    g.strokeCircle(0, floatY, 4);
  }
}
