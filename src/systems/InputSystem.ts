import type Phaser from 'phaser';

export interface InputState {
  moveX: number;
  jumpPressed: boolean;
  jumpHeld: boolean;
  dashPressed: boolean;
  pausePressed: boolean;
}

export class InputSystem {
  private scene: Phaser.Scene;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;
  private keyW?: Phaser.Input.Keyboard.Key;
  private keySpace?: Phaser.Input.Keyboard.Key;
  private keyShift?: Phaser.Input.Keyboard.Key;
  private keyP?: Phaser.Input.Keyboard.Key;
  private keyEsc?: Phaser.Input.Keyboard.Key;

  // Virtual touch input states
  private touchLeft: boolean = false;
  private touchRight: boolean = false;
  private touchJumpPressed: boolean = false;
  private touchJumpHeld: boolean = false;
  private touchDashPressed: boolean = false;
  private touchPausePressed: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initKeys();
  }

  private initKeys(): void {
    if (!this.scene.input || !this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keyA = this.scene.input.keyboard.addKey('A');
    this.keyD = this.scene.input.keyboard.addKey('D');
    this.keyW = this.scene.input.keyboard.addKey('W');
    this.keySpace = this.scene.input.keyboard.addKey('SPACE');
    this.keyShift = this.scene.input.keyboard.addKey('SHIFT');
    this.keyP = this.scene.input.keyboard.addKey('P');
    this.keyEsc = this.scene.input.keyboard.addKey('ESC');
  }

  public setTouchLeft(down: boolean): void {
    this.touchLeft = down;
  }

  public setTouchRight(down: boolean): void {
    this.touchRight = down;
  }

  public setTouchJump(pressed: boolean, held: boolean): void {
    if (pressed) this.touchJumpPressed = true;
    this.touchJumpHeld = held;
  }

  public setTouchDash(pressed: boolean): void {
    if (pressed) this.touchDashPressed = true;
  }

  public setTouchPause(pressed: boolean): void {
    if (pressed) this.touchPausePressed = true;
  }

  private checkJustDown(key?: Phaser.Input.Keyboard.Key): boolean {
    if (!key) return false;
    const phaserGlobal = (globalThis as unknown as { Phaser?: { Input?: { Keyboard?: { JustDown?: (k: Phaser.Input.Keyboard.Key) => boolean } } } }).Phaser;
    if (phaserGlobal?.Input?.Keyboard?.JustDown) {
      return phaserGlobal.Input.Keyboard.JustDown(key);
    }
    if (key.repeats === 0 && key.isDown) {
      key.repeats = 1;
      return true;
    }
    return false;
  }

  public getState(): InputState {
    const hasKeyboard = Boolean(this.scene.input?.keyboard);

    let keyLeft = false;
    let keyRight = false;
    let keyJumpJust = false;
    let keyJumpDown = false;
    let keyDashJust = false;
    let keyPauseJust = false;

    if (hasKeyboard && this.cursors) {
      keyLeft = Boolean(this.cursors.left?.isDown || this.keyA?.isDown);
      keyRight = Boolean(this.cursors.right?.isDown || this.keyD?.isDown);
      keyJumpJust = this.checkJustDown(this.cursors.up) ||
                    this.checkJustDown(this.keyW) ||
                    this.checkJustDown(this.keySpace);
      keyJumpDown = Boolean(this.cursors.up?.isDown || this.keyW?.isDown || this.keySpace?.isDown);
      keyDashJust = this.checkJustDown(this.cursors.shift) ||
                    this.checkJustDown(this.keyShift);
      keyPauseJust = this.checkJustDown(this.keyP) ||
                     this.checkJustDown(this.keyEsc);
    }

    const isLeft = keyLeft || this.touchLeft;
    const isRight = keyRight || this.touchRight;

    let moveX = 0;
    if (isLeft && !isRight) moveX = -1;
    else if (isRight && !isLeft) moveX = 1;

    const jumpPressed = keyJumpJust || this.touchJumpPressed;
    const jumpHeld = keyJumpDown || this.touchJumpHeld;
    const dashPressed = keyDashJust || this.touchDashPressed;
    const pausePressed = keyPauseJust || this.touchPausePressed;

    // Reset single-frame touch triggers
    this.touchJumpPressed = false;
    this.touchDashPressed = false;
    this.touchPausePressed = false;

    return {
      moveX,
      jumpPressed,
      jumpHeld,
      dashPressed,
      pausePressed,
    };
  }

  public resetTouch(): void {
    this.touchLeft = false;
    this.touchRight = false;
    this.touchJumpPressed = false;
    this.touchJumpHeld = false;
    this.touchDashPressed = false;
    this.touchPausePressed = false;
  }

  public destroy(): void {
    this.resetTouch();
  }
}
