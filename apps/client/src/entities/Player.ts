import Phaser from "phaser";
import { normalizeMovement, vectorToDirection, type CharacterAppearance, type ClassId, type Direction, type Vector2 } from "@solara/shared";
import {
  PLAYER_ATTACK_COOLDOWN_MS,
  PLAYER_ATTACK_RANGE,
  PLAYER_DASH_COOLDOWN_MS,
  PLAYER_DASH_DURATION_MS,
  PLAYER_DASH_SPEED,
  PLAYER_WALK_SPEED,
} from "../config";
import { CharacterSprite } from "./CharacterSprite";
import { InputController } from "../core/InputController";

type PlayerState = "idle" | "walk" | "dash" | "attack" | "hit" | "death";

export const DIRECTION_VECTORS: Record<Direction, Vector2> = {
  north: { x: 0, y: -1 },
  northeast: { x: 0.707, y: -0.707 },
  east: { x: 1, y: 0 },
  southeast: { x: 0.707, y: 0.707 },
  south: { x: 0, y: 1 },
  southwest: { x: -0.707, y: 0.707 },
  west: { x: -1, y: 0 },
  northwest: { x: -0.707, y: -0.707 },
};

export class Player extends Phaser.GameObjects.Container {
  readonly appearance: CharacterAppearance;
  classId: ClassId | null;
  facing: Direction = "south";
  declare body: Phaser.Physics.Arcade.Body;

  private readonly characterSprite: CharacterSprite;
  private movementState: PlayerState = "idle";
  private dashingUntil = 0;
  private dashReadyAt = 0;
  private dashVector = { x: 0, y: 1 };
  private attackReadyAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, appearance: CharacterAppearance, classId: ClassId | null) {
    super(scene, x, y);
    this.appearance = appearance;
    this.classId = classId;

    this.characterSprite = new CharacterSprite(scene, 0, 0, appearance, classId);
    this.add(this.characterSprite);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(48, 40);
    this.body.setOffset(40, 80);
    this.body.setCollideWorldBounds(true);
    this.setDepth(10);
    this.characterSprite.playState("idle", "south");
  }

  /** Applies a class's equipment look once chosen (see CLASS_UNLOCK_LEVEL). */
  setClass(classId: ClassId): void {
    this.classId = classId;
    this.characterSprite.setClass(classId);
  }

  override update(input: InputController, time: number): void {
    if (this.movementState === "death") return;

    const now = time;
    const raw = input.getMovementVector();
    const moving = raw.x !== 0 || raw.y !== 0;

    if (moving) {
      const dir = vectorToDirection(raw);
      if (dir) this.facing = dir;
    }

    if (this.movementState !== "dash" && input.isDashPressed() && now >= this.dashReadyAt) {
      this.movementState = "dash";
      this.dashingUntil = now + PLAYER_DASH_DURATION_MS;
      this.dashReadyAt = now + PLAYER_DASH_COOLDOWN_MS;
      this.dashVector = moving ? normalizeMovement(raw) : this.dashVector;
    }

    if (this.movementState === "dash") {
      this.body.setVelocity(this.dashVector.x * PLAYER_DASH_SPEED, this.dashVector.y * PLAYER_DASH_SPEED);
      if (now >= this.dashingUntil) this.movementState = moving ? "walk" : "idle";
    } else if (moving) {
      const n = normalizeMovement(raw);
      this.body.setVelocity(n.x * PLAYER_WALK_SPEED, n.y * PLAYER_WALK_SPEED);
      this.dashVector = n;
      this.movementState = "walk";
    } else {
      this.body.setVelocity(0, 0);
      this.movementState = "idle";
    }

    this.applyAnimation();
  }

  /**
   * Returns the world-space point of a melee swing in front of the player if
   * the attack cooldown allows it (and starts the cooldown + visual
   * feedback), or null if still on cooldown. The scene resolves the actual
   * hit against nearby damageable entities.
   */
  attemptAttack(time: number): Vector2 | null {
    if (time < this.attackReadyAt) return null;
    this.attackReadyAt = time + PLAYER_ATTACK_COOLDOWN_MS;

    this.scene.tweens.add({ targets: this.characterSprite, scaleX: 1.15, scaleY: 1.15, duration: 80, yoyo: true });

    const dir = DIRECTION_VECTORS[this.facing];
    return { x: this.x + dir.x * PLAYER_ATTACK_RANGE, y: this.y + dir.y * PLAYER_ATTACK_RANGE };
  }

  /** World-space point a `range` in front of the player, for a "strike"-type skill's hit check. */
  aimPoint(range: number): Vector2 {
    const dir = DIRECTION_VECTORS[this.facing];
    return { x: this.x + dir.x * range, y: this.y + dir.y * range };
  }

  /** Shared visual feedback for casting a skill (nova/heal have no aim point of their own to pulse on). */
  playSkillCastFeedback(): void {
    this.scene.tweens.add({ targets: this.characterSprite, scaleX: 1.2, scaleY: 1.2, duration: 110, yoyo: true });
  }

  private applyAnimation(): void {
    const state = this.movementState === "walk" || this.movementState === "dash" ? "walk" : "idle";
    this.characterSprite.playState(state, this.facing);
  }
}
