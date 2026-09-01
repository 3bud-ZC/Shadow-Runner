import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { SaveManager } from '../storage/SaveManager';

export class ParticleEffects {
  public static createRunDust(scene: Phaser.Scene, x: number, y: number, facing: 'left' | 'right'): void {
    if (SaveManager.getSettings().reducedMotion) return;

    const p = scene.add.graphics();
    p.fillStyle(COLORS.PLAYER_GLOW, 0.45);
    p.fillRect(0, 0, 3, 3);
    p.setPosition(x + (facing === 'right' ? -8 : 8), y);
    p.setDepth(6);

    scene.tweens.add({
      targets: p,
      x: p.x + (facing === 'right' ? -15 : 15),
      y: p.y - 4,
      alpha: 0,
      scale: 0.2,
      duration: 180,
      onComplete: () => p.destroy(),
    });
  }

  public static createJumpPuff(scene: Phaser.Scene, x: number, y: number): void {
    const isReduced = SaveManager.getSettings().reducedMotion;
    const count = isReduced ? 2 : 6;

    for (let i = 0; i < count; i++) {
      const p = scene.add.graphics();
      p.fillStyle(COLORS.PLAYER_GLOW, 0.7);
      p.fillRect(0, 0, 3, 3);
      p.setPosition(x + (Math.random() - 0.5) * 16, y);
      p.setDepth(6);

      scene.tweens.add({
        targets: p,
        x: p.x + (Math.random() - 0.5) * 24,
        y: p.y + Math.random() * 10,
        alpha: 0,
        duration: isReduced ? 120 : 220,
        onComplete: () => p.destroy(),
      });
    }
  }

  public static createLandImpact(scene: Phaser.Scene, x: number, y: number): void {
    const isReduced = SaveManager.getSettings().reducedMotion;
    const count = isReduced ? 3 : 8;

    for (let i = 0; i < count; i++) {
      const p = scene.add.graphics();
      p.fillStyle(0xffffff, 0.6);
      p.fillRect(0, 0, 3, 3);
      p.setPosition(x + (Math.random() - 0.5) * 12, y);
      p.setDepth(6);

      const dir = Math.random() > 0.5 ? 1 : -1;
      scene.tweens.add({
        targets: p,
        x: p.x + dir * (10 + Math.random() * 20),
        y: p.y - Math.random() * 6,
        alpha: 0,
        duration: isReduced ? 120 : 200,
        onComplete: () => p.destroy(),
      });
    }
  }

  public static createDashStreak(scene: Phaser.Scene, x: number, y: number, w: number, h: number): void {
    const isReduced = SaveManager.getSettings().reducedMotion;
    const ghost = scene.add.graphics();
    ghost.setPosition(x, y);
    ghost.fillStyle(COLORS.PLAYER_CORE, 0.35);
    ghost.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    ghost.setDepth(5);

    scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: isReduced ? 1.05 : 1.25,
      scaleY: isReduced ? 0.95 : 0.75,
      duration: isReduced ? 90 : 160,
      onComplete: () => ghost.destroy(),
    });
  }

  public static createCollapsePulse(scene: Phaser.Scene): void {
    const isReduced = SaveManager.getSettings().reducedMotion;
    if (isReduced) return;

    const overlay = scene.add.graphics();
    overlay.fillStyle(0xff0055, 0.25);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setDepth(180);

    scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => overlay.destroy(),
    });
  }
}
