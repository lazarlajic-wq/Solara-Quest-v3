import Phaser from "phaser";
import type { CharacterAppearance, ClassId, Direction } from "@solara/shared";
import {
  baseLayerKey,
  beardLayerKey,
  classOutfitLayerKey,
  hairLayerKey,
  starterOutfitLayerKey,
} from "../core/CharacterLayers";
import { characterAnimKey, createCharacterAnimations } from "../core/CharacterAnimations";

export type MovementAnimState = "idle" | "walk";

/**
 * Composites a player's designed appearance from stacked LPC layers (body,
 * hair, beard, outfit) that all share the same 128px frame grid, so any
 * combination lines up without per-combination baking. Below
 * CLASS_UNLOCK_LEVEL every character wears the same neutral leather starter
 * outfit; classOutfitLayerKey swaps in the class-specific equipment layer
 * once a class is chosen, without touching body/hair/face.
 *
 * Draw order (back to front): body -> beard -> hair -> outfit. Hair is drawn
 * over the beard so long hairstyles don't get clipped by jaw-level beard art.
 */
export class CharacterSprite extends Phaser.GameObjects.Container {
  private readonly bodyLayer: Phaser.GameObjects.Sprite;
  private readonly beardLayer: Phaser.GameObjects.Sprite | null;
  private readonly hairLayer: Phaser.GameObjects.Sprite;
  private readonly outfitLayer: Phaser.GameObjects.Sprite;
  private readonly layers: Phaser.GameObjects.Sprite[];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private appearance: CharacterAppearance,
    private classId: ClassId | null,
  ) {
    super(scene, x, y);

    for (const key of CharacterSprite.textureKeysFor(appearance, classId)) {
      createCharacterAnimations(scene.anims, key);
    }

    this.bodyLayer = scene.add.sprite(0, 0, baseLayerKey(appearance.gender, appearance.skinTone, appearance.eyeColor), 0);
    this.beardLayer =
      appearance.beardStyle === "none"
        ? null
        : scene.add.sprite(0, 0, beardLayerKey(appearance.beardStyle, appearance.beardColor), 0);
    this.hairLayer = scene.add.sprite(0, 0, hairLayerKey(appearance.hairStyle, appearance.hairColor), 0);
    this.outfitLayer = scene.add.sprite(0, 0, CharacterSprite.outfitKey(appearance.gender, classId), 0);

    this.layers = [this.bodyLayer, this.beardLayer, this.hairLayer, this.outfitLayer].filter(
      (l): l is Phaser.GameObjects.Sprite => l !== null,
    );
    this.add(this.layers);
    scene.add.existing(this);

    this.playState("idle", "south");
  }

  private static outfitKey(gender: CharacterAppearance["gender"], classId: ClassId | null): string {
    return classId ? classOutfitLayerKey(classId) : starterOutfitLayerKey(gender);
  }

  private static textureKeysFor(appearance: CharacterAppearance, classId: ClassId | null): string[] {
    const keys = [
      baseLayerKey(appearance.gender, appearance.skinTone, appearance.eyeColor),
      hairLayerKey(appearance.hairStyle, appearance.hairColor),
      CharacterSprite.outfitKey(appearance.gender, classId),
    ];
    if (appearance.beardStyle !== "none") keys.push(beardLayerKey(appearance.beardStyle, appearance.beardColor));
    return keys;
  }

  get currentClassId(): ClassId | null {
    return this.classId;
  }

  get currentAppearance(): CharacterAppearance {
    return this.appearance;
  }

  /** Swaps in a class's equipment layer (called once the class is chosen at CLASS_UNLOCK_LEVEL). */
  setClass(classId: ClassId): void {
    this.classId = classId;
    const key = classOutfitLayerKey(classId);
    createCharacterAnimations(this.scene.anims, key);
    this.outfitLayer.setTexture(key, 0);
    const current = this.outfitLayer.anims.currentAnim;
    if (current) this.outfitLayer.play(current.key);
  }

  playState(state: MovementAnimState, direction: Direction): void {
    for (const layer of this.layers) {
      const key = characterAnimKey(layer.texture.key, state, direction);
      if (layer.anims.currentAnim?.key !== key) layer.play(key);
    }
  }
}
