import Phaser from "phaser";
import { getClassDefinition } from "@solara/content";
import { CLASS_UNLOCK_LEVEL } from "@solara/shared";
import { DEFAULT_ATTACK_DAMAGE, DUMMY_XP_REWARD, PLAYER_ATTACK_HIT_RADIUS, STORAGE_KEYS, xpToNextLevel } from "../config";
import { InputController } from "../core/InputController";
import { addXp, debugLevelUp, loadProgress, type PlayerProgress } from "../core/PlayerProgress";
import { Player } from "../entities/Player";
import { TrainingDummy } from "../entities/TrainingDummy";
import { HUD } from "../ui/HUD";
import type { SavedCharacter } from "./CharacterCreateScene";

const DEFAULT_HEALTH = 100;

/**
 * Phase 4 playable slice: the Solara Coast start town. Loads the Tiled map,
 * wires ground/decoration layers + collision objects, spawns the player at
 * the authored spawn point, and hooks up NPC/portal interaction — a real,
 * fully-integrated map rather than a disconnected demo (spec section 41).
 *
 * Also carries the Phase 3 first combat slice: a melee attack against
 * training dummies that grants real XP/levels (see PlayerProgress.ts) —
 * skills, resource spending, and real enemies are still future work (see
 * docs/gameplay/phase-status.md).
 */
export class TownScene extends Phaser.Scene {
  private player!: Player;
  private input_!: InputController;
  private hud!: HUD;
  private interactables: Phaser.GameObjects.Zone[] = [];
  private dummies: TrainingDummy[] = [];
  private character!: SavedCharacter;
  private progress!: PlayerProgress;

  constructor() {
    super("Town");
  }

  create(data: { character?: SavedCharacter }): void {
    const character = data.character ?? this.loadSavedCharacter();
    if (!character) {
      this.scene.start("CharacterCreate");
      return;
    }
    this.character = character;
    this.progress = loadProgress();

    const map = this.make.tilemap({ key: "map_starttown" });
    const tileset = map.addTilesetImage("starttown", "tileset_starttown")!;
    const ground = map.createLayer("ground", tileset, 0, 0)!;
    const decoration = map.createLayer("decoration", tileset, 0, 0)!;
    decoration.setDepth(5);
    void ground;

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const spawn = map.findObject("spawns", (o) => o.name === "player_spawn");
    this.player = new Player(this, spawn?.x ?? 100, spawn?.y ?? 100, character.appearance, character.classId);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

    this.setupCollision(map);
    this.setupInteractables(map);
    this.setupDummies(map);

    this.input_ = new InputController(this);
    this.hud = new HUD(this);
    const health = character.classId ? getClassDefinition(character.classId).baseStats.health : DEFAULT_HEALTH;
    this.hud.setHealth(health, health);
    this.hud.setSolaris(0);
    this.updateLevelHud();
    this.hud.showToast(`Willkommen, ${character.name} (Level ${this.progress.level})`);

    if (import.meta.env.DEV) {
      this.input.keyboard!.on("keydown-K", () => {
        this.progress = debugLevelUp();
        this.updateLevelHud();
        this.hud.showToast(`[Debug] Level ${this.progress.level} erreicht`);
      });
    }
  }

  override update(time: number): void {
    this.player.update(this.input_, time);
    this.checkInteractions();
    this.checkAttack(time);
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

  private setupDummies(map: Phaser.Tilemaps.Tilemap): void {
    const spawns = map.getObjectLayer("spawns");
    if (!spawns) return;
    for (const obj of spawns.objects) {
      if (obj.type !== "dummy") continue;
      const w = obj.width ?? 0;
      const h = obj.height ?? 0;
      this.dummies.push(new TrainingDummy(this, (obj.x ?? 0) + w / 2, (obj.y ?? 0) + h / 2, () => this.onDummyDefeated()));
    }
  }

  private checkInteractions(): void {
    if (!this.input_.isInteractPressed()) return;
    for (const zone of this.interactables) {
      const dist = Phaser.Math.Distance.Between(zone.x, zone.y, this.player.x, this.player.y);
      if (dist < 70) {
        if (zone.getData("type") === "npc") {
          this.handleNpcInteraction(zone);
        } else if (zone.getData("type") === "portal") {
          this.hud.showToast("Diese Region ist noch nicht gebaut — kommt in einer späteren Phase.");
        }
        return;
      }
    }
  }

  private checkAttack(time: number): void {
    if (!this.input_.isAttackPressed()) return;
    const point = this.player.attemptAttack(time);
    if (!point) return;

    const damage = this.character.classId ? getClassDefinition(this.character.classId).baseStats.attack : DEFAULT_ATTACK_DAMAGE;
    for (const dummy of this.dummies) {
      if (!dummy.isAlive()) continue;
      if (Phaser.Math.Distance.Between(point.x, point.y, dummy.x, dummy.y) <= PLAYER_ATTACK_HIT_RADIUS) {
        dummy.takeDamage(damage);
      }
    }
  }

  private onDummyDefeated(): void {
    const { progress, levelsGained } = addXp(DUMMY_XP_REWARD);
    this.progress = progress;
    this.updateLevelHud();
    this.hud.showToast(levelsGained > 0 ? `+${DUMMY_XP_REWARD} XP — Level aufgestiegen! Jetzt Level ${progress.level}` : `+${DUMMY_XP_REWARD} XP`);
  }

  private updateLevelHud(): void {
    this.hud.setLevel(this.progress.level, this.progress.xp, xpToNextLevel(this.progress.level));
  }

  private handleNpcInteraction(zone: Phaser.GameObjects.Zone): void {
    if (this.character.classId === null) {
      if (this.progress.level >= CLASS_UNLOCK_LEVEL) {
        this.scene.start("ClassSelect", { character: this.character });
        return;
      }
      this.hud.showToast(
        `${zone.getData("name")}: "Erreiche Level ${CLASS_UNLOCK_LEVEL}, dann zeige ich dir deine Klasse." (Level ${this.progress.level}/${CLASS_UNLOCK_LEVEL})`,
      );
      return;
    }
    this.hud.showToast(`${zone.getData("name")}: "Willkommen in der Startstadt. Das Trainingslager wartet."`);
  }
}
