import Phaser from "phaser";
import type {
  BeardStyle,
  CharacterAppearance,
  ClassId,
  EyeColor,
  Gender,
  HairColor,
  HairStyle,
  SkinTone,
} from "@solara/shared";
import { GAME_HEIGHT, GAME_WIDTH, STORAGE_KEYS } from "../config";
import {
  AVAILABLE_BEARD_STYLES,
  AVAILABLE_EYE_COLORS,
  AVAILABLE_HAIR_COLORS,
  AVAILABLE_HAIR_STYLES,
  AVAILABLE_SKIN_TONES,
} from "../core/CharacterLayers";
import { CharacterSprite } from "../entities/CharacterSprite";

export interface SavedCharacter {
  name: string;
  appearance: CharacterAppearance;
  /** null until CLASS_UNLOCK_LEVEL is reached and a class is chosen — see ClassSelectScene. */
  classId: ClassId | null;
}

const GENDERS: Gender[] = ["male", "female"];

const GENDER_LABELS: Record<Gender, string> = { male: "Männlich", female: "Weiblich" };
const SKIN_LABELS: Record<SkinTone, string> = { light: "Hell", brown: "Dunkel" };
const EYE_LABELS: Record<EyeColor, string> = { brown: "Braun", blue: "Blau" };
const HAIR_STYLE_LABELS: Record<HairStyle, string> = { plain: "Kurz", ponytail: "Zopf" };
const HAIR_COLOR_LABELS: Record<HairColor, string> = { black: "Schwarz", dark_brown: "Dunkelbraun" };
const BEARD_STYLE_LABELS: Record<BeardStyle, string> = { none: "Kein Bart", trimmed: "Gestutzt" };

interface AttributeRow<T extends string> {
  label: string;
  options: readonly T[];
  labels: Record<string, string>;
  get: () => T;
  set: (value: T) => void;
  /** Row is hidden entirely when this returns false (e.g. beard color needs a beard). */
  visible?: () => boolean;
}

/**
 * Character creation (spec section 6): the player designs body, hair, beard,
 * and eye color themselves via the layered LPC art (see CharacterLayers.ts).
 * No class is chosen here — everyone starts in the same neutral leather
 * outfit and picks a class (and its equipment look) once CLASS_UNLOCK_LEVEL
 * is reached, via ClassSelectScene. Only a curated subset of LPC's options
 * is wired up so far; see docs/art-direction/style-guide.md to add more.
 */
export class CharacterCreateScene extends Phaser.Scene {
  private nameBuffer = "";
  private nameText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private preview: CharacterSprite | null = null;
  private rowTexts: Phaser.GameObjects.Text[] = [];

  private appearance: CharacterAppearance = {
    gender: "male",
    skinTone: "light",
    eyeColor: "brown",
    hairStyle: "plain",
    hairColor: "black",
    beardStyle: "none",
    beardColor: "black",
  };

  constructor() {
    super("CharacterCreate");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#12161f");

    this.add
      .text(GAME_WIDTH / 2, 32, "SOLARA QUEST — Charaktererstellung", { fontSize: "22px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2 - 300, 78, "Name:", { fontSize: "16px", color: "#cccccc" });
    const box = this.add.rectangle(GAME_WIDTH / 2 - 230, 78, 260, 30, 0x1e2430).setOrigin(0, 0.5).setStrokeStyle(1, 0x3a4258);
    this.nameText = this.add.text(GAME_WIDTH / 2 - 220, 78, "", { fontSize: "16px", color: "#ffffff" }).setOrigin(0, 0.5);
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

    this.renderAttributeRows();
    this.renderPreview();

    this.startButton = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 40, "ABENTEUER BEGINNEN", {
        fontSize: "20px",
        color: "#666666",
        backgroundColor: "#2a3244",
        padding: { x: 24, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.tryStart());

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 10, "Charakter-Art: Universal LPC Spritesheet Generator (Liberated Pixel Cup) — siehe CREDITS.md", {
        fontSize: "10px",
        color: "#5a6478",
      })
      .setOrigin(0.5);

    this.updateStartButton();
  }

  private rows(): AttributeRow<string>[] {
    return [
      {
        label: "Geschlecht",
        options: GENDERS,
        labels: GENDER_LABELS,
        get: () => this.appearance.gender,
        set: (v) => (this.appearance.gender = v as Gender),
      },
      {
        label: "Hautfarbe",
        options: AVAILABLE_SKIN_TONES,
        labels: SKIN_LABELS,
        get: () => this.appearance.skinTone,
        set: (v) => (this.appearance.skinTone = v as SkinTone),
      },
      {
        label: "Augenfarbe",
        options: AVAILABLE_EYE_COLORS,
        labels: EYE_LABELS,
        get: () => this.appearance.eyeColor,
        set: (v) => (this.appearance.eyeColor = v as EyeColor),
      },
      {
        label: "Frisur",
        options: AVAILABLE_HAIR_STYLES,
        labels: HAIR_STYLE_LABELS,
        get: () => this.appearance.hairStyle,
        set: (v) => (this.appearance.hairStyle = v as HairStyle),
      },
      {
        label: "Haarfarbe",
        options: AVAILABLE_HAIR_COLORS,
        labels: HAIR_COLOR_LABELS,
        get: () => this.appearance.hairColor,
        set: (v) => (this.appearance.hairColor = v as HairColor),
      },
      {
        label: "Bart",
        options: AVAILABLE_BEARD_STYLES,
        labels: BEARD_STYLE_LABELS,
        get: () => this.appearance.beardStyle,
        set: (v) => (this.appearance.beardStyle = v as BeardStyle),
      },
      {
        label: "Bartfarbe",
        options: AVAILABLE_HAIR_COLORS,
        labels: HAIR_COLOR_LABELS,
        get: () => this.appearance.beardColor,
        set: (v) => (this.appearance.beardColor = v as HairColor),
        visible: () => this.appearance.beardStyle !== "none",
      },
    ];
  }

  private renderAttributeRows(): void {
    this.rowTexts.forEach((t) => t.destroy());
    this.rowTexts = [];

    const startY = 140;
    const rowHeight = 46;
    const x = GAME_WIDTH / 2 + 40;

    this.rows().forEach((row, i) => {
      const y = startY + i * rowHeight;
      const label = this.add.text(x - 170, y, row.label, { fontSize: "14px", color: "#9aa4b8" });
      const valueText = this.add.text(x + 10, y, row.labels[row.get()] ?? row.get(), { fontSize: "14px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5, 0);
      const prev = this.add
        .text(x - 20, y, "◀", { fontSize: "16px", color: "#8bd3ff" })
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.cycle(row, -1));
      const next = this.add
        .text(x + 40, y, "▶", { fontSize: "16px", color: "#8bd3ff" })
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => this.cycle(row, 1));

      const visible = row.visible ? row.visible() : true;
      [label, valueText, prev, next].forEach((el) => {
        el.setVisible(visible);
        this.rowTexts.push(el);
      });
    });
  }

  private cycle(row: AttributeRow<string>, direction: 1 | -1): void {
    const options = row.options;
    const currentIndex = options.indexOf(row.get());
    const nextIndex = (currentIndex + direction + options.length) % options.length;
    row.set(options[nextIndex]);
    this.renderAttributeRows();
    this.renderPreview();
  }

  private renderPreview(): void {
    this.preview?.destroy();
    this.preview = new CharacterSprite(this, GAME_WIDTH / 2 - 260, 320, { ...this.appearance }, null);
    this.preview.setScale(2.2);
  }

  private updateStartButton(): void {
    const ready = this.nameBuffer.trim().length >= 2;
    this.startButton.setColor(ready ? "#ffffff" : "#666666");
  }

  private tryStart(): void {
    const name = this.nameBuffer.trim();
    if (name.length < 2) return;

    const character: SavedCharacter = { name, appearance: { ...this.appearance }, classId: null };
    localStorage.setItem(STORAGE_KEYS.character, JSON.stringify(character));
    this.scene.start("Town", { character });
  }
}
