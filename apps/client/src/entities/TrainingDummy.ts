import Phaser from "phaser";
import { DUMMY_MAX_HP, DUMMY_RESPAWN_MS } from "../config";

const TEXTURE_KEY = "placeholder_training_dummy";

/**
 * A stationary practice target for the Phase 3 first combat slice. Real
 * enemy art doesn't exist yet (docs/gameplay/phase-status.md) — this is a
 * deliberately obvious placeholder (a straw target on a post) rather than a
 * disguised reused asset, so it reads honestly as "not final art" in-game.
 */
export class TrainingDummy extends Phaser.GameObjects.Container {
  private hp: number;
  private readonly maxHp: number;
  private readonly hpBarBg: Phaser.GameObjects.Rectangle;
  private readonly hpBarFill: Phaser.GameObjects.Rectangle;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private defeated = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly onDefeated: () => void,
  ) {
    super(scene, x, y);
    TrainingDummy.ensureTexture(scene);

    this.maxHp = DUMMY_MAX_HP;
    this.hp = this.maxHp;

    this.sprite = scene.add.sprite(0, 0, TEXTURE_KEY);
    this.hpBarBg = scene.add.rectangle(0, -44, 40, 5, 0x1e2430).setOrigin(0.5);
    this.hpBarFill = scene.add.rectangle(-20, -44, 40, 5, 0xd45c5c).setOrigin(0, 0.5);

    this.add([this.sprite, this.hpBarBg, this.hpBarFill]);
    this.setDepth(8);
    scene.add.existing(this);
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(TEXTURE_KEY)) return;
    const g = scene.add.graphics();
    g.fillStyle(0x8a5a34, 1);
    g.fillRect(-6, 0, 12, 40);
    g.fillStyle(0xd9c08a, 1);
    g.fillCircle(0, -20, 18);
    g.lineStyle(3, 0xb4443a, 1);
    g.strokeCircle(0, -20, 12);
    g.strokeCircle(0, -20, 5);
    g.generateTexture(TEXTURE_KEY, 48, 64);
    g.destroy();
  }

  isAlive(): boolean {
    return !this.defeated;
  }

  takeDamage(amount: number): void {
    if (this.defeated) return;
    this.hp = Math.max(0, this.hp - amount);
    this.hpBarFill.width = 40 * (this.hp / this.maxHp);
    this.scene.tweens.add({ targets: this.sprite, alpha: 0.4, duration: 60, yoyo: true });

    if (this.hp === 0) this.defeat();
  }

  private defeat(): void {
    this.defeated = true;
    this.setVisible(false);
    this.onDefeated();
    this.scene.time.delayedCall(DUMMY_RESPAWN_MS, () => this.respawn());
  }

  private respawn(): void {
    this.hp = this.maxHp;
    this.hpBarFill.width = 40;
    this.defeated = false;
    this.setVisible(true);
  }
}
