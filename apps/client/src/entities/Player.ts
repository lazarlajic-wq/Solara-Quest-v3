import Phaser from "phaser";
import { normalizeMovement, vectorToDirection, type Direction } from "@solara/shared";
import type { ClassDefinition } from "@solara/shared";
import { PLAYER_DASH_COOLDOWN_MS, PLAYER_DASH_DURATION_MS, PLAYER_DASH_SPEED, PLAYER_WALK_SPEED } from "../config";
import { characterAnimKey } from "../core/CharacterAnimations";
import { InputController } from "../core/InputController";

type PlayerState = "idle" | "walk" | "dash" | "attack" | "hit" | "death";

export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly classDefinition: ClassDefinition;
  facing: Direction = "south";

  private movementState: PlayerState = "idle";
  private dashingUntil = 0;
  private dashReadyAt = 0;
  private dashVector = { x: 0, y: 1 };

  constructor(scene: Phaser.Scene, x: number, y: number, classDefinition: ClassDefinition) {
    super(scene, x, y, classDefinition.spriteSheetKey, 0);
    this.classDefinition = classDefinition;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setSize(48, 40);
    this.setOffset(40, 80);
    this.setDepth(10);
    this.play(characterAnimKey(classDefinition.spriteSheetKey, "idle", "south"));
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
      this.setVelocity(this.dashVector.x * PLAYER_DASH_SPEED, this.dashVector.y * PLAYER_DASH_SPEED);
      if (now >= this.dashingUntil) this.movementState = moving ? "walk" : "idle";
    } else if (moving) {
      const n = normalizeMovement(raw);
      this.setVelocity(n.x * PLAYER_WALK_SPEED, n.y * PLAYER_WALK_SPEED);
      this.dashVector = n;
      this.movementState = "walk";
    } else {
      this.setVelocity(0, 0);
      this.movementState = "idle";
    }

    this.applyAnimation();
  }

  private applyAnimation(): void {
    const state = this.movementState === "walk" || this.movementState === "dash" ? "walk" : "idle";
    const key = characterAnimKey(this.classDefinition.spriteSheetKey, state, this.facing);
    if (this.anims.currentAnim?.key !== key) this.play(key);
  }
}
