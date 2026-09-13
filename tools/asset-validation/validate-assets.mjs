// Checks every path in the client's asset manifest actually exists on disk,
// and flags duplicate keys. Run via `npm run validate:assets`.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientPublic = resolve(__dirname, "../../apps/client/public");
const manifestPath = resolve(__dirname, "../../apps/client/src/core/AssetManifest.ts");

const source = await import("node:fs/promises").then((fs) => fs.readFile(manifestPath, "utf-8"));

// Lightweight extraction (no TS build step required here): pull key/path pairs
// out of the manifest source with a regex rather than requiring ts-node.
const entryRegex = /key:\s*"([^"]+)"[\s\S]*?path:\s*"([^"]+)"/g;
const seenKeys = new Set();
let match;
let errorCount = 0;

while ((match = entryRegex.exec(source))) {
  const [, key, relPath] = match;
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
