import { describe, it, expect } from 'vitest';
import { CartoonRenderer } from '../src/render/CartoonRenderer';
import { COLORS, PHYSICS_CONFIG } from '../src/game/constants';

describe('Cartoon Ninja Theme & Rendering', () => {
  it('defines the classic rubber-hose ink palette constants', () => {
    expect(COLORS.CARTOON_INK).toBeDefined();
    expect(COLORS.CARTOON_HEADBAND).toBe(0xef233c);
    expect(COLORS.CARTOON_WHITE).toBe(0xfdfbf7);
    expect(COLORS.CARTOON_SCROLL_GOLD).toBe(0xffbe0b);
  });

  it('provides safe cartoon rendering methods that do not throw with mock graphics', () => {
    const mockGraphics: any = {
      clear: () => {},
      save: () => {},
      restore: () => {},
      translateCanvas: () => {},
      rotateCanvas: () => {},
      fillStyle: () => {},
      lineStyle: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      fillRoundedRect: () => {},
      strokeRoundedRect: () => {},
      fillCircle: () => {},
      strokeCircle: () => {},
      fillEllipse: () => {},
      strokeEllipse: () => {},
      fillTriangle: () => {},
      lineBetween: () => {},
      beginPath: () => {},
      closePath: () => {},
      arc: () => {},
      fillPath: () => {},
      strokePath: () => {},
    };

    // Test Ninja Render
    expect(() => {
      CartoonRenderer.drawNinja(
        mockGraphics,
        'right',
        true,
        false,
        200,
        0,
        0.2,
        1500,
        false
      );
    }).not.toThrow();

    // Test Inky Shadow Render
    expect(() => {
      CartoonRenderer.drawInkShadow(
        mockGraphics,
        'left',
        true,
        false,
        -150,
        1,
        0.8,
        0xff0054,
        2000
      );
    }).not.toThrow();

    // Test Collapse Shogun Render
    expect(() => {
      CartoonRenderer.drawCollapseShogun(
        mockGraphics,
        'right',
        3000,
        1.1
      );
    }).not.toThrow();

    // Test Shinobi Scroll Render
    expect(() => {
      CartoonRenderer.drawShinobiScroll(
        mockGraphics,
        4000
      );
    }).not.toThrow();
  });

  it('maintains standard fair physical hitboxes for the ninja character', () => {
    expect(PHYSICS_CONFIG.HITBOX_WIDTH).toBe(28);
    expect(PHYSICS_CONFIG.HITBOX_HEIGHT).toBe(40);
    expect(PHYSICS_CONFIG.PLAYER_JUMP_VELOCITY).toBe(-640);
    expect(PHYSICS_CONFIG.DASH_SPEED).toBe(780);
  });
});
