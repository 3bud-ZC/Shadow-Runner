import Phaser from 'phaser';
import { COLORS } from '../game/constants';
import { SaveManager } from '../storage/SaveManager';

export class ParticleEffects {
  public static createRunDust(scene: Phaser.Scene, x: number, y: number, facing: 'left' | 'right'): void {
    if (SaveManager.getSettings().reducedMotion) return;

    const p = scene.add.graphics();
    p.fillStyle(COLORS.CARTOON_WHITE, 0.7);
    p.lineStyle(1, 0x000000, 0.6);
    p.fillCircle(0, 0, 4);
    p.strokeCircle(0, 0, 4);
    p.setPosition(x + (facing === 'right' ? -10 : 10), y);
    p.setDepth(6);

    scene.tweens.add({
      targets: p,
      x: p.x + (facing === 'right' ? -18 : 18),
      y: p.y - 6,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 220,
      onComplete: () => p.destroy(),
    });
  }

  public static createJumpPuff(scene: Phaser.Scene, x: number, y: number): void {
    const isReduced = SaveManager.getSettings().reducedMotion;
    const count = isReduced ? 2 : 5;

    for (let i = 0; i < count; i++) {
      const p = scene.add.graphics();
      p.fillStyle(COLORS.CARTOON_WHITE, 0.85);
      p.lineStyle(1.5, 0x000000, 0.7);
      const r = 3 + Math.random() * 4;
      p.fillCircle(0, 0, r);
      p.strokeCircle(0, 0, r);
      p.setPosition(x + (Math.random() - 0.5) * 16, y);
      p.setDepth(6);

      scene.tweens.add({
        targets: p,
        x: p.x + (Math.random() - 0.5) * 30,
        y: p.y + Math.random() * 8,
        alpha: 0,
        scale: 1.5,
        duration: isReduced ? 140 : 240,
        onComplete: () => p.destroy(),
      });
    }
  }

  public static createLandImpact(scene: Phaser.Scene, x: number, y: number): void {
    const isReduced = SaveManager.getSettings().reducedMotion;
    const count = isReduced ? 3 : 7;

    for (let i = 0; i < count; i++) {
      const p = scene.add.graphics();
      p.fillStyle(COLORS.CARTOON_WHITE, 0.85);
      p.lineStyle(1.5, 0x000000, 0.7);
      const r = 3 + Math.random() * 5;
      p.fillCircle(0, 0, r);
      p.strokeCircle(0, 0, r);
      p.setPosition(x + (Math.random() - 0.5) * 16, y);
      p.setDepth(6);

      const dir = Math.random() > 0.5 ? 1 : -1;
      scene.tweens.add({
        targets: p,
        x: p.x + dir * (12 + Math.random() * 26),
        y: p.y - Math.random() * 6,
        alpha: 0,
        scale: 1.4,
        duration: isReduced ? 130 : 220,
        onComplete: () => p.destroy(),
      });
    }
  }

  public static createSmokeBomb(scene: Phaser.Scene, x: number, y: number): void {
    const isReduced = SaveManager.getSettings().reducedMotion;
    const count = isReduced ? 4 : 10;

    for (let i = 0; i < count; i++) {
      const p = scene.add.graphics();
      const isStar = Math.random() < 0.3;
      p.setPosition(x, y);
      p.setDepth(15);

      if (isStar) {
        p.fillStyle(COLORS.CARTOON_SCROLL_GOLD, 1);
        p.lineStyle(1, 0x000000, 1);
        p.fillTriangle(-6, 0, 6, 0, 0, -4);
        p.fillTriangle(-6, 0, 6, 0, 0, 4);
      } else {
        p.fillStyle(COLORS.CARTOON_WHITE, 0.95);
        p.lineStyle(2, 0x000000, 0.9);
        const radius = 6 + Math.random() * 8;
        p.fillCircle(0, 0, radius);
        p.strokeCircle(0, 0, radius);
      }

      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 45;

      scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: isReduced ? 180 : 320,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  public static createComicPopup(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    colorHex: number = 0xffbe0b
  ): void {
    if (SaveManager.getSettings().reducedMotion) return;

    const container = scene.add.container(x, y);
    container.setDepth(200);

    const txt = scene.add.text(0, 0, text, {
      fontFamily: 'Orbitron, Impact, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // Comic star burst background
    const bg = scene.add.graphics();
    bg.fillStyle(colorHex, 0.9);
    bg.lineStyle(2, 0x000000, 1);
    const w = txt.width + 16;
    const h = txt.height + 8;
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    container.add([bg, txt]);
    container.setScale(0.5);

    scene.tweens.add({
      targets: container,
      y: y - 28,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 160,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.tweens.add({
          targets: container,
          y: y - 40,
          alpha: 0,
          duration: 250,
          delay: 150,
          onComplete: () => container.destroy(),
        });
      },
    });
  }

  public static createInkSplatter(scene: Phaser.Scene, x: number, y: number): void {
    for (let i = 0; i < 18; i++) {
      const p = scene.add.graphics();
      p.fillStyle(0x090a10, 0.95);
      p.lineStyle(1, 0xff0054, 0.8);
      const r = 3 + Math.random() * 6;
      p.fillCircle(0, 0, r);
      p.strokeCircle(0, 0, r);
      p.setPosition(x, y);
      p.setDepth(22);

      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;

      scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.2,
        duration: 450,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  public static createComicStars(scene: Phaser.Scene, x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      const p = scene.add.graphics();
      p.fillStyle(COLORS.CARTOON_SCROLL_GOLD, 1);
      p.lineStyle(1.5, 0x000000, 1);
      // 4-point star
      p.fillTriangle(-7, 0, 7, 0, 0, -5);
      p.fillTriangle(-7, 0, 7, 0, 0, 5);
      p.fillTriangle(0, -7, 0, 7, -5, 0);
      p.fillTriangle(0, -7, 0, 7, 5, 0);

      p.setPosition(x, y - 20);
      p.setDepth(23);

      const angle = (i * Math.PI) / 2;
      scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * 30,
        y: y - 25 + Math.sin(angle) * 15,
        rotation: 3.14,
        alpha: 0,
        duration: 500,
        onComplete: () => p.destroy(),
      });
    }
  }

  public static createDashStreak(scene: Phaser.Scene, x: number, y: number, w: number, h: number): void {
    const isReduced = SaveManager.getSettings().reducedMotion;
    const ghost = scene.add.graphics();
    ghost.setPosition(x, y);
    ghost.fillStyle(COLORS.CARTOON_INK, 0.4);
    ghost.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
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
    overlay.fillStyle(0x12131a, 0.4);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setDepth(180);

    scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => overlay.destroy(),
    });
  }
}
