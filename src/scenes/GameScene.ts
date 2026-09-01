import Phaser from 'phaser';
import { GAME_WIDTH, COLORS, SHADOW_CONFIG } from '../game/constants';
import { Arena } from '../world/Arena';
import { Player } from '../entities/Player';
import { Shadow } from '../entities/Shadow';
import { EnergyOrb } from '../entities/EnergyOrb';
import { InputSystem } from '../systems/InputSystem';
import { RecordingSystem } from '../systems/RecordingSystem';
import { ShadowPlaybackSystem, ShadowState } from '../systems/ShadowPlaybackSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { SaveManager } from '../storage/SaveManager';
import { AudioSystem } from '../systems/AudioSystem';
import { MobileControls } from '../ui/MobileControls';
import { ParticleEffects } from '../effects/Particles';

export class GameScene extends Phaser.Scene {
  private arena!: Arena;
  private player!: Player;
  private shadows: Shadow[] = [];
  private energyOrb!: EnergyOrb;

  private inputSystem!: InputSystem;
  private mobileControls!: MobileControls;
  private recordingSystem!: RecordingSystem;
  private shadowPlaybackSystem!: ShadowPlaybackSystem;
  private spawnSystem!: SpawnSystem;
  private scoreSystem!: ScoreSystem;
  private difficultySystem!: DifficultySystem;

  private startTimeMs: number = 0;
  private elapsedTimeMs: number = 0;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private pauseTimestamp: number = 0;
  private maxActiveShadowsSeen: number = 0;

  private wasGroundedLastFrame: boolean = true;
  private warningAudioPlayed: boolean[] = [false, false, false, false, false];

  // HUD Elements
  private scoreText!: Phaser.GameObjects.Text;
  private orbsText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private shadowsIndicatorText!: Phaser.GameObjects.Text;
  private dashBarFill!: Phaser.GameObjects.Graphics;
  private dashLabel!: Phaser.GameObjects.Text;
  private bannerContainer!: Phaser.GameObjects.Container;
  private bannerText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  public create(): void {
    this.isGameOver = false;
    this.isPaused = false;
    this.elapsedTimeMs = 0;
    this.startTimeMs = this.time.now;
    this.maxActiveShadowsSeen = 0;
    this.shadows = [];
    this.warningAudioPlayed = [false, false, false, false, false];
    this.wasGroundedLastFrame = true;

    // 1. Build Arena
    this.arena = new Arena(this);

    // 2. Spawn Player
    const spawn = this.arena.getSpawnPosition();
    this.player = new Player(this, spawn.x, spawn.y);

    // 3. Initialize Systems
    this.inputSystem = new InputSystem(this);
    this.mobileControls = new MobileControls(this, this.inputSystem);
    this.recordingSystem = new RecordingSystem();
    this.shadowPlaybackSystem = new ShadowPlaybackSystem(this.recordingSystem);
    this.spawnSystem = new SpawnSystem();
    this.scoreSystem = new ScoreSystem();
    this.difficultySystem = new DifficultySystem();

    // 4. Initial Player Snapshot at T=0
    this.recordingSystem.record(0, this.player.getSnapshotData());

    // 5. Spawn Multi-Shadows (Up to 5)
    for (let i = 0; i < SHADOW_CONFIG.MAX_SHADOWS; i++) {
      const shadow = new Shadow(this, spawn.x, spawn.y, i);
      this.shadows.push(shadow);
    }

    // 6. Spawn Initial Energy Orb
    const initialOrbPos = this.spawnSystem.selectNextSpawnPoint(spawn.x, spawn.y);
    this.energyOrb = new EnergyOrb(this, initialOrbPos.x, initialOrbPos.y);

    // 7. Setup Physics & Collisions
    this.physics.add.collider(this.player, this.arena.platforms);

    // Player vs Shadows collision
    for (const shadow of this.shadows) {
      this.physics.add.overlap(
        this.player,
        shadow,
        () => this.handlePlayerShadowCollision(shadow),
        undefined,
        this
      );
    }

    // Player vs Energy Orb overlap
    this.physics.add.overlap(
      this.player,
      this.energyOrb,
      this.handleOrbCollection,
      undefined,
      this
    );

    // 8. Create HUD
    this.createHUD();

    // 9. Pause and Resume Event Listeners
    this.events.on(Phaser.Scenes.Events.PAUSE, this.handleScenePause, this);
    this.events.on(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private handleScenePause(): void {
    this.isPaused = true;
    this.pauseTimestamp = this.time.now;
    this.physics.pause();
  }

  private handleSceneResume(): void {
    if (this.isPaused) {
      const pauseDuration = this.time.now - this.pauseTimestamp;
      this.startTimeMs += pauseDuration;
      this.isPaused = false;
      this.physics.resume();
    }
  }

  private createHUD(): void {
    // Top HUD Bar Background
    const hudBar = this.add.graphics();
    hudBar.fillStyle(0x07090e, 0.82);
    hudBar.fillRect(0, 0, GAME_WIDTH, 56);
    hudBar.lineStyle(1, 0x1f2a44, 0.9);
    hudBar.lineBetween(0, 56, GAME_WIDTH, 56);
    hudBar.setDepth(100);

    // --- Left Section: Score & Orbs & Combo ---
    this.scoreText = this.add.text(24, 8, 'SCORE: 0', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
    }).setDepth(101);

    this.orbsText = this.add.text(24, 30, 'ORBS: 0', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: COLORS.TEXT_GOLD,
    }).setDepth(101);

    this.comboText = this.add.text(140, 30, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: COLORS.TEXT_GOLD,
    }).setDepth(101);

    // --- Center Section: Survival Timer & Stage ---
    this.timerText = this.add.text(GAME_WIDTH / 2, 10, 'TIME: 00:00.0', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '22px',
      fontStyle: 'bold',
      color: COLORS.TEXT_WHITE,
      align: 'center',
    }).setOrigin(0.5, 0).setDepth(101);

    // --- Right Section: Shadows Indicators & Dash Bar ---
    this.shadowsIndicatorText = this.add.text(GAME_WIDTH - 250, 8, 'SHADOWS: ○ ○ ○ ○ ○', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: COLORS.TEXT_SHADOW,
    }).setDepth(101);

    const dashX = GAME_WIDTH - 210;
    const dashY = 32;

    this.dashLabel = this.add.text(dashX - 48, dashY - 2, 'DASH', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      color: COLORS.TEXT_WHITE,
    }).setDepth(101);

    const dashBarBg = this.add.graphics().setDepth(101);
    dashBarBg.fillStyle(0x151c2e, 1);
    dashBarBg.fillRoundedRect(dashX, dashY, 140, 12, 3);
    dashBarBg.lineStyle(1, 0x24324f, 1);
    dashBarBg.strokeRoundedRect(dashX, dashY, 140, 12, 3);

    this.dashBarFill = this.add.graphics().setDepth(102);

    // --- Banner Notification Container (Center) ---
    this.bannerContainer = this.add.container(GAME_WIDTH / 2, 100).setDepth(150).setAlpha(0);
    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x0c101d, 0.9);
    bannerBg.fillRoundedRect(-200, -20, 400, 40, 6);
    bannerBg.lineStyle(2, 0xff0055, 0.8);
    bannerBg.strokeRoundedRect(-200, -20, 400, 40, 6);

    this.bannerText = this.add.text(0, 0, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.bannerContainer.add([bannerBg, this.bannerText]);
  }

  public override update(): void {
    if (this.isGameOver || this.isPaused) return;

    // 1. Process Input
    const inputState = this.inputSystem.getState();

    // Handle Pause Trigger
    if (inputState.pausePressed) {
      this.pauseGame();
      return;
    }

    this.elapsedTimeMs = this.time.now - this.startTimeMs;

    // 2. Sound & Movement Feedback Triggers
    const isGroundedNow = this.player.body.blocked.down || this.player.body.touching.down;
    if (!this.wasGroundedLastFrame && isGroundedNow) {
      AudioSystem.getInstance().playLand();
      ParticleEffects.createLandImpact(this, this.player.x, this.player.y + 19);
    }
    this.wasGroundedLastFrame = isGroundedNow;

    if (inputState.jumpPressed && isGroundedNow) {
      AudioSystem.getInstance().playJump();
    }
    if (inputState.dashPressed && this.player.getDashCooldownProgress(this.time.now) >= 1) {
      AudioSystem.getInstance().playDash();
    }

    // 3. Difficulty Progression Update
    const diff = this.difficultySystem.update(this.elapsedTimeMs);
    if (diff.stageChanged) {
      AudioSystem.getInstance().playStageIncrease();
      this.showBannerNotification(`${diff.stageName} — ${diff.targetShadowCount} SHADOWS ACTIVE`);
    }

    // 4. Update Player
    this.player.update(this.time.now, inputState);

    // 5. Record Movement Snapshot (20Hz)
    this.recordingSystem.record(this.elapsedTimeMs, this.player.getSnapshotData());

    // 6. Update Multi-Shadow Playback System
    const playbackResults = this.shadowPlaybackSystem.update(
      this.elapsedTimeMs,
      diff.targetShadowCount
    );

    let activeCount = 0;
    for (const result of playbackResults) {
      const shadow = this.shadows[result.shadowIndex];
      if (shadow) {
        // Play warning rumble sound when entering warning phase
        if (result.state === ShadowState.WARNING && !this.warningAudioPlayed[result.shadowIndex]) {
          this.warningAudioPlayed[result.shadowIndex] = true;
          AudioSystem.getInstance().playShadowWarning();
        }

        shadow.updateState(
          result.state,
          result.snapshot,
          result.spawnPosition,
          result.timeUntilSpawnMs
        );
        if (shadow.isShadowActive()) {
          activeCount++;
        }
      }
    }
    this.maxActiveShadowsSeen = Math.max(this.maxActiveShadowsSeen, activeCount);

    // 7. Update Score System
    this.scoreSystem.update(this.elapsedTimeMs);

    // 8. Update HUD Displays
    this.updateHUD(diff.targetShadowCount);
  }

  private pauseGame(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  private updateHUD(targetShadows: number): void {
    // Score & Orbs
    const stats = this.scoreSystem.getStats();
    this.scoreText.setText(`SCORE: ${stats.totalScore.toLocaleString()}`);
    this.orbsText.setText(`ORBS: ${stats.orbsCollected}`);

    // Combo Indicator
    if (stats.currentCombo > 1.0) {
      const progress = this.scoreSystem.getComboProgress(this.elapsedTimeMs);
      const pct = Math.round(progress * 100);
      const label = stats.currentCombo >= 3.0 ? `x${stats.currentCombo.toFixed(1)} MAX COMBO` : `x${stats.currentCombo.toFixed(1)} COMBO`;
      this.comboText.setText(`${label} (${pct}%)`);
      this.comboText.setColor(COLORS.TEXT_GOLD);
      this.comboText.setVisible(true);
    } else {
      this.comboText.setVisible(false);
    }

    // Formatted Time (mm:ss.t)
    const totalSeconds = this.elapsedTimeMs / 1000;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const minStr = mins.toString().padStart(2, '0');
    const secStr = secs.toFixed(1).padStart(4, '0');
    this.timerText.setText(`TIME: ${minStr}:${secStr}`);

    // Shadow Icons: ● for active, ◐ for warning/unlocked, ○ for locked
    let shadowIcons = '';
    for (let i = 0; i < SHADOW_CONFIG.MAX_SHADOWS; i++) {
      const shadow = this.shadows[i];
      if (shadow && shadow.isShadowActive()) {
        shadowIcons += '● ';
      } else if (i < targetShadows) {
        shadowIcons += '◐ ';
      } else {
        shadowIcons += '○ ';
      }
    }
    this.shadowsIndicatorText.setText(`SHADOWS: ${shadowIcons.trim()}`);

    // Dash Cooldown Bar
    const progress = this.player.getDashCooldownProgress(this.time.now);
    const dashX = GAME_WIDTH - 210;
    const dashY = 32;
    this.dashBarFill.clear();
    if (progress >= 1) {
      this.dashBarFill.fillStyle(COLORS.PLAYER_CORE, 1);
      this.dashBarFill.fillRoundedRect(dashX, dashY, 140, 12, 3);
      this.dashLabel.setColor(COLORS.TEXT_CYAN);
    } else {
      this.dashBarFill.fillStyle(0x00a8b5, 0.7);
      this.dashBarFill.fillRoundedRect(dashX, dashY, 140 * progress, 12, 3);
      this.dashLabel.setColor(COLORS.TEXT_MUTED);
    }
  }

  private handleOrbCollection(): void {
    if (this.isGameOver || this.player.getIsDead() || this.energyOrb.getIsCollected()) {
      return;
    }

    const orbX = this.energyOrb.x;
    const orbY = this.energyOrb.y;

    // Collect Orb animation & feedback
    this.energyOrb.collect();

    // Calculate score & combo
    const result = this.scoreSystem.collectOrb(this.elapsedTimeMs);

    // Audio chime
    AudioSystem.getInstance().playOrbCollect(result.comboMultiplier);

    // Floating score popup text
    this.showFloatingText(
      orbX,
      orbY - 15,
      `+${result.addedPoints}${result.comboMultiplier > 1 ? ` (x${result.comboMultiplier.toFixed(1)})` : ''}`,
      result.comboMultiplier > 1 ? COLORS.TEXT_GOLD : COLORS.TEXT_CYAN
    );

    // Reposition Orb after short animation
    this.time.delayedCall(160, () => {
      if (this.isGameOver) return;
      const nextPoint = this.spawnSystem.selectNextSpawnPoint(this.player.x, this.player.y);
      this.energyOrb.reposition(nextPoint.x, nextPoint.y);
    });
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const popup = this.add.text(x, y, text, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color,
    }).setOrigin(0.5).setDepth(120);

    this.tweens.add({
      targets: popup,
      y: y - 40,
      alpha: 0,
      scale: 1.1,
      duration: 650,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy(),
    });
  }

  private showBannerNotification(text: string): void {
    this.bannerText.setText(text);
    this.tweens.killTweensOf(this.bannerContainer);
    this.bannerContainer.setAlpha(0);
    this.bannerContainer.setScale(0.9);

    this.tweens.add({
      targets: this.bannerContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1800, () => {
          if (this.isGameOver) return;
          this.tweens.add({
            targets: this.bannerContainer,
            alpha: 0,
            duration: 300,
          });
        });
      },
    });
  }

  private handlePlayerShadowCollision(shadow: Shadow): void {
    if (this.isGameOver || !shadow.isShadowActive() || this.player.getIsDead()) {
      return;
    }

    this.isGameOver = true;

    // Death Audio & Feedback
    AudioSystem.getInstance().playDeath();
    this.cameras.main.shake(220, 0.03);
    this.player.kill();
    this.physics.pause();

    const stats = this.scoreSystem.getStats();
    const recordResult = SaveManager.recordRun(
      stats.totalScore,
      this.elapsedTimeMs,
      stats.orbsCollected
    );

    this.time.delayedCall(650, () => {
      this.scene.start('GameOverScene', {
        score: stats.totalScore,
        survivalTimeMs: this.elapsedTimeMs,
        orbs: stats.orbsCollected,
        maxCombo: stats.maxCombo,
        maxShadows: this.maxActiveShadowsSeen,
        recordResult,
      });
    });
  }

  private cleanup(): void {
    this.events.off(Phaser.Scenes.Events.PAUSE, this.handleScenePause, this);
    this.events.off(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);

    if (this.inputSystem) this.inputSystem.destroy();
    if (this.mobileControls) this.mobileControls.destroy();
    if (this.arena) this.arena.destroy();
    if (this.player) this.player.destroy();
    for (const shadow of this.shadows) {
      shadow.destroy();
    }
    this.shadows = [];
    if (this.energyOrb) this.energyOrb.destroy();
    if (this.recordingSystem) this.recordingSystem.clear();
    if (this.shadowPlaybackSystem) this.shadowPlaybackSystem.reset();
    if (this.spawnSystem) this.spawnSystem.reset();
    if (this.scoreSystem) this.scoreSystem.reset();
    if (this.difficultySystem) this.difficultySystem.reset();
  }
}
