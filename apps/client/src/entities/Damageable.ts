/** Anything the player's melee attack can hit — training dummies and enemies alike. */
export interface Damageable {
  x: number;
  y: number;
  isAlive(): boolean;
  takeDamage(amount: number): void;
}
