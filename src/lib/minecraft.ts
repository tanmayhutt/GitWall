import type { CanvasRenderingContext2D } from "canvas";

// Minecraft cell renderer. Each contribution cell is drawn as a 16×16 pixel-art
// block whose appearance scales with the day's activity level (-1 empty … 3
// busiest). All sprites share one 16-unit grid so they line up exactly.
//
// `seed` is a small per-cell integer (derived from grid position) used to vary
// stone/dirt noise so neighbouring blocks don't look identically tiled.

export type MinecraftVariant = "emerald" | "chest" | "grass" | "slime";

export const MINECRAFT_VARIANTS: MinecraftVariant[] = [
  "slime",
  "emerald",
  "chest",
  "grass",
];

const GRID = 16;

// Fill the inclusive cell range (c0..c1, r0..r1) of the 16×16 sprite grid.
// Boundaries are snapped to whole device pixels and adjacent calls share the
// same rounded edge, so blocks tile seamlessly with no hairline gaps.
function rect(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number, u: number,
  c0: number, r0: number, c1: number, r1: number,
  color: string
) {
  const x0 = Math.round(ox + c0 * u);
  const x1 = Math.round(ox + (c1 + 1) * u);
  const y0 = Math.round(oy + r0 * u);
  const y1 = Math.round(oy + (r1 + 1) * u);
  ctx.fillStyle = color;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}
function dot(ctx: CanvasRenderingContext2D, ox: number, oy: number, u: number, c: number, r: number, color: string) {
  rect(ctx, ox, oy, u, c, r, c, r, color);
}

// Deterministic 4-tone speckle, the basis for stone / dirt / cobble textures.
function noiseFill(
  ctx: CanvasRenderingContext2D, ox: number, oy: number, u: number,
  base: string, light: string, dark: string, darkest: string, seed: number
) {
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const h = (c * 7 + r * 13 + seed * 5 + ((c * c + r) % 3)) % 7;
      let col = base;
      if (h === 2) col = light;
      else if (h === 4) col = dark;
      else if (h === 6) col = darkest;
      dot(ctx, ox, oy, u, c, r, col);
    }
  }
}

// ── shared palettes ────────────────────────────────────────────────────────
const EM = { out: "#0c5c2e", mid: "#1c9e54", bright: "#34d878", hi: "#7df0a8" };

function emeraldCluster(ctx: CanvasRenderingContext2D, ox: number, oy: number, u: number, c: number, r: number) {
  rect(ctx, ox, oy, u, c, r, c + 1, r + 1, EM.out);
  dot(ctx, ox, oy, u, c, r, EM.mid);
  dot(ctx, ox, oy, u, c + 1, r, EM.bright);
  dot(ctx, ox, oy, u, c, r + 1, EM.bright);
  dot(ctx, ox, oy, u, c + 1, r + 1, EM.mid);
  dot(ctx, ox, oy, u, c + 1, r, EM.hi);
}

// ── 1. EMERALD ORE: stone → emerald block ───────────────────────────────────
function drawEmerald(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, level: number, seed: number) {
  const u = size / GRID;
  if (level === 3) {
    noiseFill(ctx, x, y, u, "#23c268", "#3ee07f", "#179a4f", "#0f7a3e", seed);
    rect(ctx, x, y, u, 0, 0, 15, 0, "#5cea93");
    rect(ctx, x, y, u, 0, 0, 0, 15, "#5cea93");
    rect(ctx, x, y, u, 0, 15, 15, 15, "#0c6634");
    rect(ctx, x, y, u, 15, 0, 15, 15, "#0c6634");
    rect(ctx, x, y, u, 6, 5, 9, 6, EM.hi);
    rect(ctx, x, y, u, 5, 7, 10, 9, "#46e389");
    rect(ctx, x, y, u, 6, 10, 9, 11, EM.hi);
    return;
  }
  noiseFill(ctx, x, y, u, "#7e7e7e", "#9a9a9a", "#6b6b6b", "#585858", seed);
  const positions: [number, number][] = [
    [3, 4], [10, 3], [5, 10], [11, 11], [7, 7], [2, 12], [12, 6], [8, 2],
  ];
  const counts = [1, 3, 5][level] ?? 1;
  for (let i = 0; i < counts; i++) {
    const [c, r] = positions[(i + seed) % positions.length];
    emeraldCluster(ctx, x, y, u, c, r);
  }
}

// ── 2. LOOT CHEST: cobblestone → chest → emerald haul ───────────────────────
const WD = { base: "#9c6b35", dark: "#6e4a22", light: "#b7843f", out: "#3a2613" };
const MT = { base: "#e0d9c7", dark: "#8a8475", lock: "#2a2418" };

function cobble(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, seed: number) {
  noiseFill(ctx, x, y, u, "#8a8a8a", "#a2a2a2", "#6f6f6f", "#5c5c5c", seed);
  rect(ctx, x, y, u, 0, 7, 15, 7, "#4f4f4f");
  rect(ctx, x, y, u, 5, 0, 5, 6, "#4f4f4f");
  rect(ctx, x, y, u, 10, 8, 10, 15, "#4f4f4f");
}
function chestBody(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, open: boolean, dim: boolean) {
  const b = dim ? "#7d562b" : WD.base;
  const d = dim ? "#593c1c" : WD.dark;
  const l = dim ? "#946b33" : WD.light;
  rect(ctx, x, y, u, 1, 5, 14, 14, b);
  rect(ctx, x, y, u, 1, 5, 1, 14, WD.out);
  rect(ctx, x, y, u, 14, 5, 14, 14, WD.out);
  rect(ctx, x, y, u, 1, 14, 14, 14, WD.out);
  rect(ctx, x, y, u, 4, 6, 4, 13, d);
  rect(ctx, x, y, u, 9, 6, 9, 13, d);
  rect(ctx, x, y, u, 2, 6, 2, 13, l);
  if (open) {
    rect(ctx, x, y, u, 1, 1, 14, 4, b);
    rect(ctx, x, y, u, 1, 1, 14, 1, WD.out);
    rect(ctx, x, y, u, 1, 4, 14, 4, d);
    rect(ctx, x, y, u, 1, 1, 1, 4, WD.out);
    rect(ctx, x, y, u, 14, 1, 14, 4, WD.out);
  } else {
    rect(ctx, x, y, u, 1, 2, 14, 4, b);
    rect(ctx, x, y, u, 1, 2, 14, 2, WD.out);
    rect(ctx, x, y, u, 1, 4, 14, 4, d);
    rect(ctx, x, y, u, 1, 2, 1, 4, WD.out);
    rect(ctx, x, y, u, 14, 2, 14, 4, WD.out);
    rect(ctx, x, y, u, 7, 3, 8, 7, MT.base);
    rect(ctx, x, y, u, 7, 7, 8, 7, MT.dark);
    dot(ctx, x, y, u, 7, 5, MT.lock);
    dot(ctx, x, y, u, 8, 5, MT.lock);
  }
}
function drawChest(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, level: number, seed: number) {
  const u = size / GRID;
  if (level === -1) { cobble(ctx, x, y, u, seed); return; }
  if (level === 0) { chestBody(ctx, x, y, u, false, true); return; }
  if (level === 1) { chestBody(ctx, x, y, u, false, false); return; }
  if (level === 2) {
    chestBody(ctx, x, y, u, true, false);
    rect(ctx, x, y, u, 3, 5, 12, 7, "#f4c430");
    rect(ctx, x, y, u, 3, 5, 12, 5, "#ffe08a");
    dot(ctx, x, y, u, 5, 6, "#fff3c4");
    dot(ctx, x, y, u, 9, 6, "#fff3c4");
    return;
  }
  chestBody(ctx, x, y, u, true, false);
  rect(ctx, x, y, u, 3, 4, 12, 7, EM.out);
  for (const [c, r] of [[3, 5], [6, 4], [9, 5], [11, 6], [5, 6], [8, 6]] as [number, number][]) {
    emeraldCluster(ctx, x, y, u, c, r);
  }
  dot(ctx, x, y, u, 2, 3, EM.hi);
  dot(ctx, x, y, u, 13, 3, EM.hi);
}

// ── 3. GRASS & FOLIAGE: dirt → grass → sapling → bush → tree ────────────────
const LF = { base: "#3f8f2c", dark: "#2c6e1e", light: "#5aa83e", hi: "#74c24e" };

function dirt(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, seed: number) {
  noiseFill(ctx, x, y, u, "#7a5536", "#8c6443", "#5e3f28", "#4a3120", seed);
}
function grassTop(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, seed: number) {
  rect(ctx, x, y, u, 0, 0, 15, 3, LF.base);
  for (let c = 0; c < GRID; c++) {
    const h = (c * 5 + seed) % 3;
    dot(ctx, x, y, u, c, 4, h === 0 ? LF.dark : LF.base);
    if (h === 1) dot(ctx, x, y, u, c, 3, LF.light);
  }
  rect(ctx, x, y, u, 0, 0, 15, 0, LF.hi);
}
function leafBlob(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, seed: number, c0: number, r0: number, c1: number, r1: number) {
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const h = (c * 7 + r * 11 + seed) % 5;
      let col = LF.base;
      if (h === 0) col = LF.dark;
      else if (h === 1) col = LF.light;
      else if (h === 2) col = LF.hi;
      dot(ctx, x, y, u, c, r, col);
    }
  }
}
function drawGrass(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, level: number, seed: number) {
  const u = size / GRID;
  if (level === -1) { dirt(ctx, x, y, u, seed); return; }
  if (level === 3) { leafBlob(ctx, x, y, u, seed, 0, 0, 15, 15); return; }
  dirt(ctx, x, y, u, seed);
  grassTop(ctx, x, y, u, seed);
  if (level === 1) {
    rect(ctx, x, y, u, 7, 1, 8, 5, "#5a3d22");
    leafBlob(ctx, x, y, u, seed, 5, 0, 10, 3);
  }
  if (level === 2) {
    rect(ctx, x, y, u, 7, 6, 8, 9, "#5a3d22");
    leafBlob(ctx, x, y, u, seed, 3, 0, 12, 5);
  }
}

// ── 4. SLIME: swamp stone → slime cubes (brighter = busier) ─────────────────
function drawSlime(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, level: number, seed: number) {
  const u = size / GRID;
  if (level === -1) {
    noiseFill(ctx, x, y, u, "#2b3326", "#36402f", "#222a1f", "#1a2018", seed);
    return;
  }
  const body = ["#4a7a35", "#5fa53f", "#74c24a", "#8ce05a"][level];
  const outl = ["#2f5320", "#3a6e26", "#4a8c2e", "#5aa838"][level];
  const core = ["#3a6128", "#4a8230", "#5c9c38", "#6fbf46"][level];
  const hi = "#bdf08e";
  rect(ctx, x, y, u, 1, 1, 14, 14, body);
  rect(ctx, x, y, u, 1, 1, 14, 1, outl);
  rect(ctx, x, y, u, 1, 14, 14, 14, outl);
  rect(ctx, x, y, u, 1, 1, 1, 14, outl);
  rect(ctx, x, y, u, 14, 1, 14, 14, outl);
  rect(ctx, x, y, u, 5, 5, 10, 10, core);
  rect(ctx, x, y, u, 6, 6, 9, 9, body);
  rect(ctx, x, y, u, 3, 3, 4, 4, hi);
  if (level === 3) { dot(ctx, x, y, u, 11, 4, hi); dot(ctx, x, y, u, 4, 11, hi); }
}

const RENDERERS: Record<
  MinecraftVariant,
  (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, level: number, seed: number) => void
> = {
  emerald: drawEmerald,
  chest: drawChest,
  grass: drawGrass,
  slime: drawSlime,
};

export function drawMinecraftCell(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  level: number,
  variant: MinecraftVariant,
  seed: number
) {
  (RENDERERS[variant] ?? drawSlime)(ctx, x, y, size, level, seed);
}
