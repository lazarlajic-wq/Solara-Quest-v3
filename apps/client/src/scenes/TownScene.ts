import Phaser from "phaser";
import { getClassDefinition, getSkillsForClass } from "@solara/content";
import { CLASS_UNLOCK_LEVEL, type SkillDefinition } from "@solara/shared";
import {
  DEFAULT_ATTACK_DAMAGE,
  DUMMY_XP_REWARD,
  ENEMY_DAMAGE,
  ENEMY_XP_REWARD,
  PLAYER_ATTACK_HIT_RADIUS,
  PLAYER_RESPAWN_DELAY_MS,
  RESOURCE_REGEN_PER_SEC,
  STORAGE_KEYS,
  xpToNextLevel,
} from "../config";
import type { Damageable } from "../entities/Damageable";
import { Enemy } from "../entities/Enemy";
import { InputController } from "../core/InputController";
import { addXp, debugLevelUp, loadProgress, type PlayerProgress } from "../core/PlayerProgress";
import { Player } from "../entities/Player";
import { TrainingDummy } from "../entities/TrainingDummy";
import { HUD } from "../ui/HUD";
import { SkillBar } from "../ui/SkillBar";
import type { SavedCharacter } from "./CharacterCreateScene";

const DEFAULT_HEALTH = 100;

/**
 * Phase 4 playable slice: the Solara Coast start town. Loads the Tiled map,
 * wires ground/decoration layers + collision objects, spawns the player at
 * the authored spawn point, and hooks up NPC/portal interaction — a real,
 * fully-integrated map rather than a disconnected demo (spec section 41).
 *
 * Also carries the Phase 3 combat slice: a melee attack against training
 * dummies (harmless XP piñatas) and real enemies (leashed-aggro slimes that
 * damage the player back and can defeat them) — see
 * docs/gameplay/phase-status.md for what's still missing (skills, resource
 * spending, real enemy art).
 */
export class TownScene extends Phaser.Scene {
  private player!: Player;
  private input_!: InputController;
  private hud!: HUD;
  private skillBar!: SkillBar;
  private interactables: Phaser.GameObjects.Zone[] = [];
  private dummies: TrainingDummy[] = [];
  private enemies: Enemy[] = [];
  private character!: SavedCharacter;
  private progress!: PlayerProgress;
  private playerHp = 0;
  private playerMaxHp = 0;
  private playerDefeated = false;
  private spawnPoint = { x: 100, y: 100 };
  private skills: SkillDefinition[] = [];
  private playerResource = 0;
  private playerMaxResource = 0;
  private resourceType: "mana" | "energy" | null = null;
  private skillReadyAt = new Map<string, number>();

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
    // Phaser reuses this Scene instance across visits (e.g. leaving for
    // ClassSelect and coming back) — reset per-visit collections so stale
    // references to last time's (now-destroyed) entities don't linger.
    this.interactables = [];
    this.dummies = [];
    this.enemies = [];
    this.skillReadyAt = new Map();
    this.playerDefeated = false;

    const map = this.make.tilemap({ key: "map_starttown" });
    const tileset = map.addTilesetImage("starttown", "tileset_starttown")!;
    const ground = map.createLayer("ground", tileset, 0, 0)!;
    const decoration = map.createLayer("decoration", tileset, 0, 0)!;
    decoration.setDepth(5);
    void ground;

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const spawn = map.findObject("spawns", (o) => o.name === "player_spawn");
    this.spawnPoint = { x: spawn?.x ?? 100, y: spawn?.y ?? 100 };
    this.player = new Player(this, this.spawnPoint.x, this.spawnPoint.y, character.appearance, character.classId);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);

    this.setupCollision(map);
    this.setupInteractables(map);
    this.setupDummies(map);
    this.setupEnemies(map);

    this.input_ = new InputController(this);
    this.hud = new HUD(this);
    this.skillBar = new SkillBar(this);

    if (character.classId) {
      const classDef = getClassDefinition(character.classId);
      this.playerMaxHp = classDef.baseStats.health;
      this.playerMaxResource = classDef.baseStats.resource;
      this.resourceType = classDef.resourceType;
      this.skills = getSkillsForClass(character.classId);
      this.skillBar.setSkills(this.skills);
    } else {
      this.playerMaxHp = DEFAULT_HEALTH;
    }
    this.playerHp = this.playerMaxHp;
    this.playerResource = this.playerMaxResource;
    this.hud.setHealth(this.playerHp, this.playerMaxHp);
    this.hud.setResource(this.playerResource, this.playerMaxResource, this.resourceType);
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

  override update(time: number, delta: number): void {
    this.player.update(this.input_, time);
    for (const enemy of this.enemies) enemy.update(time, { x: this.player.x, y: this.player.y });
    this.checkInteractions();
    this.checkAttack(time);
    this.checkSkills(time);
    this.regenResource(delta);
    this.skillBar.update(time, this.playerResource, this.skillReadyAt);
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

  private setupEnemies(map: Phaser.Tilemaps.Tilemap): void {
    const spawns = map.getObjectLayer("spawns");
    if (!spawns) return;
    for (const obj of spawns.objects) {
      if (obj.type !== "enemy") continue;
      const w = obj.width ?? 0;
      const h = obj.height ?? 0;
      const enemy = new Enemy(
        this,
        (obj.x ?? 0) + w / 2,
        (obj.y ?? 0) + h / 2,
        () => this.onEnemyDefeated(),
        () => this.damagePlayer(),
      );
      this.enemies.push(enemy);
      this.physics.add.collider(this.player, enemy);
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
    const targets: Damageable[] = [...this.dummies, ...this.enemies];
    for (const target of targets) {
      if (!target.isAlive()) continue;
      if (Phaser.Math.Distance.Between(point.x, point.y, target.x, target.y) <= PLAYER_ATTACK_HIT_RADIUS) {
        target.takeDamage(damage);
      }
    }
  }

  private regenResource(delta: number): void {
    if (this.resourceType === null || this.playerResource >= this.playerMaxResource) return;
    this.playerResource = Math.min(this.playerMaxResource, this.playerResource + (RESOURCE_REGEN_PER_SEC * delta) / 1000);
    this.hud.setResource(this.playerResource, this.playerMaxResource, this.resourceType);
  }

  private checkSkills(time: number): void {
    const slot = this.input_.requestedSkillSlot();
    if (!slot) return;
    const skill = this.skills.find((s) => s.barSlot === slot);
    if (!skill) return;

    const readyAt = this.skillReadyAt.get(skill.id) ?? 0;
    if (time < readyAt) return;
    if (this.playerResource < skill.resourceCost) {
      this.hud.showToast(`Nicht genug ${this.resourceType === "mana" ? "Mana" : "Energie"} für ${skill.name}.`);
      return;
    }

    this.skillReadyAt.set(skill.id, time + skill.cooldownMs);
    this.playerResource -= skill.resourceCost;
    this.hud.setResource(this.playerResource, this.playerMaxResource, this.resourceType);
    this.player.playSkillCastFeedback();
    this.resolveSkillEffect(skill);
  }

  private resolveSkillEffect(skill: SkillDefinition): void {
    const damage = skill.damageMultiplier
      ? Math.round((this.character.classId ? getClassDefinition(this.character.classId).baseStats.attack : DEFAULT_ATTACK_DAMAGE) * skill.damageMultiplier)
      : 0;
    const targets: Damageable[] = [...this.dummies, ...this.enemies];

    if (skill.effect === "strike") {
      const point = this.player.aimPoint(skill.range ?? 0);
      for (const target of targets) {
        if (!target.isAlive()) continue;
        if (Phaser.Math.Distance.Between(point.x, point.y, target.x, target.y) <= (skill.radius ?? 0)) {
          target.takeDamage(damage);
        }
      }
    } else if (skill.effect === "nova") {
      for (const target of targets) {
        if (!target.isAlive()) continue;
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y) <= (skill.radius ?? 0)) {
          target.takeDamage(damage);
        }
      }
    } else if (skill.effect === "heal") {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + (skill.healAmount ?? 0));
      this.hud.setHealth(this.playerHp, this.playerMaxHp);
    }

    this.hud.showToast(`${skill.name} eingesetzt.`);
  }

  private grantXp(amount: number, source: string): void {
    const { progress, levelsGained } = addXp(amount);
    this.progress = progress;
    this.updateLevelHud();
    this.hud.showToast(
      levelsGained > 0 ? `${source}: +${amount} XP — Level aufgestiegen! Jetzt Level ${progress.level}` : `${source}: +${amount} XP`,
    );
  }

  private onDummyDefeated(): void {
    this.grantXp(DUMMY_XP_REWARD, "Trainingsdummy besiegt");
  }

  private onEnemyDefeated(): void {
    this.grantXp(ENEMY_XP_REWARD, "Gegner besiegt");
  }

  private damagePlayer(): void {
    if (this.playerDefeated) return;
    this.playerHp = Math.max(0, this.playerHp - ENEMY_DAMAGE);
    this.hud.setHealth(this.playerHp, this.playerMaxHp);
    if (this.playerHp === 0) this.onPlayerDefeated();
  }

  private onPlayerDefeated(): void {
    this.playerDefeated = true;
    this.hud.showToast("Du wurdest besiegt — zurück zum Dorfplatz.");
    this.player.body.setVelocity(0, 0);
    this.time.delayedCall(PLAYER_RESPAWN_DELAY_MS, () => {
      this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
      this.playerHp = this.playerMaxHp;
      this.hud.setHealth(this.playerHp, this.playerMaxHp);
      this.playerDefeated = false;
    });
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
