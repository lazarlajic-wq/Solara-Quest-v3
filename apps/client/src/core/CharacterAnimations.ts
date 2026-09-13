import type Phaser from "phaser";
import { resolveDirectionFallback, type Direction } from "@solara/shared";

/**
 * Frame layout shared by every character sheet (spec: same dimensions/frame
 * order across classes so they're drop-in interchangeable). Each is an
 * 8-column x 4-row grid of 128x128 frames, composed with the Universal LPC
 * Spritesheet Generator: row 0 south, row 1 north, row 2 east, row 3 west,
 * 8-frame walk cycle per row. See docs/art-direction/CREDITS.md.
 */
const DIRECTIONAL_ROW: Record<"south" | "north" | "east" | "west", number> = {
  south: 0,
  north: 1,
  east: 2,
  west: 3,
};

/** Registers idle/walk animations for one character layer texture key (e.g. "layer_base_male_light_brown"). */
export function createCharacterAnimations(anims: Phaser.Animations.AnimationManager, textureKey: string): void {
  const def = (animKey: string, frames: number[], frameRate: number, repeat: number) => {
    if (anims.exists(animKey)) return;
    anims.create({
      key: animKey,
      frames: anims.generateFrameNumbers(textureKey, { frames }),
      frameRate,
      repeat,
    });
  };

  for (const [direction, row] of Object.entries(DIRECTIONAL_ROW) as [keyof typeof DIRECTIONAL_ROW, number][]) {
    const base = row * 8;
    const walkFrames = Array.from({ length: 8 }, (_, i) => base + i);
    def(characterAnimKey(textureKey, "idle", direction), [base], 4, -1);
    def(characterAnimKey(textureKey, "walk", direction), walkFrames, 10, -1);
  }
}

export function characterAnimKey(textureKey: string, state: "idle" | "walk", direction: Direction): string {
  const { authored } = resolveDirectionFallback(direction);
  return `${textureKey}_${state}_${authored}`;
}
