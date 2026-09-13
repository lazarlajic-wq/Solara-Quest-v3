import Phaser from "phaser";
import { normalizeMovement, vectorToDirection, type CharacterAppearance, type ClassId, type Direction } from "@solara/shared";
import { PLAYER_DASH_COOLDOWN_MS, PLAYER_DASH_DURATION_MS, PLAYER_DASH_SPEED, PLAYER_WALK_SPEED } from "../config";
import { CharacterSprite } from "./CharacterSprite";
import { InputController } from "../core/InputController";

type PlayerState = "idle" | "walk" | "dash" | "attack" | "hit" | "death";

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

  private applyAnimation(): void {
    const state = this.movementState === "walk" || this.movementState === "dash" ? "walk" : "idle";
    this.characterSprite.playState(state, this.facing);
  }
}
