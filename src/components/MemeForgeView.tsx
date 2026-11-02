import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterId, Language, MemeDraftConfig } from '../types/tavern';
import { MEME_FORGE_CHARACTERS, MEME_FORGE_BACKDROPS } from '../data/tavernData';
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
import {
  Download,
  Copy,
  Share2,
  Smartphone,
  Shuffle,
  Upload,
  Plus,
  Trash2,
  FlipHorizontal,
  Sparkles,
  RotateCcw,
  RefreshCw
} from 'lucide-react';

interface MemeForgeViewProps {
  language: Language;
  initialDraft?: MemeDraftConfig | null;
  onAwardCraftTip: (amount: number, reason: string) => void;
  onToast: (msg: string) => void;
  onBackToTavern: () => void;
}

interface PresetJoke {
  top: { en: string; zh: string };
  bottom: { en: string; zh: string };
  primaryCharId: string;
  secondaryCharId: string | null;
  backdropId: string;
}

const PRESET_JOKES: PresetJoke[] = [
  {
    top: {
      en: 'WHEN GLOBAL EXCHANGES LIQUIDATE BILLIONS IN MINUTES',
      zh: '当全球各大交易所五分钟连环插针清算数十亿'
    },
    bottom: {
      en: 'PHANTOM POURING MY FOURTH PINT LIKE HE DID NOT FLIP THE SWITCH',
      zh: '刚在幕后拨完撮合开关又淡定给我满上第四杯冰啤的Phantom'
    },
    primaryCharId: 'phantom',
    secondaryCharId: 'pumpkin_jester',
    backdropId: 'ps1_hall'
  },
  {
    top: {
      en: 'ASKED GHOST HOW MANY CRYPTO TOKENS HE SECRETLY LAUNCHED',
      zh: '追问Ghost这些年暗中操盘了多少个主流币与交易所'
    },
    bottom: {
      en: 'HE JUST LADLED SKULL CAULDRON STEW AND TOLD ME TO EAT UP',
      zh: '他一声不吭从骷髅坩埚舀起一碗热汤让我趁热喝'
    },
    primaryCharId: 'ghost',
    secondaryCharId: 'wojak',
    backdropId: 'cauldron'
  },
  {
    top: {
      en: 'STARING AT ONE MINUTE CANDLES ALL NIGHT',
      zh: '熬夜死盯一分钟线反复追涨杀跌的散户'
    },
    bottom: {
      en: 'CLINKING MUGS WITH CHILL DOGE IN PHANTOM TAVERN',
      zh: '在Phantom酒馆地下酒窖跟肌肉柴犬喝酒摇骰子的赢家'
    },
    primaryCharId: 'doge',
    secondaryCharId: 'chill',
    backdropId: 'cellar'
  },
  {
    top: {
      en: 'BORN AT THE DAWN OF THE INTERNET TO PUPPETEER EXCHANGES',
      zh: '诞生于互联网之初本可幻化万千操控全球交易所'
    },
    bottom: {
      en: 'VIBING IN PHANTOM TAVERN AS A SIMPLE BARTENDER AND CHEF',
      zh: '偏偏隐居酒馆当个快乐调酒师与主厨深藏功与名'
    },
    primaryCharId: 'phantom',
    secondaryCharId: 'ghost',
    backdropId: 'hall'
  },
  {
    top: {
      en: 'GREEN CANDLES ERUPTING ACROSS EVERY EXCHANGE',
      zh: '全网阳线拔地而起直冲云霄的狂欢之夜'
    },
    bottom: {
      en: 'PHANTOM AND GHOST BUYING ROUNDS FOR THE ENTIRE TAVERN',
      zh: '今晚Phantom酒馆全场生啤浓汤由两位幽灵买单'
    },
    primaryCharId: 'stonks',
    secondaryCharId: 'phantom',
    backdropId: 'bull_green'
  }
];

const STICKER_PALETTE = ['🎃', '👻', '🦇', '🍬', '🕸️', '🍺', '🍲', '🚀', '💎', '🔥', '💀', '🪙'];

export const MemeForgeView: React.FC<MemeForgeViewProps> = ({
  language,
  initialDraft,
  onAwardCraftTip,
  onToast,
  onBackToTavern
}) => {
  const [presetIndex, setPresetIndex] = useState(0);
  const [isCustomText, setIsCustomText] = useState(() => Boolean(initialDraft));

  const [topText, setTopText] = useState<string>(
    () => initialDraft?.topText || PRESET_JOKES[0].top[language]
  );
  const [bottomText, setBottomText] = useState<string>(
    () => initialDraft?.bottomText || PRESET_JOKES[0].bottom[language]
  );
  const [textColor, setTextColor] = useState<'#ffffff' | '#fde047' | '#4ade80'>('#ffffff');
  const [fontScale, setFontScale] = useState<number>(96);

  const [backdropId, setBackdropId] = useState<string>(
    () => initialDraft?.backdropId || PRESET_JOKES[0].backdropId
  );
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  const [primaryCharId, setPrimaryCharId] = useState<string>(
    () => initialDraft?.primaryCharId || PRESET_JOKES[0].primaryCharId
  );
  const [primaryPos, setPrimaryPos] = useState<{ x: number; y: number }>({ x: 32, y: 62 });
  const [primaryScale, setPrimaryScale] = useState<number>(98);
  const [primaryFlip, setPrimaryFlip] = useState<boolean>(false);

  const [secondaryCharId, setSecondaryCharId] = useState<string | null>(() =>
    initialDraft !== undefined ? initialDraft?.secondaryCharId ?? null : PRESET_JOKES[0].secondaryCharId
  );
  const [secondaryPos, setSecondaryPos] = useState<{ x: number; y: number }>({ x: 70, y: 64 });
  const [secondaryScale, setSecondaryScale] = useState<number>(92);
  const [secondaryFlip, setSecondaryFlip] = useState<boolean>(true);

  const [stickers, setStickers] = useState<PlacedMemeSticker[]>(() =>
    initialDraft?.stickers
      ? initialDraft.stickers.map((s, i) => ({ id: `init-st-${i}`, ...s }))
      : [{ id: 'st-init-1', emoji: '🍺', xPct: 50, yPct: 54, size: 88 }]
  );

  const [aspect, setAspect] = useState<'square' | 'wide'>('square');
  const [lastTipTime, setLastTipTime] = useState<number>(0);
  const [aiTopicInput, setAiTopicInput] = useState<string>('');
  const [isAiWriting, setIsAiWriting] = useState<boolean>(false);
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const [supportsNativeFileShare] = useState<boolean>(() => canSystemShareImageFiles());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const draggingTargetRef = useRef<
    | { kind: 'primary' }
    | { kind: 'secondary' }
    | { kind: 'sticker'; id: string }
    | null
  >(null);

  // Sync incoming initialDraft if changed
  useEffect(() => {
    if (!initialDraft) return;
    setIsCustomText(true);
    setTopText(initialDraft.topText);
    setBottomText(initialDraft.bottomText);
    setPrimaryCharId(initialDraft.primaryCharId);
    setSecondaryCharId(initialDraft.secondaryCharId);
    setBackdropId(initialDraft.backdropId);
    if (initialDraft.stickers) {
      setStickers(initialDraft.stickers.map((s, i) => ({ id: `dr-${Date.now()}-${i}`, ...s })));
    }
  }, [initialDraft]);

  // Sync preset captions strictly when switching EN <-> ZH so zero cross-language text ever leaks!
  useEffect(() => {
    if (!isCustomText) {
      const joke = PRESET_JOKES[presetIndex] || PRESET_JOKES[0];
      setTopText(joke.top[language]);
      setBottomText(joke.bottom[language]);
    } else if (language === 'en') {
      if (/[\u4e00-\u9fff]/.test(topText) || /[\u4e00-\u9fff]/.test(bottomText)) {
        const joke = PRESET_JOKES[presetIndex] || PRESET_JOKES[0];
        setTopText(joke.top.en);
        setBottomText(joke.bottom.en);
        setIsCustomText(false);
      }
    }
  }, [language, isCustomText, presetIndex, topText, bottomText]);

  const canvasWidth = aspect === 'square' ? 1080 : 1280;
  const canvasHeight = aspect === 'square' ? 1080 : 720;

  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    await renderMemeCompositionToCanvas({
      canvas: canvasRef.current,
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
    });
  }, [
    aspect,
    backdropId,
    bottomText,
    customBgUrl,
    fontScale,
    language,
    primaryCharId,
    primaryFlip,
    primaryPos,
    primaryScale,
    secondaryCharId,
    secondaryFlip,
    secondaryPos,
    secondaryScale,
    stickers,
    textColor,
    topText
  ]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    (async () => {
      await renderCanvas();
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
      }, 420);
    })();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [renderCanvas, language, topText, bottomText]);

  const getCanvasPctCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.max(6, Math.min(94, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(8, Math.min(92, ((e.clientY - rect.top) / rect.height) * 100));
    return { xPct, yPct };
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { xPct, yPct } = getCanvasPctCoords(e);
    e.currentTarget.setPointerCapture(e.pointerId);

    for (let i = stickers.length - 1; i >= 0; i--) {
      const st = stickers[i];
      if (Math.hypot(xPct - st.xPct, yPct - st.yPct) < 9) {
        draggingTargetRef.current = { kind: 'sticker', id: st.id };
        return;
      }
    }
    if (Math.hypot(xPct - primaryPos.x, yPct - primaryPos.y) < 20) {
      draggingTargetRef.current = { kind: 'primary' };
      return;
    }
    if (secondaryCharId && Math.hypot(xPct - secondaryPos.x, yPct - secondaryPos.y) < 20) {
      draggingTargetRef.current = { kind: 'secondary' };
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const target = draggingTargetRef.current;
    if (!target) return;
    const { xPct, yPct } = getCanvasPctCoords(e);

    if (target.kind === 'primary') {
      setPrimaryPos({ x: xPct, y: yPct });
    } else if (target.kind === 'secondary') {
      setSecondaryPos({ x: xPct, y: yPct });
    } else if (target.kind === 'sticker') {
      setStickers((prev) =>
        prev.map((s) => (s.id === target.id ? { ...s, xPct, yPct } : s))
      );
    }
  };

  const handleCanvasPointerUp = () => {
    draggingTargetRef.current = null;
  };

  const handleRandomPreset = () => {
    sound.playDiceRoll();
    const nextIdx = (presetIndex + 1) % PRESET_JOKES.length;
    const joke = PRESET_JOKES[nextIdx];
    setPresetIndex(nextIdx);
    setIsCustomText(false);
    setTopText(joke.top[language]);
    setBottomText(joke.bottom[language]);
    setPrimaryCharId(joke.primaryCharId);
    setSecondaryCharId(joke.secondaryCharId);
    setBackdropId(joke.backdropId);
    setCustomBgUrl(null);
    setPrimaryPos({ x: joke.secondaryCharId ? 31 : 50, y: 62 });
    setSecondaryPos({ x: 70, y: 64 });
  };

  const handleAiGenerateCaption = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAiWriting) return;
    setIsAiWriting(true);
    sound.playCoin();

    const charVoice: CharacterId = primaryCharId === 'ghost' ? 'ghost' : 'phantom';
    const seedTopic =
      aiTopicInput.trim() ||
      (language === 'zh'
        ? '在Phantom酒馆和幽灵调酒师Phantom与主厨Ghost喝酒笑看各大交易所风云'
        : 'Drinking in Phantom Tavern with Phantom, Ghost and Pepe while exchange charts go wild');

    try {
      const res = await fetch('/api/meme/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: seedTopic,
          character: charVoice,
          language
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.topText && data.bottomText) {
          setIsCustomText(true);
          setTopText(data.topText);
          setBottomText(data.bottomText);
          onToast(
            language === 'zh'
              ? '✨ 已为你生成全新 Phantom酒馆 主题梗词！'
              : '✨ AI wrote a fresh Phantom Tavern meme punchline!'
          );
        }
      } else {
        onToast(
          language === 'zh'
            ? '配词服务繁忙，请稍后重试或直接使用免额度随机预设'
            : 'AI caption busy—try again or tap Free Random Preset'
        );
      }
    } catch {
      onToast(
        language === 'zh'
          ? '网络波动，可直接使用免额度随机预设或手动输入'
          : 'Network hiccup—use Free Random Preset or type directly'
      );
    } finally {
      setIsAiWriting(false);
    }
  };

  const handleUploadCustomBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomBgUrl(reader.result);
        sound.playCoin();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSticker = (emoji: string) => {
    sound.playCoin();
    setStickers((prev) => [
      ...prev,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        emoji,
        xPct: 35 + Math.round(Math.random() * 30),
        yPct: 40 + Math.round(Math.random() * 25),
        size: 88
      }
    ]);
  };

  const handleDownloadPng = async () => {
    if (!canvasRef.current) return;
    sound.playTreasureOpen();
    await downloadCanvasAsPng(canvasRef.current);

    const now = Date.now();
    if (now - lastTipTime > 12000) {
      setLastTipTime(now);
      onAwardCraftTip(
        20,
        language === 'zh'
          ? '🎨 梗图导出成功！酒客们笑翻打赏 +20 $PHANTOM！'
          : '🎨 Meme PNG downloaded! Tavern regulars tipped +20 $PHANTOM!'
      );
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
          ? '💾 已为你直接下载高清图片'
          : '💾 Downloaded HD Meme image directly'
      );
    }
  };

  const handlePrepareXShare = () => {
    if (!canvasRef.current) return;
    sound.playCoin();
    // Initiate ClipboardItem synchronously inside click handler BEFORE target="_blank" shifts focus!
    void copyCanvasImageToClipboard(canvasRef.current).then((copied) => {
      if (copied) {
        onToast(
          language === 'zh'
            ? '✅ 推文已附带大图卡片链接，且原图已拷入剪贴板！在推文框按 Ctrl+V / 粘贴即可直接贴入高清原图！'
            : '✅ Tweet includes Large Image Card link + PNG copied to clipboard! Press Ctrl+V / Paste in X to attach raw PNG!'
        );
      } else if (canvasRef.current) {
        void downloadCanvasAsPng(canvasRef.current);
        onToast(
          language === 'zh'
            ? '💾 推文已附带大图卡片链接，同时已自动下载高清原图供上传！'
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
          ? '📲 已调起系统原图分享！选择 X / Twitter 即可直接携带原图发布！'
          : '📲 Opened system share with PNG attached! Pick X / Twitter to post directly!'
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
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-amber-900/40 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>
              {language === 'zh'
                ? '本地画布免费合成 · 支持一键分享到推特'
                : 'Zero Image Quota · Free HD Export & Direct X / Twitter Share'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-amber-200">
            {language === 'zh' ? 'Phantom酒馆梗图表情包工坊' : 'Phantom Tavern Meme Forge'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
            {language === 'zh'
              ? '内置免额度幽灵酒馆爆梗模板，也可输入任意主题用智能配词生成上下金句；支持手指拖动 Phantom、Ghost 与酒客贴纸、一键复制或分享到推特！'
              : 'Use zero-quota Phantom & Ghost templates or type any topic for AI punchlines; drag characters on canvas, download HD PNG, or share straight to X!'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRandomPreset}
            className="min-h-[40px] px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '免额度随机模板' : 'Free Random Preset'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToTavern}
            className="min-h-[40px] px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs sm:text-sm font-semibold rounded-xl border border-stone-700 transition-colors whitespace-nowrap"
          >
            {language === 'zh' ? '返回酒馆' : 'Back to Tavern'}
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 6 Cols: Interactive Canvas Preview + Download / Copy / Share on X */}
        <div className="lg:col-span-6 bg-stone-900/95 border border-stone-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between gap-2 text-xs text-stone-400">
            <span>
              {language === 'zh'
                ? '💡 直接用手指或鼠标在画布上拖动角色与贴纸'
                : '💡 Drag characters & stickers directly on the canvas'}
            </span>
            <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-stone-800 shrink-0">
              <button
                type="button"
                onClick={() => setAspect('square')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  aspect === 'square' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                1:1
              </button>
              <button
                type="button"
                onClick={() => setAspect('wide')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  aspect === 'wide' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                16:9
              </button>
            </div>
          </div>

          <div className="w-full flex items-center justify-center bg-stone-950 rounded-xl border border-amber-900/40 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              style={{ touchAction: 'none' }}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
              className="w-full h-auto max-h-[500px] object-contain cursor-move select-none"
            />
          </div>

          {/* Export & Social Share Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="col-span-2 sm:col-span-2 min-h-[44px] py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-colors"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{language === 'zh' ? '免费下载高清梗图' : 'Download HD PNG'}</span>
            </button>

            <a
              href={xShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handlePrepareXShare}
              className="min-h-[44px] py-2.5 px-3 bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-colors"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>{language === 'zh' ? '发到推特(带图)' : 'Share on X'}</span>
            </a>

            <div className="flex items-center gap-1.5">
              {supportsNativeFileShare ? (
                <button
                  type="button"
                  onClick={handleNativeMobileShare}
                  title={
                    language === 'zh'
                      ? '手机/系统原生分享：直接把PNG原图塞进X/推特App！'
                      : 'System Share: Directly attach PNG image into X / Twitter app!'
                  }
                  className="flex-1 min-h-[44px] py-2.5 px-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === 'zh' ? '原图直发' : 'App PNG'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyImage}
                  title={language === 'zh' ? '复制图片到剪贴板' : 'Copy Meme PNG to Clipboard'}
                  className="flex-1 min-h-[44px] py-2.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 flex items-center justify-center gap-1 text-xs font-semibold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'zh' ? '复制' : 'Copy'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setPrimaryPos({ x: secondaryCharId ? 32 : 50, y: 62 });
                  setSecondaryPos({ x: 70, y: 64 });
                  setStickers([]);
                }}
                title={language === 'zh' ? '重置位置' : 'Reset'}
                className="min-h-[44px] px-2.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700 flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 leading-relaxed">
            {language === 'zh'
              ? '💡 推特发图说明：受浏览器安全沙盒限制，外部网页无法越权向 x.com 输入框强塞本地文件。点击【发到推特(带图)】会自动附带大图预览卡链接并同步把原图拷入剪贴板（进推文框按 Ctrl+V 即贴出原图）；手机端点击【原图直发】可直接把 PNG 原图塞进 X App！'
              : '💡 X Image Tip: Clicking "Share on X" attaches a Twitter Large-Image Card link AND copies the PNG to your clipboard (press Ctrl+V in X to paste raw PNG); on mobile, tap "App PNG" to attach the PNG file directly into the X app!'}
          </p>
        </div>

        {/* Right 6 Cols: Captions (+ Optional AI Writer), Characters, Backdrop & Stickers */}
        <div className="lg:col-span-6 bg-stone-900/95 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-5">
          {/* 1. Top & Bottom Meme Captions + Optional AI Topic Writer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-200">
                {language === 'zh' ? '1. 梗图上下配字' : '1. Top & Bottom Meme Text'}
              </label>
              <div className="flex items-center gap-2">
                {(
                  [
                    { hex: '#ffffff', labelEn: 'White', labelZh: '纯白' },
                    { hex: '#fde047', labelEn: 'Gold', labelZh: '鎏金' },
                    { hex: '#4ade80', labelEn: 'Green', labelZh: '阳线绿' }
                  ] as const
                ).map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setTextColor(c.hex)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                      textColor === c.hex
                        ? 'border-amber-400 bg-stone-800 text-amber-200'
                        : 'border-stone-800 bg-stone-950 text-stone-400'
                    }`}
                  >
                    {language === 'zh' ? c.labelZh : c.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional AI Caption Generator Input */}
            <form onSubmit={handleAiGenerateCaption} className="flex items-center gap-2">
              <input
                type="text"
                value={aiTopicInput}
                onChange={(e) => setAiTopicInput(e.target.value)}
                placeholder={
                  language === 'zh'
                    ? '输入主题让幽灵写梗词（例：BTC暴涨 / 操控交易所的调酒师）…'
                    : 'Optional: Type a topic for AI joke writer (e.g. BTC pump / Phantom & Ghost exchange lore)...'
                }
                className="flex-1 min-w-0 bg-stone-950 border border-purple-800/50 focus:border-purple-400 rounded-xl px-3 py-2 text-base sm:text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAiWriting}
                className="min-h-[38px] px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
              >
                {isAiWriting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{language === 'zh' ? '智能写梗' : 'AI Write'}</span>
              </button>
            </form>

            <input
              type="text"
              value={topText}
              onChange={(e) => {
                setIsCustomText(true);
                setTopText(e.target.value);
              }}
              placeholder={language === 'zh' ? '输入顶部梗图文字…' : 'Enter TOP meme caption...'}
              className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
            />

            <input
              type="text"
              value={bottomText}
              onChange={(e) => {
                setIsCustomText(true);
                setBottomText(e.target.value);
              }}
              placeholder={language === 'zh' ? '输入底部反转文字…' : 'Enter BOTTOM punchline...'}
              className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
            />

            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span className="shrink-0">{language === 'zh' ? '字号大小:' : 'Font Size:'}</span>
              <input
                type="range"
                min="65"
                max="125"
                value={fontScale}
                onChange={(e) => setFontScale(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-amber-300 tabular-nums w-10 text-right">{fontScale}%</span>
            </div>
          </div>

          {/* 2. Character Selector */}
          <div className="space-y-3 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-200">
                {language === 'zh' ? '2. 选择主角与搭档角色' : '2. Choose Characters'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrimaryFlip((f) => !f)}
                  className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-lg text-xs flex items-center gap-1"
                >
                  <FlipHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'zh' ? '翻转主角' : 'Flip Lead'}</span>
                </button>

                {secondaryCharId ? (
                  <button
                    type="button"
                    onClick={() => setSecondaryCharId(null)}
                    className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 text-red-300 border border-stone-800 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '移除搭档' : 'Solo Mode'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSecondaryCharId('pepe')}
                    className="px-2.5 py-1 bg-stone-950 hover:bg-stone-800 text-emerald-300 border border-stone-800 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '添加双人搭档' : 'Add 2nd Character'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {MEME_FORGE_CHARACTERS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    sound.playCoin();
                    setPrimaryCharId(ch.id);
                  }}
                  className={`px-2 py-2 rounded-xl text-xs font-medium border transition-colors truncate ${
                    primaryCharId === ch.id
                      ? 'bg-amber-600 text-stone-950 border-amber-400 font-bold'
                      : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
                  }`}
                >
                  {ch.name[language]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-400">
              <span className="shrink-0">{language === 'zh' ? '主角缩放:' : 'Lead Scale:'}</span>
              <input
                type="range"
                min="55"
                max="145"
                value={primaryScale}
                onChange={(e) => setPrimaryScale(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-amber-300 tabular-nums w-10 text-right">{primaryScale}%</span>
            </div>

            {secondaryCharId && (
              <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span className="font-semibold">
                    {language === 'zh' ? '第二搭档角色:' : '2nd Partner Character:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSecondaryFlip((f) => !f)}
                    className="text-xs text-stone-300 hover:text-white flex items-center gap-1"
                  >
                    <FlipHorizontal className="w-3 h-3" />
                    <span>{language === 'zh' ? '镜像翻转' : 'Flip'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {MEME_FORGE_CHARACTERS.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSecondaryCharId(ch.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs shrink-0 border transition-colors ${
                        secondaryCharId === ch.id
                          ? 'bg-purple-600 text-white border-purple-400 font-bold'
                          : 'bg-stone-900 text-stone-300 border-stone-800'
                      }`}
                    >
                      {ch.name[language]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Backdrop & Custom Image Upload */}
          <div className="space-y-2.5 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-200">
                {language === 'zh' ? '3. 背景场景或上传底图' : '3. Backdrop or Custom Photo'}
              </span>

              <label className="px-3 py-1 bg-stone-950 hover:bg-stone-800 text-emerald-300 border border-emerald-700/50 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? '上传本地图片' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCustomBg}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {MEME_FORGE_BACKDROPS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    setCustomBgUrl(null);
                    setBackdropId(bg.id);
                  }}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium border transition-colors truncate ${
                    !customBgUrl && backdropId === bg.id
                      ? 'bg-amber-600 text-stone-950 border-amber-400 font-bold'
                      : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
                  }`}
                >
                  {bg.name[language]}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Quick Sticker Stamps */}
          <div className="space-y-2 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-200">
                {language === 'zh' ? '4. 点击盖章贴纸（可自由拖动）' : '4. Tap to Add Stickers (Draggable)'}
              </span>
              {stickers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setStickers([])}
                  className="text-stone-400 hover:text-red-300 text-xs"
                >
                  {language === 'zh' ? '清空贴纸' : 'Clear Stickers'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STICKER_PALETTE.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => handleAddSticker(em)}
                  className="w-10 h-10 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/60 text-xl flex items-center justify-center transition-colors"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
