import Phaser from "phaser";
import { getClassDefinition } from "@solara/content";
import { STORAGE_KEYS } from "../config";
import { createCharacterAnimations } from "../core/CharacterAnimations";
import { InputController } from "../core/InputController";
import { Player } from "../entities/Player";
import { HUD } from "../ui/HUD";
import type { SavedCharacter } from "./CharacterCreateScene";

/**
 * Phase 4 playable slice: the Solara Coast start town. Loads the Tiled map,
 * wires ground/decoration layers + collision objects, spawns the player at
 * the authored spawn point, and hooks up NPC/portal interaction — a real,
 * fully-integrated map rather than a disconnected demo (spec section 41).
 */
export class TownScene extends Phaser.Scene {
  private player!: Player;
  private input_!: InputController;
  private hud!: HUD;
  private interactables: Phaser.GameObjects.Zone[] = [];

  constructor() {
    super("Town");
  }

  create(data: { character?: SavedCharacter }): void {
    const character = data.character ?? this.loadSavedCharacter();
    if (!character) {
      this.scene.start("CharacterCreate");
      return;
    }

    const map = this.make.tilemap({ key: "map_starttown" });
    const tileset = map.addTilesetImage("starttown", "tileset_starttown")!;
    const ground = map.createLayer("ground", tileset, 0, 0)!;
    const decoration = map.createLayer("decoration", tileset, 0, 0)!;
    decoration.setDepth(5);
    void ground;

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const classDef = getClassDefinition(character.classId);
    createCharacterAnimations(this.anims, classDef.spriteSheetKey);

    const spawn = map.findObject("spawns", (o) => o.name === "player_spawn");
    this.player = new Player(this, spawn?.x ?? 100, spawn?.y ?? 100, classDef);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

    this.setupCollision(map);
    this.setupInteractables(map);

    this.input_ = new InputController(this);
    this.hud = new HUD(this);
    this.hud.setHealth(classDef.baseStats.health, classDef.baseStats.health);
    this.hud.setSolaris(0);
    this.hud.showToast(`Willkommen, ${character.name} (${classDef.name})`);
  }

  override update(time: number): void {
    this.player.update(this.input_, time);
    this.checkInteractions();
  }

  private loadSavedCharacter(): SavedCharacter | null {
    const raw = localStorage.getItem(STORAGE_KEYS.character);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SavedCharacter;
    } catch {
      return null;
    }
  }

  private setupCollision(map: Phaser.Tilemaps.Tilemap): void {
    const collisionLayer = map.getObjectLayer("collision");
    if (!collisionLayer) return;
    for (const obj of collisionLayer.objects) {
      const w = obj.width ?? 0;
      const h = obj.height ?? 0;
      const body = this.add.zone((obj.x ?? 0) + w / 2, (obj.y ?? 0) + h / 2, w, h);
      this.physics.add.existing(body, true);
      this.physics.add.collider(this.player, body);
    }
  }

  private setupInteractables(map: Phaser.Tilemaps.Tilemap): void {
    const spawns = map.getObjectLayer("spawns");
    if (!spawns) return;
    for (const obj of spawns.objects) {
      if (obj.type !== "npc" && obj.type !== "portal") continue;
      const w = obj.width ?? 0;
      const h = obj.height ?? 0;
      const zone = this.add.zone((obj.x ?? 0) + w / 2, (obj.y ?? 0) + h / 2, w, h);
      zone.setData("type", obj.type);
      zone.setData("name", obj.name);
      this.physics.add.existing(zone, true);
      this.interactables.push(zone);
    }
  }

  private checkInteractions(): void {
    if (!this.input_.isInteractPressed()) return;
    for (const zone of this.interactables) {
      const dist = Phaser.Math.Distance.Between(zone.x, zone.y, this.player.x, this.player.y);
      if (dist < 70) {
        if (zone.getData("type") === "npc") {
          this.hud.showToast(`${zone.getData("name")}: "Willkommen in der Startstadt. Das Trainingslager wartet."`);
        } else if (zone.getData("type") === "portal") {
          this.hud.showToast("Diese Region ist noch nicht gebaut — kommt in einer späteren Phase.");
        }
        return;
      }
    }
  }
}
