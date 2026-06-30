#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const ROOT = process.cwd();
const BUDGET_KB = Number(process.env.BUNDLE_BUDGET_KB || 200);

if (!existsSync(join(ROOT, ".next"))) {
  console.log("check-bundle: .next not built yet — skipping.");
  process.exit(0);
}

const chunkDir = join(ROOT, ".next/static/chunks");
if (!existsSync(chunkDir)) {
  console.log("check-bundle: .next/static/chunks not found — skipping.");
  process.exit(0);
}

// Build a size map of all gzipped JS chunks.
const gzSizes = {};
for (const f of readdirSync(chunkDir)) {
  if (!f.endsWith(".js") || f.endsWith(".js.map")) continue;
  gzSizes[f] = gzipSync(readFileSync(join(chunkDir, f))).length;
}

// Next 16 (App Router) writes app-build-manifest.json, not build-manifest.json.
// build-manifest.json still exists but has an empty "pages" table for app-router
// projects — the old script passed the budget gate vacuously because of this.
const manifestPath = join(ROOT, ".next/app-build-manifest.json");
if (!existsSync(manifestPath)) {
  console.log("check-bundle: app-build-manifest.json not found — skipping.");
  process.exit(0);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

// app-build-manifest.json uses a "pages" map of route -> [chunk filenames].
const pages = manifest.pages || {};

let bad = 0;
const rows = [];
for (const [route, files] of Object.entries(pages)) {
  // files is an array of relative paths like "static/chunks/foo.js"
  const total = files.reduce((s, f) => {
    const basename = f.split("/").pop();
    return s + (gzSizes[basename] || 0);
  }, 0);
  const kb = total / 1024;
  rows.push([route, kb]);
  if (kb > BUDGET_KB) bad++;
}
rows.sort((a, b) => b[1] - a[1]);

if (rows.length === 0) {
  console.log("check-bundle: no routes found in app-build-manifest — skipping.");
  process.exit(0);
}

console.log("\nRoute first-load JS (gzipped):");
for (const [route, kb] of rows) {
  const flag = kb > BUDGET_KB ? " ⚠ OVER BUDGET" : "";
  console.log(`  ${kb.toFixed(1).padStart(7)} KB  ${route}${flag}`);
}
if (bad > 0) {
  console.error(`\n${bad} route(s) exceed the ${BUDGET_KB} KB budget.`);
  process.exit(1);
}
console.log(`\nAll routes within ${BUDGET_KB} KB budget.`);
