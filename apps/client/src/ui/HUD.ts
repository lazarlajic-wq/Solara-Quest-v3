import Phaser from "phaser";

/**
 * Minimal HUD: health + Solaris. Scroll-factor 0 so it stays fixed on
 * screen regardless of camera/world position (spec section 33).
 */
export class HUD {
  private hpText: Phaser.GameObjects.Text;
  private solarisText: Phaser.GameObjects.Text;
  private toast?: Phaser.GameObjects.Text;
  private toastTimer?: Phaser.Time.TimerEvent;

  constructor(private scene: Phaser.Scene) {
    const panel = scene.add.rectangle(12, 12, 220, 60, 0x000000, 0.55).setOrigin(0, 0).setScrollFactor(0).setDepth(900);
    const heart = scene.add.image(28, 30, "icon_heart").setScrollFactor(0).setDepth(901).setScale(0.5);
    const coin = scene.add.image(28, 56, "icon_coin").setScrollFactor(0).setDepth(901).setScale(0.5);
    this.hpText = scene.add.text(46, 22, "", { fontSize: "14px", color: "#ffffff" }).setScrollFactor(0).setDepth(901);
    this.solarisText = scene.add.text(46, 48, "", { fontSize: "14px", color: "#ffe08b" }).setScrollFactor(0).setDepth(901);
    void panel;
    void heart;
    void coin;
  }

  setHealth(current: number, max: number): void {
    this.hpText.setText(`HP ${current}/${max}`);
  }

  setSolaris(amount: number): void {
    this.solarisText.setText(`${amount} Solaris`);
  }

  showToast(message: string): void {
    this.toast?.destroy();
    this.toastTimer?.remove();
    this.toast = this.scene.add
      .text(this.scene.scale.width / 2, 90, message, {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000cc",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(950);
    this.toastTimer = this.scene.time.delayedCall(2200, () => this.toast?.destroy());
  }
}
