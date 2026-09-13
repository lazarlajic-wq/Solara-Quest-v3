import { createGame } from "./game";

const root = document.getElementById("game-root");
if (!root) throw new Error("#game-root not found in index.html");

const game = createGame(root);

if (import.meta.env.DEV) {
  (window as unknown as { __solaraGame: unknown }).__solaraGame = game;
}
