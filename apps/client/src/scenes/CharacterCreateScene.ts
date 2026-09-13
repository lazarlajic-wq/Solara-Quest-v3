import Phaser from "phaser";
import { CLASS_DEFINITIONS } from "@solara/content";
import type { ClassDefinition, ClassId } from "@solara/shared";
import { GAME_HEIGHT, GAME_WIDTH, STORAGE_KEYS } from "../config";
import { characterAnimKey, createCharacterAnimations } from "../core/CharacterAnimations";

export interface SavedCharacter {
  name: string;
  classId: ClassId;
}

/**
 * Character creation (spec section 6): name entry + class selection, with a
 * live animated preview of each class's real sprite. Visual customization
 * (skin/hair/eyes/scars/…) is intentionally deferred until the modular
 * layered-character art exists — see docs/gameplay/phase-status.md. All five
 * classes are genuinely selectable and playable with their own art (see
 * docs/art-direction/CREDITS.md for the required attribution).
 */
export class CharacterCreateScene extends Phaser.Scene {
  private nameBuffer = "";
  private nameText!: Phaser.GameObjects.Text;
  private selectedClass: ClassDefinition = CLASS_DEFINITIONS[0];
  private startButton!: Phaser.GameObjects.Text;
  private classCards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super("CharacterCreate");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#12161f");

    for (const def of CLASS_DEFINITIONS) {
      createCharacterAnimations(this.anims, def.spriteSheetKey);
    }

    this.add
      .text(GAME_WIDTH / 2, 40, "SOLARA QUEST — Charaktererstellung", { fontSize: "24px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2 - 220, 100, "Name:", { fontSize: "16px", color: "#cccccc" });
    const box = this.add.rectangle(GAME_WIDTH / 2 + 10, 100, 260, 30, 0x1e2430).setOrigin(0, 0.5).setStrokeStyle(1, 0x3a4258);
    this.nameText = this.add.text(GAME_WIDTH / 2 + 20, 100, "", { fontSize: "16px", color: "#ffffff" }).setOrigin(0, 0.5);
    void box;

    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      if (event.key === "Backspace") {
        this.nameBuffer = this.nameBuffer.slice(0, -1);
      } else if (event.key.length === 1 && this.nameBuffer.length < 16 && /[a-zA-Z0-9 ]/.test(event.key)) {
        this.nameBuffer += event.key;
      }
      this.nameText.setText(this.nameBuffer + "▎");
      this.updateStartButton();
    });

    this.renderClassCards();

    this.startButton = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 50, "ABENTEUER BEGINNEN", {
        fontSize: "20px",
        color: "#666666",
        backgroundColor: "#2a3244",
        padding: { x: 24, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.tryStart());

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 12, "Charakter-Art: Universal LPC Spritesheet Generator (Liberated Pixel Cup) — siehe CREDITS.md", {
        fontSize: "10px",
        color: "#5a6478",
      })
      .setOrigin(0.5);

    this.updateStartButton();
  }

  private renderClassCards(): void {
    const startX = GAME_WIDTH / 2 - (CLASS_DEFINITIONS.length - 1) * 90;
    CLASS_DEFINITIONS.forEach((def, i) => {
      const x = startX + i * 180;
      const y = 260;
      const container = this.add.container(x, y);

      const bg = this.add.rectangle(0, 0, 150, 220, 0x1c2333).setStrokeStyle(2, 0x3a4258);
      const portrait = this.add.sprite(0, -50, def.spriteSheetKey, 0).setScale(1.2);
      portrait.play(characterAnimKey(def.spriteSheetKey, "idle", "south"));
      const name = this.add.text(0, 30, def.name, { fontSize: "16px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
      const role = this.add.text(0, 52, def.role, { fontSize: "11px", color: "#9aa4b8" }).setOrigin(0.5);
      const weapon = this.add.text(0, 90, def.weaponName, { fontSize: "10px", color: "#8bd3ff" }).setOrigin(0.5);

      container.add([bg, portrait, name, role, weapon]);
      container.setSize(150, 220);
      container.setInteractive(new Phaser.Geom.Rectangle(-75, -110, 150, 220), Phaser.Geom.Rectangle.Contains);
      container.on("pointerdown", () => this.selectClass(def, container));

      this.classCards.push(container);
      if (def.id === this.selectedClass.id) this.highlightCard(container);
    });
  }

  private selectClass(def: ClassDefinition, container: Phaser.GameObjects.Container): void {
    this.selectedClass = def;
    this.classCards.forEach((c) => (c.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x3a4258));
    this.highlightCard(container);
    this.updateStartButton();
  }

  private highlightCard(container: Phaser.GameObjects.Container): void {
    (container.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(3, 0x8bd3ff);
  }

  private updateStartButton(): void {
    const ready = this.nameBuffer.trim().length >= 2;
    this.startButton.setColor(ready ? "#ffffff" : "#666666");
  }

  private tryStart(): void {
    const name = this.nameBuffer.trim();
    if (name.length < 2) return;

    const character: SavedCharacter = { name, classId: this.selectedClass.id };
    localStorage.setItem(STORAGE_KEYS.character, JSON.stringify(character));
    this.scene.start("Town", { character });
  }
}
