import { describe, it, expect, beforeEach } from 'vitest';
import { AudioSystem } from '../src/systems/AudioSystem';
import { InputSystem } from '../src/systems/InputSystem';
import { SaveManager } from '../src/storage/SaveManager';

describe('AudioSystem & Mute Persistence', () => {
  beforeEach(() => {
    SaveManager.reset();
  });

  it('manages mute and unmute states consistently with SaveManager', () => {
    const audio = AudioSystem.getInstance();
    audio.setMuted(false);
    expect(audio.isMuted()).toBe(false);
    expect(SaveManager.isMuted()).toBe(false);

    const isNowMuted = audio.toggleMute();
    expect(isNowMuted).toBe(true);
    expect(audio.isMuted()).toBe(true);
    expect(SaveManager.isMuted()).toBe(true);

    audio.setMuted(false);
    expect(audio.isMuted()).toBe(false);
  });

  it('handles sound triggers safely in headless test environments without throwing', () => {
    const audio = AudioSystem.getInstance();
    expect(() => {
      audio.playMenuClick();
      audio.playJump();
      audio.playLand();
      audio.playDash();
      audio.playOrbCollect(1.0);
      audio.playOrbCollect(2.5);
      audio.playShadowWarning();
      audio.playStageIncrease();
      audio.playDeath();
    }).not.toThrow();
  });
});

describe('InputSystem (Unified Keyboard & Touch)', () => {
  let mockScene: any;
  let inputSystem: InputSystem;

  beforeEach(() => {
    // Mock minimal scene keyboard structure for headless unit testing
    mockScene = {
      input: {
        keyboard: null,
      },
    };
    inputSystem = new InputSystem(mockScene);
  });

  it('resolves touch directional inputs correctly', () => {
    // Default state: no inputs
    let state = inputSystem.getState();
    expect(state.moveX).toBe(0);
    expect(state.jumpPressed).toBe(false);
    expect(state.dashPressed).toBe(false);

    // Touch left
    inputSystem.setTouchLeft(true);
    state = inputSystem.getState();
    expect(state.moveX).toBe(-1);

    // Touch right (simultaneous left + right cancels)
    inputSystem.setTouchRight(true);
    state = inputSystem.getState();
    expect(state.moveX).toBe(0);

    // Release left
    inputSystem.setTouchLeft(false);
    state = inputSystem.getState();
    expect(state.moveX).toBe(1);

    // Release right
    inputSystem.setTouchRight(false);
    state = inputSystem.getState();
    expect(state.moveX).toBe(0);
  });

  it('fires single-frame triggers for jump, dash, and pause', () => {
    inputSystem.setTouchJump(true, true);
    inputSystem.setTouchDash(true);
    inputSystem.setTouchPause(true);

    const firstState = inputSystem.getState();
    expect(firstState.jumpPressed).toBe(true);
    expect(firstState.jumpHeld).toBe(true);
    expect(firstState.dashPressed).toBe(true);
    expect(firstState.pausePressed).toBe(true);

    // Next frame: triggers should auto-reset, but held jump persists if held
    const secondState = inputSystem.getState();
    expect(secondState.jumpPressed).toBe(false);
    expect(secondState.jumpHeld).toBe(true);
    expect(secondState.dashPressed).toBe(false);
    expect(secondState.pausePressed).toBe(false);

    // Release jump hold
    inputSystem.setTouchJump(false, false);
    const thirdState = inputSystem.getState();
    expect(thirdState.jumpHeld).toBe(false);
  });

  it('cleans up touch state on resetTouch() and destroy()', () => {
    inputSystem.setTouchLeft(true);
    inputSystem.setTouchJump(true, true);
    inputSystem.resetTouch();

    const state = inputSystem.getState();
    expect(state.moveX).toBe(0);
    expect(state.jumpPressed).toBe(false);
    expect(state.jumpHeld).toBe(false);
  });
});
