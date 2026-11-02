import { Language } from '../types/tavern';
import { MEME_FORGE_CHARACTERS, MEME_FORGE_BACKDROPS } from '../data/tavernData';
import { loadCutoutDataUrl } from './cutout';

export interface PlacedMemeSticker {
  id: string;
  emoji: string;
  xPct: number;
  yPct: number;
  size: number;
}

export interface RenderMemeParams {
  canvas: HTMLCanvasElement;
  language: Language;
  aspect: 'square' | 'wide';
  backdropId: string;
  customBgUrl: string | null;
  primaryCharId: string;
  primaryPos: { x: number; y: number };
  primaryScale: number;
  primaryFlip: boolean;
  secondaryCharId: string | null;
  secondaryPos: { x: number; y: number };
  secondaryScale: number;
  secondaryFlip: boolean;
  stickers: PlacedMemeSticker[];
  topText: string;
  bottomText: string;
  textColor: string;
  fontScale: number;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const hasSpaces = trimmed.includes(' ');
  const tokens = hasSpaces ? trimmed.split(/\s+/) : Array.from(trimmed);
  const joiner = hasSpaces ? ' ' : '';

  const lines: string[] = [];
  let current = '';

  for (const token of tokens) {
    const candidate = current ? `${current}${joiner}${token}` : token;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = token;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export async function renderMemeCompositionToCanvas(params: RenderMemeParams): Promise<void> {
  const {
    canvas,
    language,
    aspect,
    backdropId,
    customBgUrl,
    primaryCharId,
    primaryPos,
    primaryScale,
    primaryFlip,
    secondaryCharId,
    secondaryPos,
    secondaryScale,
    secondaryFlip,
    stickers,
    topText,
    bottomText,
    textColor,
    fontScale
  } = params;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // 1. Draw Backdrop
  const chosenBackdrop = MEME_FORGE_BACKDROPS.find((b) => b.id === backdropId);
  let drewBg = false;

  if (customBgUrl) {
    try {
      const bgImg = await loadImageElement(customBgUrl);
      const scale = Math.max(W / bgImg.width, H / bgImg.height);
      const dw = bgImg.width * scale;
      const dh = bgImg.height * scale;
      ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
      drewBg = true;
    } catch {
      // fallback below
    }
  } else if (chosenBackdrop?.src) {
    try {
      const bgImg = await loadImageElement(chosenBackdrop.src);
      const scale = Math.max(W / bgImg.width, H / bgImg.height);
      const dw = bgImg.width * scale;
      const dh = bgImg.height * scale;
      ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
      drewBg = true;
    } catch {
      // fallback below
    }
  }

  if (!drewBg) {
    const cols = chosenBackdrop?.colorGradient || ['#1c1917', '#292524', '#0c0a09'];
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, cols[0]);
    grad.addColorStop(0.5, cols[1]);
    grad.addColorStop(1, cols[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // Darken top & bottom bands slightly so meme captions have crisp contrast
  const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.3);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.72)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, H * 0.3);

  const botGrad = ctx.createLinearGradient(0, H * 0.68, 0, H);
  botGrad.addColorStop(0, 'rgba(0,0,0,0)');
  botGrad.addColorStop(1, 'rgba(0,0,0,0.76)');
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, H * 0.68, W, H * 0.32);

  // 2. Draw Transparent Cutout Characters
  const drawChar = async (
    charId: string | null,
    pos: { x: number; y: number },
    scalePct: number,
    flip: boolean
  ) => {
    if (!charId) return;
    const entry = MEME_FORGE_CHARACTERS.find((c) => c.id === charId);
    if (!entry) return;
    try {
      const cutoutUrl = await loadCutoutDataUrl(entry.src);
      const img = await loadImageElement(cutoutUrl);
      const targetH = H * 0.54 * (scalePct / 100);
      const ratio = img.width / Math.max(1, img.height);
      const targetW = targetH * ratio;
      const cx = (pos.x / 100) * W;
      const cy = (pos.y / 100) * H;

      ctx.save();
      ctx.translate(cx, cy);
      if (flip) ctx.scale(-1, 1);
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
    } catch {
      // ignore
    }
  };

  await drawChar(secondaryCharId, secondaryPos, secondaryScale, secondaryFlip);
  await drawChar(primaryCharId, primaryPos, primaryScale, primaryFlip);

  // 3. Draw Stickers
  for (const st of stickers) {
    ctx.save();
    ctx.font = `${Math.round(st.size * (W / 1080))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 14;
    ctx.fillText(st.emoji, (st.xPct / 100) * W, (st.yPct / 100) * H);
    ctx.restore();
  }

  // 4. Draw Classic Outlined Meme Captions (Safe Padding so glyphs NEVER clip top or bottom!)
  const rawBasePx = Math.round((aspect === 'square' ? 54 : 46) * (fontScale / 100));
  const maxTextW = W * 0.88;

  const drawSafeBlock = (rawText: string, position: 'top' | 'bottom') => {
    const clean = rawText.trim();
    if (!clean) return;

    const displayStr = clean.toUpperCase();
    let px = rawBasePx;
    ctx.save();
    ctx.font = `900 ${px}px Impact, "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif`;
    let lines = wrapCanvasText(ctx, displayStr, maxTextW);

    // Auto-scale slightly down if 3 lines so text stays punchy & never crowds characters
    if (lines.length >= 3) {
      px = Math.round(rawBasePx * 0.84);
      ctx.font = `900 ${px}px Impact, "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif`;
      lines = wrapCanvasText(ctx, displayStr, maxTextW);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = Math.max(8, Math.round(px * 0.19));
    ctx.fillStyle = textColor;

    const lineStep = Math.round(px * 1.22);
    const safeEdgePad = Math.max(54, Math.round(px * 0.85));

    if (position === 'top') {
      lines.forEach((line, idx) => {
        const centerY = safeEdgePad + idx * lineStep;
        ctx.strokeText(line, W / 2, centerY);
        ctx.fillText(line, W / 2, centerY);
      });
    } else {
      const bottomMostCenterY = H - safeEdgePad - 16;
      const firstLineCenterY = bottomMostCenterY - (lines.length - 1) * lineStep;
      lines.forEach((line, idx) => {
        const centerY = firstLineCenterY + idx * lineStep;
        ctx.strokeText(line, W / 2, centerY);
        ctx.fillText(line, W / 2, centerY);
      });
    }
    ctx.restore();
  };

  drawSafeBlock(topText, 'top');
  drawSafeBlock(bottomText, 'bottom');

  // Subtle corner mark
  ctx.save();
  ctx.font = '700 18px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(253, 230, 138, 0.55)';
  ctx.fillText(
    language === 'zh' ? 'Phantom酒馆' : 'PHANTOM TAVERN',
    W - 22,
    H - 12
  );
  ctx.restore();
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, prefix = 'phantom-tavern-meme'): Promise<void> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve();
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prefix}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
      resolve();
    }, 'image/png');
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode PNG blob'));
    }, 'image/png');
  });
}

export async function copyCanvasImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false;
  }
  try {
    // Passing Promise<Blob> synchronously inside ClipboardItem preserves user-gesture activation
    // even when clicking an <a target="_blank"> link that immediately shifts window focus!
    const item = new ClipboardItem({
      'image/png': canvasToPngBlob(canvas)
    });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    return false;
  }
}

export function canSystemShareImageFiles(): boolean {
  try {
    if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) {
      return false;
    }
    const probe = new File([new Uint8Array([137, 80, 78, 71])], 'meme.png', { type: 'image/png' });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export function buildTweetShareText(params: {
  language: Language;
  topText: string;
  bottomText: string;
}): string {
  const { language, topText, bottomText } = params;
  const top = topText.trim();
  const bot = bottomText.trim();
  const caption = [top, bot].filter(Boolean).join(' — ');

  return language === 'zh'
    ? `🍻 ${caption || '来自Phantom酒馆的最新梗图！'}\n\n#PhantomTavern #PHANTOM #APPL`
    : `🍻 ${caption || 'Fresh brew from Phantom Tavern!'}\n\n#PhantomTavern #Phantom #Ghost #APPL`;
}

export async function shareCanvasViaSystemSheet(
  canvas: HTMLCanvasElement,
  params: { language: Language; topText: string; bottomText: string }
): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (!canSystemShareImageFiles()) return 'unsupported';
  try {
    const blob = await canvasToPngBlob(canvas);
    const file = new File([blob], `phantom-tavern-meme-${Date.now()}.png`, { type: 'image/png' });
    const text = buildTweetShareText(params);
    await navigator.share({
      files: [file],
      title: params.language === 'zh' ? 'Phantom酒馆梗图' : 'Phantom Tavern Meme',
      text
    });
    return 'shared';
  } catch (err: any) {
    if (err?.name === 'AbortError') return 'cancelled';
    return 'unsupported';
  }
}

export async function uploadCanvasForTwitterCard(
  canvas: HTMLCanvasElement,
  params: { language: Language; topText: string; bottomText: string }
): Promise<string | null> {
  try {
    // Export compact high-clarity JPEG data URL for fast (<80ms) server Twitter Card minting
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const res = await fetch('/api/meme/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDataUrl: dataUrl,
        topText: params.topText,
        bottomText: params.bottomText,
        language: params.language
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.shareUrl === 'string' ? data.shareUrl : null;
  } catch {
    return null;
  }
}

export function buildXShareIntentUrl(params: {
  language: Language;
  topText: string;
  bottomText: string;
  shareCardUrl?: string | null;
}): string {
  const shareBody = buildTweetShareText(params);
  const query = new URLSearchParams({ text: shareBody });
  if (params.shareCardUrl) {
    query.set('url', params.shareCardUrl);
  }
  return `https://x.com/intent/tweet?${query.toString()}`;
}

