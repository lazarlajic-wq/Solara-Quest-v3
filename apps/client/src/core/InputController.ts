import Phaser from "phaser";
import type { Vector2 } from "@solara/shared";

/**
 * Unifies desktop (WASD/arrows + mouse) and mobile (virtual joystick) input
 * into one movement vector + action flags, per spec section 5.
 */
export class InputController {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key };
  private shiftKey: Phaser.Input.Keyboard.Key;
  private interactKey: Phaser.Input.Keyboard.Key;
  private attackKey: Phaser.Input.Keyboard.Key;

  private joystickVector: Vector2 = { x: 0, y: 0 };
  private isMobile: boolean;
  private mobileAttackRequested = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = {
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.shiftKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.interactKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.attackKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.isMobile = !scene.sys.game.device.os.desktop;
    if (this.isMobile) {
      this.createVirtualJoystick();
    }
  }

  getMovementVector(): Vector2 {
    if (this.isMobile) return this.joystickVector;

    let x = 0;
    let y = 0;
    if (this.cursors.left?.isDown || this.wasd.a.isDown) x -= 1;
    if (this.cursors.right?.isDown || this.wasd.d.isDown) x += 1;
    if (this.cursors.up?.isDown || this.wasd.w.isDown) y -= 1;
    if (this.cursors.down?.isDown || this.wasd.s.isDown) y += 1;
    return { x, y };
  }

  isDashPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.shiftKey);
  }

  isInteractPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.interactKey);
  }

  isAttackPressed(): boolean {
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) return true;
    if (this.mobileAttackRequested) {
      this.mobileAttackRequested = false;
      return true;
    }
    return false;
  }

  private createVirtualJoystick(): void {
    const scene = this.scene;
    const baseRadius = 60;
    const baseX = 110;
    const baseY = scene.scale.height - 110;

    const base = scene.add.circle(baseX, baseY, baseRadius, 0xffffff, 0.15).setScrollFactor(0).setDepth(1000);
    const thumb = scene.add.circle(baseX, baseY, 26, 0xffffff, 0.35).setScrollFactor(0).setDepth(1001);

    let pointerId: number | null = null;

    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY);
      if (dist <= baseRadius * 1.8 && pointerId === null) {
        pointerId = pointer.id;
      }
    });

    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== pointerId) return;
      const dx = pointer.x - baseX;
      const dy = pointer.y - baseY;
      const dist = Math.min(Math.hypot(dx, dy), baseRadius);
      const angle = Math.atan2(dy, dx);
      thumb.x = baseX + Math.cos(angle) * dist;
      thumb.y = baseY + Math.sin(angle) * dist;
      this.joystickVector = { x: (thumb.x - baseX) / baseRadius, y: (thumb.y - baseY) / baseRadius };
    });

    const release = (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== pointerId) return;
      pointerId = null;
      thumb.x = baseX;
      thumb.y = baseY;
      this.joystickVector = { x: 0, y: 0 };
    };
    scene.input.on("pointerup", release);
    scene.input.on("pointerupoutside", release);
    base.setVisible(true);

    const attackButton = scene.add
      .circle(scene.scale.width - 90, scene.scale.height - 110, 40, 0xd45c5c, 0.4)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => (this.mobileAttackRequested = true));
    scene.add
      .text(scene.scale.width - 90, scene.scale.height - 110, "⚔", { fontSize: "28px" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);
    void attackButton;
  }
}
