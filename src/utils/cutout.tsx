import React, { useEffect, useState } from 'react';

const cutoutCache = new Map<string, string>();
const darkBgSourceSet = new Set<string>();

export function loadCutoutDataUrl(src: string): Promise<string> {
  if (cutoutCache.has(src)) {
    return Promise.resolve(cutoutCache.get(src)!);
  }
  // PNG cutouts in /assets/aistudio/*_cutout.png already have real alpha channels
  if (src.endsWith('_cutout.png')) {
    cutoutCache.set(src, src);
    return Promise.resolve(src);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const maxDim = 560;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        const isDarkCorner = (cx: number, cy: number) => {
          const i = (cy * w + cx) * 4;
          return Math.max(data[i], data[i + 1], data[i + 2]) <= 32;
        };

        // Branch 1: Pitch-black background with glowing spectral aura (e.g. Phantom & Ghost)
        if (
          isDarkCorner(0, 0) &&
          isDarkCorner(w - 1, 0) &&
          isDarkCorner(0, h - 1) &&
          isDarkCorner(w - 1, h - 1)
        ) {
          darkBgSourceSet.add(src);

          // 1. Identify solid core body & colorful trucker-cap pixels (excluding dim purple-on-black aura)
          const rawSolid = new Uint8Array(w * h);
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const pos = y * w + x;
              const idx = pos * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              if (g >= 92 || (r >= 150 && r - b >= 22)) {
                rawSolid[pos] = 1;
              }
            }
          }

          // Filter out isolated 1-2px aura sparks so only genuine body/cap clusters remain
          const cleanCore = new Uint8Array(w * h);
          for (let y = 2; y < h - 2; y++) {
            for (let x = 2; x < w - 2; x++) {
              const pos = y * w + x;
              if (!rawSolid[pos]) continue;
              let neighbors = 0;
              for (let dy = -2; dy <= 2; dy++) {
                const rowOff = (y + dy) * w + x;
                for (let dx = -2; dx <= 2; dx++) {
                  neighbors += rawSolid[rowOff + dx];
                }
              }
              if (neighbors >= 9) {
                cleanCore[pos] = 1;
              }
            }
          }

          // Protect internal black features (eyes, mouth, cap text "Viber"/"GEM", cap brim & outlines)
          const protectedMask = new Uint8Array(w * h);
          const dilateR = Math.max(4, Math.round(w * 0.011));
          for (let y = 0; y < h; y++) {
            let rowFirst = -1;
            let rowLast = -1;
            let rowCount = 0;
            for (let x = 0; x < w; x++) {
              if (cleanCore[y * w + x]) {
                if (rowFirst === -1) rowFirst = x;
                rowLast = x;
                rowCount++;
              }
            }

            // Fill across horizontal cap/face spans so internal black lettering, visor & eyes stay 100% opaque
            if (rowCount >= 8 && rowFirst !== -1 && y < h * 0.68) {
              const pad = y < h * 0.36 ? dilateR : 2;
              const startX = Math.max(0, rowFirst - pad);
              const endX = Math.min(w - 1, rowLast + pad);
              for (let x = startX; x <= endX; x++) {
                protectedMask[y * w + x] = 1;
              }
            }
          }

          // Also radially dilate cleanCore across the whole figure (protects dark sleeve cuffs & bottom hem)
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              if (!cleanCore[y * w + x]) continue;
              const y0 = Math.max(0, y - dilateR);
              const y1 = Math.min(h - 1, y + dilateR);
              const x0 = Math.max(0, x - dilateR);
              const x1 = Math.min(w - 1, x + dilateR);
              for (let yy = y0; yy <= y1; yy++) {
                const rOff = yy * w;
                for (let xx = x0; xx <= x1; xx++) {
                  protectedMask[rOff + xx] = 1;
                }
              }
            }
          }

          // Convert outer black background to transparent & outer purple lightning aura to smooth glowing alpha
          let minX = w;
          let minY = h;
          let maxX = 0;
          let maxY = 0;

          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const pos = y * w + x;
              const idx = pos * 4;
              if (protectedMask[pos]) {
                data[idx + 3] = 255;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                continue;
              }

              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const maxC = Math.max(r, g, b);

              if (maxC <= 20) {
                data[idx + 3] = 0;
              } else {
                const norm = Math.min(1, (maxC - 20) / 135);
                const alpha = Math.max(0, Math.min(255, Math.round(Math.pow(norm, 0.85) * 255)));
                const denom = Math.max(36, alpha);
                data[idx] = Math.min(255, Math.round((r * 255) / denom));
                data[idx + 1] = Math.min(255, Math.round((g * 255) / denom));
                data[idx + 2] = Math.min(255, Math.round((b * 255) / denom));
                data[idx + 3] = alpha;

                if (alpha >= 18) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }
          }

          ctx.putImageData(imageData, 0, 0);

          // Auto-trim empty black margins so the ghost stands tall with tight bounds
          if (maxX > minX && maxY > minY) {
            const pad = 6;
            const cx = Math.max(0, minX - pad);
            const cy = Math.max(0, minY - pad);
            const cw = Math.min(w - cx, maxX - minX + 1 + pad * 2);
            const ch = Math.min(h - cy, maxY - minY + 1 + pad * 2);
            const trimCanvas = document.createElement('canvas');
            trimCanvas.width = cw;
            trimCanvas.height = ch;
            const trimCtx = trimCanvas.getContext('2d');
            if (trimCtx) {
              trimCtx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
              const trimmedUrl = trimCanvas.toDataURL('image/png');
              cutoutCache.set(src, trimmedUrl);
              resolve(trimmedUrl);
              return;
            }
          }

          const darkOutUrl = canvas.toDataURL('image/png');
          cutoutCache.set(src, darkOutUrl);
          resolve(darkOutUrl);
          return;
        }

        // Branch 2: Light/white corner-seeded BFS flood-fill cutout (for Meme patrons & tables)
        const cornerR = data[0];
        const cornerG = data[1];
        const cornerB = data[2];

        const isBgPixel = (idx: number) => {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const isNeutralLight = r >= 165 && g >= 165 && b >= 160 && maxC - minC <= 18;
          const nearCorner =
            cornerR > 190 &&
            Math.abs(r - cornerR) < 30 &&
            Math.abs(g - cornerG) < 30 &&
            Math.abs(b - cornerB) < 30;
          return isNeutralLight || nearCorner;
        };

        const visited = new Uint8Array(w * h);
        const queue = new Int32Array(w * h);
        let head = 0;
        let tail = 0;

        const tryEnqueue = (x: number, y: number) => {
          const pos = y * w + x;
          if (visited[pos]) return;
          if (isBgPixel(pos * 4)) {
            visited[pos] = 1;
            queue[tail++] = pos;
          }
        };

        for (let x = 0; x < w; x++) {
          tryEnqueue(x, 0);
          tryEnqueue(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          tryEnqueue(0, y);
          tryEnqueue(w - 1, y);
        }

        while (head < tail) {
          const pos = queue[head++];
          data[pos * 4 + 3] = 0;
          const x = pos % w;
          const y = (pos - x) / w;
          if (x > 0) tryEnqueue(x - 1, y);
          if (x < w - 1) tryEnqueue(x + 1, y);
          if (y > 0) tryEnqueue(x, y - 1);
          if (y < h - 1) tryEnqueue(x, y + 1);
        }

        let minX = w;
        let minY = h;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const pos = y * w + x;
            if (!visited[pos]) {
              const idx = pos * 4;
              if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
                const transparentNeighbors =
                  visited[pos - 1] + visited[pos + 1] + visited[pos - w] + visited[pos + w];
                if (transparentNeighbors > 0 && data[idx] > 215 && data[idx + 1] > 215 && data[idx + 2] > 210) {
                  data[idx + 3] = 85;
                }
              }
              if (data[idx + 3] >= 100) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);

        // Tight auto-trim with ZERO bottom margin so table legs, barrels, stools & boots sit flush on the floor!
        if (maxX > minX && maxY > minY) {
          const sidePad = 3;
          const topPad = 3;
          const cx = Math.max(0, minX - sidePad);
          const cy = Math.max(0, minY - topPad);
          const cw = Math.min(w - cx, maxX - minX + 1 + sidePad * 2);
          const ch = Math.min(h - cy, maxY - cy + 1);
          const trimCanvas = document.createElement('canvas');
          trimCanvas.width = cw;
          trimCanvas.height = ch;
          const trimCtx = trimCanvas.getContext('2d');
          if (trimCtx) {
            trimCtx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
            const trimmedUrl = trimCanvas.toDataURL('image/png');
            cutoutCache.set(src, trimmedUrl);
            resolve(trimmedUrl);
            return;
          }
        }

        const resultDataUrl = canvas.toDataURL('image/png');
        cutoutCache.set(src, resultDataUrl);
        resolve(resultDataUrl);
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

const ps1CutoutCache = new Map<string, string>();

// Classic 4x4 Bayer ordered dithering matrix (-7.5 .. +7.5) for authentic 1990s PS1 RGB555 textures
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

export async function loadPs1RetroSpriteDataUrl(
  src: string,
  targetMaxDim = 148
): Promise<string> {
  const cacheKey = `${src}::${targetMaxDim}`;
  if (ps1CutoutCache.has(cacheKey)) {
    return ps1CutoutCache.get(cacheKey)!;
  }

  const baseCleanUrl = await loadCutoutDataUrl(src);
  const isSpectralGhost = darkBgSourceSet.has(src);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const effectiveMax = isSpectralGhost ? Math.max(targetMaxDim, 210) : targetMaxDim;
        const scale = Math.min(1, effectiveMax / Math.max(img.width, img.height));
        const w = Math.max(24, Math.round(img.width * scale));
        const h = Math.max(24, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(baseCleanUrl);
          return;
        }

        // Nearest-neighbor point sampling for jagged PS1 geometry/texels
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        if (isSpectralGhost) {
          // Spectral PS1 ghosts (Phantom & Ghost) already feature low-poly facets + purple aura:
          // Apply authentic RGB555 5-bit Bayer quantization while keeping crisp white sheet & semi-transparent PS1 aura!
          for (let y = 0; y < h; y++) {
            const bayerRow = BAYER_4X4[y & 3];
            for (let x = 0; x < w; x++) {
              const idx = (y * w + x) * 4;
              const a = d[idx + 3];
              if (a < 22) {
                d[idx + 3] = 0;
                continue;
              }
              const dither = (bayerRow[x & 3] - 7.5) * 1.15;
              d[idx] = Math.max(0, Math.min(255, Math.round((d[idx] + dither) / 8) * 8));
              d[idx + 1] = Math.max(0, Math.min(255, Math.round((d[idx + 1] + dither) / 8) * 8));
              d[idx + 2] = Math.max(0, Math.min(255, Math.round((d[idx + 2] + dither) / 8) * 8));
              // Quantize aura alpha into classic PS1 4-level semi-transparency steps
              d[idx + 3] = a >= 220 ? 255 : a >= 135 ? 185 : a >= 65 ? 115 : 58;
            }
          }

          ctx.putImageData(imgData, 0, 0);
          const spectralOut = canvas.toDataURL('image/png');
          ps1CutoutCache.set(cacheKey, spectralOut);
          resolve(spectralOut);
          return;
        }

        // First snap alpha to crisp binary PS1 cutout mask for standard Meme patrons
        const alphaMask = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) {
          alphaMask[i] = d[i * 4 + 3] >= 115 ? 1 : 0;
        }

        for (let y = 0; y < h; y++) {
          const bayerRow = BAYER_4X4[y & 3];
          // Bright, warm chandelier & pumpkin-lantern shade so PS1 sprites pop clearly on the stone floor
          const verticalTorchShade = 1.12 - (y / h) * 0.09;

          for (let x = 0; x < w; x++) {
            const p = y * w + x;
            const idx = p * 4;
            if (!alphaMask[p]) {
              d[idx + 3] = 0;
              continue;
            }

            // Detect 1-texel silhouette rim
            const isEdge =
              x === 0 ||
              x === w - 1 ||
              y === 0 ||
              y === h - 1 ||
              !alphaMask[p - 1] ||
              !alphaMask[p + 1] ||
              !alphaMask[p - w] ||
              !alphaMask[p + w];

            let r = d[idx];
            let g = d[idx + 1];
            let b = d[idx + 2];

            // Keep vibrant PS1 colors with crisp 5-bit palette character
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            const sat = 0.92;
            r = luma + (r - luma) * sat;
            g = luma + (g - luma) * sat;
            b = luma + (b - luma) * sat;

            // Bright golden Halloween tavern light lift
            r = r * 1.08 * verticalTorchShade;
            g = g * 1.03 * verticalTorchShade;
            b = b * 0.94 * verticalTorchShade;

            if (isEdge) {
              r *= 0.52;
              g *= 0.48;
              b *= 0.44;
            }

            // Ordered Bayer dither + 5-bit per channel RGB555 PlayStation quantization (step = 8)
            const dither = (bayerRow[x & 3] - 7.5) * 1.25;
            r = Math.max(0, Math.min(255, Math.round((r + dither) / 8) * 8));
            g = Math.max(0, Math.min(255, Math.round((g + dither) / 8) * 8));
            b = Math.max(0, Math.min(255, Math.round((b + dither) / 8) * 8));

            d[idx] = r;
            d[idx + 1] = g;
            d[idx + 2] = b;
            d[idx + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const outUrl = canvas.toDataURL('image/png');
        ps1CutoutCache.set(cacheKey, outUrl);
        resolve(outUrl);
      } catch {
        resolve(baseCleanUrl);
      }
    };
    img.onerror = () => resolve(baseCleanUrl);
    img.src = baseCleanUrl;
  });
}

/**
 * Corner-seeded BFS / Spectral dark-background cutout hook (with optional PS1 Retro 3D texel mode).
 */
export function useCutoutSprite(
  src: string,
  fallbackSrc?: string,
  ps1Retro = false,
  ps1MaxDim = 148
): string {
  const [processedUrl, setProcessedUrl] = useState<string>(() => {
    if (ps1Retro) {
      return ps1CutoutCache.get(`${src}::${ps1MaxDim}`) || cutoutCache.get(src) || src;
    }
    return cutoutCache.get(src) || src;
  });

  useEffect(() => {
    let cancelled = false;
    const loader = ps1Retro
      ? loadPs1RetroSpriteDataUrl(src, ps1MaxDim)
      : loadCutoutDataUrl(src);

    loader.then((url) => {
      if (!cancelled) {
        setProcessedUrl(url || fallbackSrc || src);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [src, fallbackSrc, ps1Retro, ps1MaxDim]);

  return processedUrl;
}

interface CutoutImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  draggable?: boolean;
  ps1Retro?: boolean;
  ps1MaxDim?: number;
}

export const CutoutImage: React.FC<CutoutImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  draggable,
  ps1Retro = false,
  ps1MaxDim = 148
}) => {
  const url = useCutoutSprite(src, fallbackSrc, ps1Retro, ps1MaxDim);
  const [failed, setFailed] = useState(false);

  if (failed && !fallbackSrc) {
    return (
      <div className={`flex items-center justify-center bg-stone-900/80 border border-amber-500/40 rounded-2xl p-3 text-2xl ${className}`}>
        🍺
      </div>
    );
  }

  return (
    <img
      src={failed && fallbackSrc ? fallbackSrc : url}
      alt={alt}
      draggable={draggable}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={ps1Retro ? { imageRendering: 'pixelated' } : undefined}
      className={className}
    />
  );
};
