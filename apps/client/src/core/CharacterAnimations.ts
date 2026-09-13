import type Phaser from "phaser";

/**
 * Frame layout of the placeholder "swordsman" sheet: a 10-column grid where
 * row 0 is the one consistent, style-checked pose set we currently have
 * (see AUTHORED_DIRECTIONS limitation in @solara/shared). Columns map to:
 * 0 idle, 1-4 walk cycle, 5-6 attack, 7 hit, 8-9 death.
 */
const ROW0 = {
  idle: [0],
  walk: [1, 2, 3, 4],
  attack: [5, 6],
  hit: [7],
  death: [8, 9],
};

export function createSwordsmanAnimations(anims: Phaser.Animations.AnimationManager): void {
  const key = "char_swordsman";
  const def = (name: string, frames: number[], frameRate: number, repeat: number) => {
    const animKey = `${key}_${name}`;
    if (anims.exists(animKey)) return;
    anims.create({
      key: animKey,
      frames: anims.generateFrameNumbers(key, { frames }),
      frameRate,
      repeat,
    });
  };

  def("idle", ROW0.idle, 4, -1);
  def("walk", ROW0.walk, 8, -1);
  def("attack", ROW0.attack, 10, 0);
  def("hit", ROW0.hit, 10, 0);
  def("death", ROW0.death, 6, 0);
}

export function swordsmanAnimKey(state: "idle" | "walk" | "attack" | "hit" | "death"): string {
  return `char_swordsman_${state}`;
}
