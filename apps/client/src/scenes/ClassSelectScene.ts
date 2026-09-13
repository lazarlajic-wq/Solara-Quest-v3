import Phaser from "phaser";
import { CLASS_DEFINITIONS } from "@solara/content";
import type { ClassDefinition } from "@solara/shared";
import { GAME_HEIGHT, GAME_WIDTH, STORAGE_KEYS } from "../config";
import { CharacterSprite } from "../entities/CharacterSprite";
import type { SavedCharacter } from "./CharacterCreateScene";

/**
 * Reached once CLASS_UNLOCK_LEVEL is hit (see TownScene's NPC interaction).
 * Shows the player's own designed appearance wearing each class's generated
 * outfit layer, so choosing a class doesn't discard the character they built
 * at creation — only the equipment layer changes (spec section 6/7).
 */
export class ClassSelectScene extends Phaser.Scene {
  private character!: SavedCharacter;
  private cards: Phaser.GameObjects.Container[] = [];
  private selected: ClassDefinition = CLASS_DEFINITIONS[0];

  constructor() {
    super("ClassSelect");
  }

  create(data: { character: SavedCharacter }): void {
    this.character = data.character;
    this.cameras.main.setBackgroundColor("#12161f");

    this.add
      .text(GAME_WIDTH / 2, 36, "Wähle deine Klasse", { fontSize: "24px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 64, "Deine Ausrüstung ändert sich — dein Charakter bleibt derselbe.", {
        fontSize: "13px",
        color: "#9aa4b8",
      })
      .setOrigin(0.5);

    this.renderCards();

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 50, "KLASSE BESTÄTIGEN", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#2a3244",
        padding: { x: 24, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.confirm());
  }

  private renderCards(): void {
    const startX = GAME_WIDTH / 2 - (CLASS_DEFINITIONS.length - 1) * 90;
    CLASS_DEFINITIONS.forEach((def, i) => {
      const x = startX + i * 180;
      const y = 260;
      const container = this.add.container(x, y);

      const bg = this.add.rectangle(0, 0, 150, 220, 0x1c2333).setStrokeStyle(2, 0x3a4258);
      const portrait = new CharacterSprite(this, 0, -40, this.character.appearance, def.id);
      portrait.setScale(1.1);
      const name = this.add.text(0, 40, def.name, { fontSize: "16px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
      const role = this.add.text(0, 62, def.role, { fontSize: "11px", color: "#9aa4b8" }).setOrigin(0.5);
      const weapon = this.add.text(0, 90, def.weaponName, { fontSize: "10px", color: "#8bd3ff" }).setOrigin(0.5);

      container.add([bg, portrait, name, role, weapon]);
      container.setSize(150, 220);
      container.setInteractive(new Phaser.Geom.Rectangle(-75, -110, 150, 220), Phaser.Geom.Rectangle.Contains);
      container.on("pointerdown", () => this.select(def, container));

      this.cards.push(container);
      if (def.id === this.selected.id) this.highlight(container);
    });
  }

  private select(def: ClassDefinition, container: Phaser.GameObjects.Container): void {
    this.selected = def;
    this.cards.forEach((c) => (c.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x3a4258));
    this.highlight(container);
  }

  private highlight(container: Phaser.GameObjects.Container): void {
    (container.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(3, 0x8bd3ff);
  }

  private confirm(): void {
    const character: SavedCharacter = { ...this.character, classId: this.selected.id };
    localStorage.setItem(STORAGE_KEYS.character, JSON.stringify(character));
    this.scene.start("Town", { character });
  }
}
