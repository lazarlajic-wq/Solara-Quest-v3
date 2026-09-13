import Phaser from "phaser";
import {
  ENEMY_AGGRO_RANGE,
  ENEMY_ATTACK_COOLDOWN_MS,
  ENEMY_ATTACK_RANGE,
  ENEMY_LEASH_RANGE,
  ENEMY_MAX_HP,
  ENEMY_MOVE_SPEED,
  ENEMY_RESPAWN_MS,
} from "../config";
import type { Damageable } from "./Damageable";

const TEXTURE_KEY = "placeholder_enemy_slime";

/**
 * The first hostile mob that can actually hurt the player — everything
 * before this (training dummies) was a punching bag. Still placeholder art
 * (a procedurally-drawn slime blob, no walk/attack animation) since no real
 * monster art exists yet — see docs/gameplay/phase-status.md.
 *
 * Simple leashed-aggro AI: idle near its spawn point, chase the player once
 * they're within ENEMY_AGGRO_RANGE, attack on cooldown once in range, and
 * give up and walk home if the player leads it more than ENEMY_LEASH_RANGE
 * from its spawn.
 */
export class Enemy extends Phaser.GameObjects.Container implements Damageable {
  private hp: number;
  private readonly maxHp = ENEMY_MAX_HP;
  private readonly spawnX: number;
  private readonly spawnY: number;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly hpBarBg: Phaser.GameObjects.Rectangle;
  private readonly hpBarFill: Phaser.GameObjects.Rectangle;
  private defeated = false;
  private attackReadyAt = 0;
  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly onDefeated: () => void,
    private readonly onAttackPlayer: () => void,
  ) {
    super(scene, x, y);
    Enemy.ensureTexture(scene);
    this.spawnX = x;
    this.spawnY = y;
    this.hp = this.maxHp;

    this.sprite = scene.add.sprite(0, 0, TEXTURE_KEY);
    this.hpBarBg = scene.add.rectangle(0, -26, 32, 5, 0x1e2430).setOrigin(0.5);
    this.hpBarFill = scene.add.rectangle(-16, -26, 32, 5, 0xd45c5c).setOrigin(0, 0.5);

    this.add([this.sprite, this.hpBarBg, this.hpBarFill]);
    this.setDepth(8);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(28, 28);
    this.body.setCollideWorldBounds(true);
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(TEXTURE_KEY)) return;
    const g = scene.add.graphics();
    g.fillStyle(0x4caf6a, 1);
    g.fillEllipse(0, 4, 30, 22);
    g.fillStyle(0x3a8a52, 1);
    g.fillEllipse(0, 10, 30, 10);
    g.fillStyle(0x102015, 1);
    g.fillCircle(-7, 0, 3);
    g.fillCircle(7, 0, 3);
    g.generateTexture(TEXTURE_KEY, 32, 32);
    g.destroy();
  }

  isAlive(): boolean {
    return !this.defeated;
  }

  override update(time: number, playerPos: { x: number; y: number }): void {
    if (this.defeated) return;

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerPos.x, playerPos.y);
    const distFromSpawn = Phaser.Math.Distance.Between(this.x, this.y, this.spawnX, this.spawnY);

    if (distToPlayer <= ENEMY_ATTACK_RANGE) {
      this.body.setVelocity(0, 0);
      if (time >= this.attackReadyAt) {
        this.attackReadyAt = time + ENEMY_ATTACK_COOLDOWN_MS;
        this.onAttackPlayer();
        this.scene.tweens.add({ targets: this.sprite, scaleX: 1.25, scaleY: 1.25, duration: 100, yoyo: true });
      }
      return;
    }

    if (distToPlayer <= ENEMY_AGGRO_RANGE && distFromSpawn <= ENEMY_LEASH_RANGE) {
      this.moveToward(playerPos.x, playerPos.y, ENEMY_MOVE_SPEED);
    } else if (distFromSpawn > 4) {
      this.moveToward(this.spawnX, this.spawnY, ENEMY_MOVE_SPEED * 0.6);
    } else {
      this.body.setVelocity(0, 0);
    }
  }

  private moveToward(x: number, y: number, speed: number): void {
    const dx = x - this.x;
    const dy = y - this.y;
    const length = Math.hypot(dx, dy) || 1;
    this.body.setVelocity((dx / length) * speed, (dy / length) * speed);
  }

  takeDamage(amount: number): void {
    if (this.defeated) return;
    this.hp = Math.max(0, this.hp - amount);
    this.hpBarFill.width = 32 * (this.hp / this.maxHp);
    this.scene.tweens.add({ targets: this.sprite, alpha: 0.4, duration: 60, yoyo: true });

    if (this.hp === 0) this.defeat();
  }

  private defeat(): void {
    this.defeated = true;
    this.body.setVelocity(0, 0);
    this.body.enable = false;
    this.setVisible(false);
    this.onDefeated();
    this.scene.time.delayedCall(ENEMY_RESPAWN_MS, () => this.respawn());
  }

  private respawn(): void {
    this.hp = this.maxHp;
    this.hpBarFill.width = 32;
    this.setPosition(this.spawnX, this.spawnY);
    this.defeated = false;
    this.body.enable = true;
    this.setVisible(true);
  }
}
