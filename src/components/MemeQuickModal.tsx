import React, { useState, useEffect, useRef } from 'react';
import { CharacterId, Language, MemeDraftConfig } from '../types/tavern';
import {
  PlacedMemeSticker,
  renderMemeCompositionToCanvas,
  downloadCanvasAsPng,
  copyCanvasImageToClipboard,
  canSystemShareImageFiles,
  shareCanvasViaSystemSheet,
  uploadCanvasForTwitterCard,
  buildXShareIntentUrl
} from '../utils/memeCanvasRenderer';
import { sound } from '../utils/audio';
import { Download, Copy, Share2, Smartphone, Sparkles, Sliders, X, RefreshCw } from 'lucide-react';

interface MemeQuickModalProps {
  language: Language;
  draft: MemeDraftConfig;
  onClose: () => void;
  onOpenInFullForge: (updatedDraft: MemeDraftConfig) => void;
  onToast: (msg: string) => void;
}

export const MemeQuickModal: React.FC<MemeQuickModalProps> = ({
  language,
  draft,
  onClose,
  onOpenInFullForge,
  onToast
}) => {
  const [topText, setTopText] = useState(draft.topText);
  const [bottomText, setBottomText] = useState(draft.bottomText);
  const [primaryPos, setPrimaryPos] = useState<{ x: number; y: number }>({
    x: draft.secondaryCharId ? 31 : 50,
    y: 62
  });
  const [secondaryPos, setSecondaryPos] = useState<{ x: number; y: number }>({
    x: 70,
    y: 64
  });
  const [stickers, setStickers] = useState<PlacedMemeSticker[]>(() =>
    (draft.stickers || [{ emoji: '🍺', xPct: 50, yPct: 52, size: 88 }]).map((s, i) => ({
      id: `qst-${i}`,
      ...s
    }))
  );
  const [isAiWriting, setIsAiWriting] = useState(false);
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const [supportsNativeFileShare] = useState<boolean>(() => canSystemShareImageFiles());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<
    | { kind: 'primary' }
    | { kind: 'secondary' }
    | { kind: 'sticker'; id: string }
    | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const canvas = canvasRef.current;
    if (!canvas) return;
    (async () => {
      await renderMemeCompositionToCanvas({
        canvas,
        language,
        aspect: 'square',
        backdropId: draft.backdropId,
        customBgUrl: null,
        primaryCharId: draft.primaryCharId,
        primaryPos,
        primaryScale: 98,
        primaryFlip: false,
        secondaryCharId: draft.secondaryCharId,
        secondaryPos,
        secondaryScale: 92,
        secondaryFlip: true,
        stickers,
        topText,
        bottomText,
        textColor: '#ffffff',
        fontScale: 96
      });
      if (cancelled) return;
      timer = window.setTimeout(async () => {
        if (!canvasRef.current || cancelled) return;
        const url = await uploadCanvasForTwitterCard(canvasRef.current, {
          language,
          topText,
          bottomText
        });
        if (!cancelled && url) {
          setShareCardUrl(url);
        }
      }, 380);
    })();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [draft, language, topText, bottomText, primaryPos, secondaryPos, stickers]);

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      xPct: Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100)),
      yPct: Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100))
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { xPct, yPct } = getCoords(e);
    e.currentTarget.setPointerCapture(e.pointerId);

    for (let i = stickers.length - 1; i >= 0; i--) {
      if (Math.hypot(xPct - stickers[i].xPct, yPct - stickers[i].yPct) < 9) {
        dragRef.current = { kind: 'sticker', id: stickers[i].id };
        return;
      }
    }
    if (Math.hypot(xPct - primaryPos.x, yPct - primaryPos.y) < 20) {
      dragRef.current = { kind: 'primary' };
      return;
    }
    if (draft.secondaryCharId && Math.hypot(xPct - secondaryPos.x, yPct - secondaryPos.y) < 20) {
      dragRef.current = { kind: 'secondary' };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const { xPct, yPct } = getCoords(e);
    if (dragRef.current.kind === 'primary') setPrimaryPos({ x: xPct, y: yPct });
    else if (dragRef.current.kind === 'secondary') setSecondaryPos({ x: xPct, y: yPct });
    else {
      const targetId = dragRef.current.id;
      setStickers((prev) => prev.map((s) => (s.id === targetId ? { ...s, xPct, yPct } : s)));
    }
  };

  const handleAiRewrite = async () => {
    if (isAiWriting) return;
    setIsAiWriting(true);
    sound.playCoin();
    try {
      const res = await fetch('/api/meme/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: draft.contextTopic || `${topText} ${bottomText}`,
          character: (draft.character || 'phantom') as CharacterId,
          language
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.topText && data.bottomText) {
          setTopText(data.topText);
          setBottomText(data.bottomText);
          onToast(
            language === 'zh'
              ? '✨ 已根据当前话题生成全新梗图配词！'
              : '✨ Fresh AI meme punchline generated!'
          );
        }
      } else {
        onToast(
          language === 'zh'
            ? '配词接口繁忙，可直接手动修改文字'
            : 'Caption generator busy—edit text directly below'
        );
      }
    } catch {
      onToast(
        language === 'zh'
          ? '网络波动，可直接修改下方梗图文字'
          : 'Network hiccup—edit captions directly below'
      );
    } finally {
      setIsAiWriting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    const ok = await copyCanvasImageToClipboard(canvasRef.current);
    if (ok) {
      sound.playCoin();
      onToast(
        language === 'zh'
          ? '📋 梗图已复制到剪贴板！可直接粘贴发送'
          : '📋 Meme image copied to clipboard! Ready to paste'
      );
    } else {
      await downloadCanvasAsPng(canvasRef.current);
      onToast(
        language === 'zh'
          ? '💾 当前浏览器不支持剪贴板存图，已为你直接下载图片'
          : '💾 Downloaded PNG directly for easy upload'
      );
    }
  };

  const handlePrepareXShare = () => {
    if (!canvasRef.current) return;
    sound.playCoin();
    void copyCanvasImageToClipboard(canvasRef.current).then((copied) => {
      if (copied) {
        onToast(
          language === 'zh'
            ? '✅ 推文已附带大图卡片链接，且原图已拷入剪贴板！在推文框按 Ctrl+V / 粘贴即可贴入高清原图！'
            : '✅ Tweet includes Large Image Card link + PNG copied to clipboard! Press Ctrl+V / Paste in X to attach raw PNG!'
        );
      } else if (canvasRef.current) {
        void downloadCanvasAsPng(canvasRef.current);
        onToast(
          language === 'zh'
            ? '💾 推文已附带大图卡片链接，同时已为你下载高清原图！'
            : '💾 Tweet includes Large Image Card link + HD PNG downloaded!'
        );
      }
    });
  };

  const handleNativeMobileShare = async () => {
    if (!canvasRef.current) return;
    sound.playCoin();
    const res = await shareCanvasViaSystemSheet(canvasRef.current, {
      language,
      topText,
      bottomText
    });
    if (res === 'shared') {
      onToast(
        language === 'zh'
          ? '📲 已调起系统原图分享！选择 X / Twitter 即可直接带图发布！'
          : '📲 Opened system share with PNG attached! Pick X / Twitter to post!'
      );
    }
  };

  const xShareUrl = buildXShareIntentUrl({
    language,
    topText,
    bottomText,
    shareCardUrl
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-900 border border-amber-500/60 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl space-y-3.5 my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-800">
          <div>
            <h3 className="text-base font-cinzel font-bold text-amber-200">
              {language === 'zh' ? '🎨 Phantom酒馆 · 对话与行情梗图' : '🎨 Phantom Tavern · Contextual Meme'}
            </h3>
            <p className="text-[11px] text-stone-400">
              {language === 'zh'
                ? '可直接在画面上拖动 Phantom、Ghost 与角色贴纸调整位置，或修改下方配字'
                : 'Drag Phantom, Ghost & stickers directly on canvas or tweak captions below'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Draggable Meme Canvas */}
        <div className="w-full bg-stone-950 rounded-xl border border-stone-800 overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={1080}
            height={1080}
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => {
              dragRef.current = null;
            }}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
            className="w-full max-h-[340px] sm:max-h-[390px] w-auto object-contain cursor-move select-none"
          />
        </div>

        {/* Editable Top & Bottom Captions + Optional AI Rewrite */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-300">
              {language === 'zh' ? '梗图配字（默认免额度自动提取）' : 'Meme Captions (Auto-extracted · 0 Quota)'}
            </span>
            <button
              type="button"
              disabled={isAiWriting}
              onClick={handleAiRewrite}
              className="px-2.5 py-1 bg-purple-950/90 hover:bg-purple-900 disabled:opacity-50 text-purple-200 border border-purple-500/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {isAiWriting ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 text-purple-300" />
              )}
              <span>{language === 'zh' ? '智能换一句梗词' : 'AI Rewrite Joke'}</span>
            </button>
          </div>

          <input
            type="text"
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
            placeholder={language === 'zh' ? '顶部文字…' : 'Top caption...'}
            className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-3 py-2 text-base sm:text-xs text-stone-100 focus:outline-none"
          />
          <input
            type="text"
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            placeholder={language === 'zh' ? '底部反转文字…' : 'Bottom punchline...'}
            className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-3 py-2 text-base sm:text-xs text-stone-100 focus:outline-none"
          />
        </div>

        {/* Action Bar: Download PNG + Copy + Share to X (Twitter) + Full Studio */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={async () => {
              if (!canvasRef.current) return;
              sound.playTreasureOpen();
              await downloadCanvasAsPng(canvasRef.current);
              onToast(
                language === 'zh' ? '💾 高清梗图已保存！' : '💾 HD Meme PNG downloaded!'
              );
            }}
            className="min-h-[40px] px-2.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'zh' ? '下载图片' : 'Download'}</span>
          </button>

          {supportsNativeFileShare ? (
            <button
              type="button"
              onClick={handleNativeMobileShare}
              className="min-h-[40px] px-2.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'zh' ? '原图直发' : 'App PNG'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopyImage}
              className="min-h-[40px] px-2.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-xs rounded-xl border border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{language === 'zh' ? '复制图片' : 'Copy Image'}</span>
            </button>
          )}

          <a
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handlePrepareXShare}
            className="min-h-[40px] px-2.5 py-2 bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'zh' ? '发到推特' : 'Share on X'}</span>
          </a>

          <button
            type="button"
            onClick={() =>
              onOpenInFullForge({
                ...draft,
                topText,
                bottomText
              })
            }
            className="min-h-[40px] px-2.5 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/40 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'zh' ? '深度编辑' : 'Full Studio'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
