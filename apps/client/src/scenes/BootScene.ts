import Phaser from "phaser";
import { ASSET_MANIFEST } from "../core/AssetManifest";
import { ErrorLog } from "../core/ErrorLog";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

/**
 * Loads every asset from the central manifest, shows a loading bar, and —
 * if anything fails — a visible, readable error banner instead of letting
 * the game continue with silent black-square placeholders.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    ErrorLog.clear();
    this.createLoadingUi();
    this.generateFallbackTexture();

    for (const entry of ASSET_MANIFEST) {
      if (entry.kind === "image") {
        this.load.image(entry.key, entry.path);
      } else if (entry.kind === "spritesheet") {
        this.load.spritesheet(entry.key, entry.path, entry.frameConfig!);
      } else if (entry.kind === "tilemapTiledJSON") {
        this.load.tilemapTiledJSON(entry.key, entry.path);
      } else if (entry.kind === "audio") {
        this.load.audio(entry.key, entry.path);
      }
    }

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      ErrorLog.report({ key: file.key, path: String(file.url), reason: "failed to load" });
    });
  }

  create(): void {
    if (ErrorLog.hasErrors()) {
      this.renderErrorBanner();
      return;
    }
    this.scene.start("CharacterCreate");
  }

  private createLoadingUi(): void {
    const box = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 320, 28, 0x1a1a1a).setStrokeStyle(2, 0xffffff, 0.4);
    const bar = this.add.rectangle(GAME_WIDTH / 2 - 156, GAME_HEIGHT / 2, 4, 20, 0x8bd3ff).setOrigin(0, 0.5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, "Solara Quest wird geladen…", { fontSize: "16px", color: "#ffffff" })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      bar.width = 312 * value;
    });
    void box;
  }

  private generateFallbackTexture(): void {
    if (this.textures.exists("__missing")) return;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xff00ff, 1);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, 16, 16);
    g.fillRect(16, 16, 16, 16);
    g.generateTexture("__missing", 32, 32);
    g.destroy();
  }

  private renderErrorBanner(): void {
    this.cameras.main.setBackgroundColor("#2a0000");
    const errors = ErrorLog.getAll();
    const lines = errors.map((e) => `• ${e.key} → ${e.path}`).join("\n");
    this.add
      .text(GAME_WIDTH / 2, 60, "FEHLENDE ASSETS — Spielstart blockiert", {
        fontSize: "20px",
        color: "#ff8080",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
    this.add
      .text(GAME_WIDTH / 2, 110, lines, {
        fontSize: "14px",
        color: "#ffffff",
        align: "left",
      })
      .setOrigin(0.5, 0);
    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 60,
        "Prüfe apps/client/public/assets/... und core/AssetManifest.ts",
        { fontSize: "12px", color: "#aaaaaa" },
      )
      .setOrigin(0.5, 0);
  }
}
