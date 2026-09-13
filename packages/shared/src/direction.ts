/**
 * The eight compass directions every character, NPC, enemy and piece of
 * visible equipment must be able to face and animate in.
 */
export const DIRECTIONS = [
  "north",
  "northeast",
  "east",
  "southeast",
  "south",
  "southwest",
  "west",
  "northwest",
] as const;

export type Direction = (typeof DIRECTIONS)[number];

export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Maps an arbitrary movement vector to the nearest of the 8 compass
 * directions. Screen space: +x = east, +y = south.
 */
export function vectorToDirection(vector: Vector2): Direction | null {
  const { x, y } = vector;
  if (x === 0 && y === 0) return null;

  const angle = Math.atan2(y, x); // -PI..PI, 0 = east
  const sector = Math.round(angle / (Math.PI / 4)); // -4..4, one of 8 sectors
  const table: Record<number, Direction> = {
    0: "east",
    1: "southeast",
    2: "south",
    3: "southwest",
    4: "west",
    [-4]: "west",
    [-3]: "northwest",
    [-2]: "north",
    [-1]: "northeast",
  };
  return table[sector] ?? "south";
}

/**
 * Normalizes a raw input axis (-1, 0, 1 per axis) so that diagonal movement
 * covers the same distance per second as cardinal movement.
 */
export function normalizeMovement(vector: Vector2): Vector2 {
  const length = Math.hypot(vector.x, vector.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
}

/**
 * Directions that currently ship with a fully authored, style-checked sprite.
 * Everything else falls back through {@link resolveDirectionFallback}.
 *
 * KNOWN LIMITATION (tracked here on purpose, not hidden in code): the only
 * reference sprite sheet available right now (the "warrior-topdown" set)
 * was generated as one consistent character across a single facing only —
 * every other row in that sheet drifts in hairstyle/color between rows, so
 * it fails the "Animationskonsistenz" QA gate in
 * docs/art-direction/style-guide.md and cannot be used as real north/east/west
 * art. Until a proper 8-direction, style-checked set is generated, every
 * direction resolves to this single authored "south" pose, mirrored on the
 * X axis for anything facing generally left. See
 * docs/gameplay/phase-status.md, Phase 2.
 */
export const AUTHORED_DIRECTIONS: readonly Direction[] = ["south"] as const;

/**
 * Resolves a requested direction to an authored one. See the limitation
 * documented on {@link AUTHORED_DIRECTIONS}: everything currently maps to
 * "south", mirrored via flipX for directions with a westward component.
 */
export function resolveDirectionFallback(direction: Direction): {
  authored: Direction;
  flipX: boolean;
} {
  const flipX = direction === "west" || direction === "northwest" || direction === "southwest";
  return { authored: "south", flipX };
}
