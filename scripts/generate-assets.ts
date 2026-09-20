/**
 * Local asset pipeline: public/brand/logo-light.svg + logo-dark.svg in,
 * icons plus favicons plus social cards out. Deterministic: same SVGs in,
 * same bytes out. Reruns skip byte identical outputs.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import sharp, { type Sharp } from "sharp";

export interface AssetOutput {
  path: string;
  width: number;
  height: number;
}

export const ASSET_OUTPUTS: AssetOutput[] = [
  { path: "public/brand/icon-180.png", width: 180, height: 180 },
  { path: "public/brand/icon-192.png", width: 192, height: 192 },
  { path: "public/brand/icon-512.png", width: 512, height: 512 },
  { path: "public/brand/favicon-32.png", width: 32, height: 32 },
  { path: "public/brand/favicon-16.png", width: 16, height: 16 },
  { path: "public/brand/og-light.png", width: 1200, height: 630 },
  { path: "public/brand/og-dark.png", width: 1200, height: 630 },
];

const MAX_SVG_BYTES = 512 * 1024;

function validateUpload(label: string, buffer: Buffer): void {
  if (buffer.length > MAX_SVG_BYTES) {
    throw new Error(`[assets] ${label} exceeds 512KB; simplify the artwork.`);
  }
  const text = buffer.toString("utf8", 0, Math.min(buffer.length, 4096));
  if (/<script|javascript:|on\w+\s*=/i.test(text)) {
    throw new Error(`[assets] ${label} looks executable; SVGs must be static art.`);
  }
}

function hashFile(path: string): string | null {
  if (!existsSync(path)) return null;
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

async function compositedOn(svg: Buffer, width: number, height: number, background: string): Promise<Sharp> {
  const overlay = await sharp(svg).resize(width, height, { fit: "contain" }).toBuffer();
  return sharp({ create: { width, height, channels: 4, background } }).composite([{ input: overlay }]);
}

export async function generateBrandAssets(root: string = process.cwd()): Promise<string[]> {
  const lightPath = join(root, "public/brand/logo-light.svg");
  const darkPath = join(root, "public/brand/logo-dark.svg");
  if (!existsSync(lightPath) || !existsSync(darkPath)) {
    throw new Error("[assets] Need public/brand/logo-light.svg and logo-dark.svg (square viewBox).");
  }
  const light = readFileSync(lightPath);
  const dark = readFileSync(darkPath);
  validateUpload("logo-light.svg", light);
  validateUpload("logo-dark.svg", dark);
  const written: string[] = [];
  for (const output of ASSET_OUTPUTS) {
    const absolute = join(root, output.path);
    mkdirSync(dirname(absolute), { recursive: true });
    const isOg = output.path.includes("og-");
    const source = output.path.includes("dark") ? dark : light;
    const image = isOg
      ? await compositedOn(source, output.width, output.height, output.path.includes("dark") ? "#000000" : "#ffffff")
      : sharp(source).resize(output.width, output.height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
    const bytes = await image.png().toBuffer();
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (hashFile(absolute) === digest) continue;
    writeFileSync(absolute, bytes);
    written.push(output.path);
  }
  return written;
}
