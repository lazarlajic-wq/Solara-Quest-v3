import Phaser from "phaser";
import { normalizeMovement, resolveDirectionFallback, vectorToDirection, type Direction } from "@solara/shared";
import type { ClassDefinition } from "@solara/shared";
import { PLAYER_DASH_COOLDOWN_MS, PLAYER_DASH_DURATION_MS, PLAYER_DASH_SPEED, PLAYER_WALK_SPEED } from "../config";
import { swordsmanAnimKey } from "../core/CharacterAnimations";
import { InputController } from "../core/InputController";

type PlayerState = "idle" | "walk" | "dash" | "attack" | "hit" | "death";

const PLACEHOLDER_TINTS: Partial<Record<ClassDefinition["id"], number>> = {
  tank: 0x9db4d4,
  mage: 0xb98bff,
  archer: 0x8bffa8,
  assassin: 0xff8b8b,
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly classDefinition: ClassDefinition;
  facing: Direction = "south";

  private movementState: PlayerState = "idle";
  private dashingUntil = 0;
  private dashReadyAt = 0;
  private dashVector = { x: 0, y: 1 };

  constructor(scene: Phaser.Scene, x: number, y: number, classDefinition: ClassDefinition) {
    // Only the swordsman has a real, style-checked sprite sheet right now
    // (see AUTHORED_DIRECTIONS limitation). Other classes reuse that sheet
    // tinted by class as a documented placeholder — see
    // docs/gameplay/phase-status.md, Phase 2.
    const hasArt = scene.textures.exists(classDefinition.spriteSheetKey);
    super(scene, x, y, hasArt ? classDefinition.spriteSheetKey : "char_swordsman", 0);
    this.classDefinition = classDefinition;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (!hasArt) {
      this.setTint(PLACEHOLDER_TINTS[classDefinition.id] ?? 0xffffff);
    }

    this.setCollideWorldBounds(true);
    this.setSize(48, 40);
    this.setOffset(40, 80);
    this.setDepth(10);
    this.play(swordsmanAnimKey("idle"));
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

    this.applyFacing();
    this.applyAnimation();
  }

  private applyFacing(): void {
    const { flipX } = resolveDirectionFallback(this.facing);
    this.setFlipX(flipX);
  }

  private applyAnimation(): void {
    const key = this.movementState === "walk" || this.movementState === "dash" ? swordsmanAnimKey("walk") : swordsmanAnimKey("idle");
    if (this.anims.currentAnim?.key !== key) this.play(key);
  }
}
