import Phaser from "phaser";
import type { SkillDefinition } from "@solara/shared";
import { SKILL_BAR_SLOT_COUNT } from "../config";

const SLOT_SIZE = 46;
const SLOT_GAP = 6;

interface SlotView {
  bg: Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image;
  cooldownOverlay: Phaser.GameObjects.Rectangle;
  keyLabel: Phaser.GameObjects.Text;
  skill: SkillDefinition | null;
}

/**
 * The spec's 1-9 skill bar. First slice: only slots 1-3 ever hold a real
 * skill (one class's three active skills, see packages/content/src/skills.ts)
 * — slots 4-9 render as empty placeholders so the full bar is visible without
 * pretending more is unlocked than actually is (docs/gameplay/phase-status.md).
 */
export class SkillBar {
  private readonly slots: SlotView[] = [];

  constructor(scene: Phaser.Scene) {
    const totalWidth = SKILL_BAR_SLOT_COUNT * SLOT_SIZE + (SKILL_BAR_SLOT_COUNT - 1) * SLOT_GAP;
    const startX = scene.scale.width / 2 - totalWidth / 2 + SLOT_SIZE / 2;
    const y = scene.scale.height - 40;

    for (let i = 0; i < SKILL_BAR_SLOT_COUNT; i++) {
      const x = startX + i * (SLOT_SIZE + SLOT_GAP);
      const bg = scene.add
        .rectangle(x, y, SLOT_SIZE, SLOT_SIZE, 0x000000, 0.55)
        .setStrokeStyle(2, 0x3a4258)
        .setScrollFactor(0)
        .setDepth(900);
      const icon = scene.add.image(x, y, "icon_heart").setScrollFactor(0).setDepth(901).setDisplaySize(34, 34).setVisible(false);
      const cooldownOverlay = scene.add
        .rectangle(x, y, SLOT_SIZE, 0, 0x000000, 0.75)
        .setOrigin(0.5, 1)
        .setScrollFactor(0)
        .setDepth(902)
        .setVisible(false);
      const keyLabel = scene.add
        .text(x + SLOT_SIZE / 2 - 3, y + SLOT_SIZE / 2 - 3, String(i + 1), { fontSize: "10px", color: "#9aa4b8" })
        .setOrigin(1, 1)
        .setScrollFactor(0)
        .setDepth(903);

      this.slots.push({ bg, icon, cooldownOverlay, keyLabel, skill: null });
    }
  }

  /** Called once when the player's class (and its skills) becomes known. */
  setSkills(skills: SkillDefinition[]): void {
    for (const slot of this.slots) {
      slot.skill = null;
      slot.icon.setVisible(false);
    }
    for (const skill of skills) {
      const slot = this.slots[skill.barSlot - 1];
      if (!slot) continue;
      slot.skill = skill;
      // setDisplaySize computes scale from the CURRENT texture's frame size,
      // so it must be re-applied after setTexture swaps in the real
      // (much larger) icon — otherwise the icon renders at native size.
      slot.icon.setTexture(skill.iconKey).setDisplaySize(34, 34).setVisible(true);
    }
  }

  /** `readyAt` and `resource` let each slot show its own cooldown wipe and afford/can't-afford dimming. */
  update(time: number, resource: number, readyAtBySkillId: ReadonlyMap<string, number>): void {
    for (const slot of this.slots) {
      if (!slot.skill) continue;
      const readyAt = readyAtBySkillId.get(slot.skill.id) ?? 0;
      const remaining = Math.max(0, readyAt - time);
      const ratio = Phaser.Math.Clamp(remaining / slot.skill.cooldownMs, 0, 1);
      slot.cooldownOverlay.setVisible(ratio > 0);
      slot.cooldownOverlay.height = SLOT_SIZE * ratio;

      const affordable = resource >= slot.skill.resourceCost;
      slot.icon.setAlpha(affordable ? 1 : 0.35);
    }
  }
}
