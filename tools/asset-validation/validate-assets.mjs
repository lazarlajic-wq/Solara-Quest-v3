// Checks every path in the client's asset manifest actually exists on disk,
// and flags duplicate keys. Run via `npm run validate:assets`.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientPublic = resolve(__dirname, "../../apps/client/public");
const manifestPath = resolve(__dirname, "../../apps/client/src/core/AssetManifest.ts");
const layersPath = resolve(__dirname, "../../apps/client/src/core/CharacterLayers.ts");

const readFile = (p) => import("node:fs/promises").then((fs) => fs.readFile(p, "utf-8"));
const source = await readFile(manifestPath);
const layersSource = await readFile(layersPath);

// Lightweight extraction (no TS build step required here): pull key/path pairs
// out of the manifest source with a regex rather than requiring ts-node.
const entryRegex = /key:\s*"([^"]+)"[\s\S]*?path:\s*"([^"]+)"/g;
const seenKeys = new Set();
let match;
let errorCount = 0;

const checkEntry = (key, relPath) => {
  if (seenKeys.has(key)) {
    console.error(`Duplicate asset key: "${key}"`);
    errorCount++;
  }
  seenKeys.add(key);

  const fullPath = resolve(clientPublic, relPath);
  if (!existsSync(fullPath)) {
    console.error(`Missing asset file for "${key}": ${fullPath}`);
    errorCount++;
  }
};

while ((match = entryRegex.exec(source))) {
  checkEntry(match[1], match[2]);
}

// CharacterLayers.ts builds its manifest entries programmatically (every
// gender/skin/eye/hair/beard/class-outfit combination), so there are no
// literal key/path pairs to regex out here. Instead, extract its small
// option arrays and mirror the same combination logic — keep this in sync
// with CharacterLayers.ts if that generation logic changes.
const stringArray = (name) => {
  const arrayMatch = layersSource.match(new RegExp(`${name}[^=]*=\\s*\\[([^\\]]*)\\]`));
  if (!arrayMatch) throw new Error(`Could not find array "${name}" in CharacterLayers.ts`);
  return [...arrayMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
};

const skinTones = stringArray("AVAILABLE_SKIN_TONES");
const eyeColors = stringArray("AVAILABLE_EYE_COLORS");
const hairStyles = stringArray("AVAILABLE_HAIR_STYLES");
const hairColors = stringArray("AVAILABLE_HAIR_COLORS");
const beardStyles = stringArray("AVAILABLE_BEARD_STYLES").filter((s) => s !== "none");
const classesWithOutfit = stringArray("CLASSES_WITH_OUTFIT_LAYER");

for (const skin of skinTones) {
  for (const gender of ["male", "female"]) {
    checkEntry(`layer_base_${gender}_${skin}`, `assets/characters/layers/base/${gender}_${skin}.png`);
  }
}
for (const eye of eyeColors) {
  checkEntry(`layer_eye_${eye}`, `assets/characters/layers/eyes/${eye}.png`);
}
for (const style of hairStyles) {
  for (const color of hairColors) {
    checkEntry(`layer_hair_${style}_${color}`, `assets/characters/layers/hair/${style}_${color}.png`);
  }
}
for (const style of beardStyles) {
  for (const color of hairColors) {
    checkEntry(`layer_beard_${style}_${color}`, `assets/characters/layers/beard/${style}_${color}.png`);
  }
}
for (const gender of ["male", "female"]) {
  checkEntry(`layer_outfit_${gender}_leather`, `assets/characters/layers/outfit/${gender}_leather.png`);
}
for (const classId of classesWithOutfit) {
  checkEntry(`layer_outfit_class_${classId}`, `assets/characters/layers/outfit/${classId}.png`);
}

if (seenKeys.size === 0) {
  console.error("No asset entries found — is AssetManifest.ts's format still key: \"...\" / path: \"...\"?");
  errorCount++;
}

if (errorCount > 0) {
  console.error(`\nvalidate-assets: ${errorCount} problem(s) found.`);
  process.exit(1);
}

console.log(`validate-assets: OK (${seenKeys.size} assets checked).`);
