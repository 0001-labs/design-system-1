export interface Focus { x: number; y: number }

export const CENTRE: Focus = { x: 0.5, y: 0.5 };

export const FOCUS_SAMPLE = 64;

function isSkin(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return y > 40 && cb >= 77 && cb <= 127 && cr >= 137 && cr <= 173 && r > g && r > b;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function focusOf(pixels: ArrayLike<number>, width: number, height: number, channels = 4): Focus {
  if (width < 2 || height < 2) return CENTRE;
  const at = (x: number, y: number) => (y * width + x) * channels;
  const luma = new Float32Array(width * height);
  const skin = new Uint8Array(width * height);
  let skinCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = at(x, y);
      const r = pixels[i]!, g = pixels[i + 1]!, b = pixels[i + 2]!;
      luma[y * width + x] = 0.299 * r + 0.587 * g + 0.114 * b;
      if (isSkin(r, g, b)) { skin[y * width + x] = 1; skinCount++; }
    }
  }

  if (skinCount >= width * height * 0.005) {
    const band = Math.max(2, Math.round(height / 10));
    const rows = new Float32Array(height);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) rows[y] += skin[y * width + x]!;
    let densest = 0;
    const bands: number[] = [];
    for (let y = 0; y + band <= height; y++) {
      let sum = 0;
      for (let k = 0; k < band; k++) sum += rows[y + k]!;
      bands.push(sum);
      densest = Math.max(densest, sum);
    }
    const top = bands.findIndex(sum => sum >= densest * 0.45);
    if (top >= 0) {
      let sx = 0, sy = 0, n = 0;
      for (let y = top; y < Math.min(height, top + band * 2); y++) {
        for (let x = 0; x < width; x++) if (skin[y * width + x]) { sx += x; sy += y; n++; }
      }
      if (n) return { x: clamp((sx / n + 0.5) / width), y: clamp((sy / n + 0.5) / height) };
    }
  }

  let sx = 0, sy = 0, total = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const energy = Math.abs(luma[i + 1]! - luma[i - 1]!) + Math.abs(luma[i + width]! - luma[i - width]!);
      sx += x * energy; sy += y * energy; total += energy;
    }
  }
  if (!total) return CENTRE;
  const pull = 0.35;
  return {
    x: clamp(((sx / total + 0.5) / width) * (1 - pull) + 0.5 * pull),
    y: clamp(((sy / total + 0.5) / height) * (1 - pull) + 0.5 * pull),
  };
}

export interface Region { x: number; y: number; w: number; h: number }

export function focusFromRegions(found: { faces?: Region[]; salient?: Region[] }): Focus | undefined {
  const faces = (found.faces ?? []).filter(face => face.w * face.h > 0.0005);
  if (faces.length) {
    const biggest = Math.max(...faces.map(face => face.w * face.h));
    const kept = faces.filter(face => face.w * face.h >= biggest * 0.25);
    const left = Math.min(...kept.map(face => face.x));
    const right = Math.max(...kept.map(face => face.x + face.w));
    const top = Math.min(...kept.map(face => face.y));
    const height = Math.max(...kept.map(face => face.h));
    return { x: clamp((left + right) / 2), y: clamp(top - height * 0.35) };
  }
  const salient = found.salient ?? [];
  if (!salient.length) return undefined;
  const left = Math.min(...salient.map(r => r.x));
  const right = Math.max(...salient.map(r => r.x + r.w));
  const top = Math.min(...salient.map(r => r.y));
  const bottom = Math.max(...salient.map(r => r.y + r.h));
  return { x: clamp((left + right) / 2), y: clamp((top + bottom) / 2) };
}

export function objectPosition(focus: Focus): string {
  return `${Math.round(focus.x * 100)}% ${Math.round(focus.y * 100)}%`;
}

const KEY = "ds-focus:";

export function focusImage(image: HTMLImageElement): void {
  const chosen = image.dataset.dsFocus;
  if (chosen && chosen !== "auto") { image.style.objectPosition = chosen; return; }
  const source = image.currentSrc || image.src;
  try {
    const kept = localStorage.getItem(KEY + source);
    if (kept) { image.style.objectPosition = kept; return; }
  } catch {}
  const measure = () => {
    if (!image.naturalWidth) return;
    const width = FOCUS_SAMPLE;
    const height = Math.max(2, Math.round((image.naturalHeight / image.naturalWidth) * width));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    try {
      context.drawImage(image, 0, 0, width, height);
      const position = objectPosition(focusOf(context.getImageData(0, 0, width, height).data, width, height, 4));
      image.style.objectPosition = position;
      try { localStorage.setItem(KEY + source, position); } catch {}
    } catch {}
  };
  if (image.complete) measure();
  else image.addEventListener("load", measure, { once: true });
}

export function startFocus(root: ParentNode = document): void {
  for (const image of root.querySelectorAll<HTMLImageElement>("img[data-ds-focus]")) focusImage(image);
}
