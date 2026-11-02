import React, { useState, useEffect } from 'react';
import {
  Language,
  CharacterId,
  ChatMessage,
  TavernStory,
  TavernView,
  TavernRoomId,
  TavernSceneCommand,
  GroundingSource,
  Ingredient,
  MemeDraftConfig,
  TavernArtStyle
} from './types/tavern';
import {
  INITIAL_CHAT_LOG,
  CHARACTER_DATA,
  INGREDIENTS,
  ROTTEN_APPLE_IMAGE_SRC
} from './data/tavernData';
import { Header } from './components/Header';
import { TavernScene } from './components/TavernScene';
import { DialogueBox } from './components/DialogueBox';
import { BarBrewingModal } from './components/BarBrewingModal';
import { KitchenCauldronModal } from './components/KitchenCauldronModal';
import { IngredientMarket } from './components/IngredientMarket';
import { ApplExchangeModal } from './components/ApplExchangeModal';
import { StoryBookModal } from './components/StoryBookModal';
import { MarketAnalysisView } from './components/MarketAnalysisView';
import { MemeForgeView } from './components/MemeForgeView';
import { MemeQuickModal } from './components/MemeQuickModal';
import { generateSmartDialogue, matchesPresetLoreTopic } from './utils/dialogueEngine';
import { buildContextualMemeDraft } from './utils/memeTopicHelper';
import { sound } from './utils/audio';
import confetti from 'canvas-confetti';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');

  // Player Currency & Assets
  const [cocoBalance, setCocoBalance] = useState<number>(() => {
    const saved =
      localStorage.getItem('phantom_tavern_balance_v1') ??
      localStorage.getItem('dark_tavern_coco');
    return saved !== null ? Number(saved) : 1200;
  });

  const [appleBalance, setAppleBalance] = useState<number>(() => {
    const saved =
      localStorage.getItem('phantom_tavern_appl_v1') ??
      localStorage.getItem('dark_tavern_apple');
    return saved !== null ? Number(saved) : 0;
  });

  const [stockShares, setStockShares] = useState<number>(() => {
    const saved =
      localStorage.getItem('phantom_tavern_shares_v1') ??
      localStorage.getItem('dark_tavern_shares');
    return saved !== null ? Number(saved) : 0;
  });

  // Inventory of 15 genuine meme ingredients ONLY (rotten_apple is strictly excluded!)
  const [inventory, setInventory] = useState<Record<string, number>>(() => {
    const saved =
      localStorage.getItem('phantom_tavern_inv_v1') ??
      localStorage.getItem('dark_tavern_inventory_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        delete parsed.rotten_apple;
        return parsed;
      } catch {
        // fallback
      }
    }
    return {
      doge_coin: 3,
      pepe_tears: 2,
      halloween_pumpkin: 2,
      wojak_brain: 2,
      wif_beanie: 2,
      chill_brew: 2,
      bome_tome: 2,
      sad_violin: 1,
      gigachad_jaw: 1,
      hopium_flask: 2,
      laser_eyes: 1,
      diamond_hands: 1,
      moon_cheese: 1
    };
  });

  // Unlocked Stories (Fresh Phantom & Ghost Chronicles)
  const [unlockedStoryIds, setUnlockedStoryIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('phantom_tavern_stories_v1');
    return saved
      ? JSON.parse(saved)
      : [
          'story_genesis_ghosts',
          'story_crypto_shadows',
          'story_exchange_puppeteers',
          'story_just_bartender_chef',
          'story_rotten_appl'
        ];
  });

  // Navigation, Scene Settings & Modals
  const [activeView, setActiveView] = useState<TavernView>('tavern');
  const [currentRoomId, setCurrentRoomId] = useState<TavernRoomId>('main_hall');
  const [brightnessLevel, setBrightnessLevel] = useState<number>(() => {
    const saved = localStorage.getItem('phantom_tavern_brightness_v2');
    return saved !== null ? Math.max(95, Math.min(200, Number(saved))) : 135;
  });
  const [artStyle, setArtStyle] = useState<TavernArtStyle>(() => {
    const saved =
      localStorage.getItem('phantom_tavern_art_style_v1') ??
      localStorage.getItem('dark_tavern_art_style');
    return saved === 'classic' ? 'classic' : 'ps1';
  });
  const [sceneCommand, setSceneCommand] = useState<TavernSceneCommand | null>(null);
  const [isBrewingOpen, setIsBrewingOpen] = useState(false);
  const [isKitchenOpen, setIsKitchenOpen] = useState(false);
  const [quickMemeDraft, setQuickMemeDraft] = useState<MemeDraftConfig | null>(null);
  const [forgeInitialDraft, setForgeInitialDraft] = useState<MemeDraftConfig | null>(null);

  // Character Dialogue State (Strictly isolated per language so EN and ZH never mix!)
  const [activeCharacter, setActiveCharacter] = useState<CharacterId>('phantom');
  const [chatLogs, setChatLogs] = useState<Record<Language, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('phantom_tavern_chat_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.en) && Array.isArray(parsed.zh)) {
          const cleanEn = parsed.en.filter(
            (m: ChatMessage) => m.sender === 'system' || !/[\u4e00-\u9fff]/.test(m.text?.en || '')
          );
          const cleanZh = parsed.zh.filter(
            (m: ChatMessage) => m.sender === 'system' || /[\u4e00-\u9fff]/.test(m.text?.zh || '')
          );
          return {
            en: cleanEn.length > 0 ? cleanEn : INITIAL_CHAT_LOG,
            zh: cleanZh.length > 0 ? cleanZh : INITIAL_CHAT_LOG
          };
        }
      } catch {
        // fallback
      }
    }
    return {
      en: INITIAL_CHAT_LOG,
      zh: INITIAL_CHAT_LOG
    };
  });
  const messages = chatLogs[language];
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist State
  useEffect(() => {
    localStorage.setItem('phantom_tavern_balance_v1', cocoBalance.toString());
    localStorage.setItem('phantom_tavern_appl_v1', appleBalance.toString());
    localStorage.setItem('phantom_tavern_shares_v1', stockShares.toString());
    localStorage.setItem('phantom_tavern_inv_v1', JSON.stringify(inventory));
    localStorage.setItem('phantom_tavern_stories_v1', JSON.stringify(unlockedStoryIds));
    localStorage.setItem(
      'phantom_tavern_chat_v1',
      JSON.stringify({
        en: chatLogs.en.slice(-30),
        zh: chatLogs.zh.slice(-30)
      })
    );
    localStorage.setItem('phantom_tavern_art_style_v1', artStyle);
    localStorage.setItem('phantom_tavern_brightness_v2', brightnessLevel.toString());
  }, [
    cocoBalance,
    appleBalance,
    stockShares,
    inventory,
    unlockedStoryIds,
    chatLogs,
    artStyle,
    brightnessLevel
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3600);
  };

  const handleLanguageChange = (nextLang: Language) => {
    setLanguage(nextLang);
    setToastMessage(null);
  };

  // Instant Zero-Quota Lore + Search-Grounded Live Chat with Coco & Dark
  const handleSendMessage = async (
    text: string,
    character: CharacterId,
    options?: { forcePresetLore?: boolean }
  ): Promise<boolean> => {
    const reqLang = language;
    const useInstantLocalLore =
      Boolean(options?.forcePresetLore) || matchesPresetLoreTopic(text);

    const playerMsg: ChatMessage = {
      id: `player-${Date.now()}`,
      sender: 'player',
      text: { en: text, zh: text },
      timestamp: Date.now()
    };

    // Fast path: Preset Phantom & Ghost lore stories respond in 0ms and consume 0 API quota!
    if (useInstantLocalLore) {
      const dropRoll = Math.random() < 0.08;
      const smartResult = generateSmartDialogue(character, text, reqLang, dropRoll);

      if (smartResult.droppedApple) {
        handleAwardApple(
          smartResult.dropReason ||
            (character === 'phantom'
              ? reqLang === 'zh'
                ? '在吧台听 Phantom 讲创世幽灵秘闻'
                : 'Lore chat with Phantom'
              : reqLang === 'zh'
                ? '在后厨听 Ghost 讲交易所秘闻'
                : 'Lore chat with Ghost')
        );
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now() + 1}`,
        sender: character,
        character,
        text: { en: smartResult.reply, zh: smartResult.reply },
        timestamp: Date.now() + 1,
        hasAppleDrop: smartResult.droppedApple,
        isLiveAI: false,
        sources: []
      };

      setChatLogs((prev) => ({
        ...prev,
        [reqLang]: [...prev[reqLang], playerMsg, botMsg]
      }));
      return smartResult.droppedApple;
    }

    setIsChatLoading(true);
    setChatLogs((prev) => ({
      ...prev,
      [reqLang]: [...prev[reqLang], playerMsg]
    }));

    let reply = '';
    let droppedApple = false;
    let isLiveAI = false;
    let sources: GroundingSource[] = [];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character,
          message: text,
          language: reqLang,
          userHistory: chatLogs[reqLang].slice(-6)
        })
      });

      if (res.ok) {
        const data = await res.json();
        reply = String(data.reply || '');
        if (reqLang === 'en' && /[\u4e00-\u9fff]/.test(reply)) {
          throw new Error('Language mismatch guard');
        }
        droppedApple = Boolean(data.droppedApple);
        isLiveAI = Boolean(data.isLiveAI);
        const rawSources: GroundingSource[] = Array.isArray(data.sources) ? data.sources : [];
        sources = rawSources.filter((s) =>
          reqLang === 'en' ? !/[\u4e00-\u9fff]/.test(s.title) : true
        );

        if (droppedApple) {
          handleAwardApple(
            character === 'phantom'
              ? reqLang === 'zh'
                ? '在吧台与 Phantom 联网夜谈'
                : 'Dialogue with Phantom at the bar'
              : reqLang === 'zh'
                ? '在后厨与 Ghost 联网夜谈'
                : 'Dialogue with Ghost at the kitchen'
          );
        }
      } else {
        throw new Error('Server non-200');
      }
    } catch {
      const dropRoll = Math.random() < 0.08;
      const smartResult = generateSmartDialogue(character, text, reqLang, dropRoll);
      reply = smartResult.reply;
      droppedApple = smartResult.droppedApple;

      if (droppedApple) {
        handleAwardApple(
          smartResult.dropReason ||
            (character === 'phantom'
              ? reqLang === 'zh'
                ? '在吧台与 Phantom 对话'
                : 'Dialogue with Phantom'
              : reqLang === 'zh'
                ? '在后厨与 Ghost 对话'
                : 'Dialogue with Ghost')
        );
      }
    }

    setIsChatLoading(false);

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: character,
      character,
      text: { en: reply, zh: reply },
      timestamp: Date.now(),
      hasAppleDrop: droppedApple,
      isLiveAI,
      sources
    };

    setChatLogs((prev) => ({
      ...prev,
      [reqLang]: [...prev[reqLang], botMsg]
    }));
    return droppedApple;
  };

  // Consume any number of ingredients (1 to unlimited)
  const handleConsumeIngredients = (ingredientIds: string[]) => {
    setInventory((prev) => {
      const next = { ...prev };
      ingredientIds.forEach((id) => {
        if (id !== 'rotten_apple' && next[id] && next[id] > 0) {
          next[id] -= 1;
        }
      });
      return next;
    });
  };

  const handleAwardCoco = (amount: number) => {
    setCocoBalance((prev) => prev + amount);
    sound.playCoin();
    showToast(language === 'zh' ? `🪙 获得 +${amount} $PHANTOM！` : `🪙 +${amount} $PHANTOM earned!`);
  };

  const handleSpendCoco = (amount: number) => {
    setCocoBalance((prev) => Math.max(0, prev - amount));
  };

  // Grant a free random Meme Ingredient from room exploration (strictly never rotten_apple!)
  const handleGrantRandomIngredient = (
    _sourceReason: string,
    minRarity?: 'common' | 'rare'
  ): Ingredient => {
    const pool =
      minRarity === 'rare'
        ? INGREDIENTS.filter((i) => i.rarity === 'rare' || i.rarity === 'legendary')
        : INGREDIENTS;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setInventory((prev) => ({
      ...prev,
      [chosen.id]: (prev[chosen.id] || 0) + 1
    }));
    return chosen;
  };

  // Award Rotten Apple (Exclusive rare drop — ONLY for 1:1 $APPL Tokenized Stock redemption!)
  const handleAwardApple = (source?: string) => {
    setAppleBalance((prev) => prev + 1);
    sound.playAppleBite();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#ef4444', '#eab308']
    });
    showToast(
      language === 'zh'
        ? `🍏 稀有掉落！获得烂苹果 ($APPL) 1 颗！${source ? `（${source}）` : ''}可在股票柜台 1:1 兑换代币化股票！`
        : `🍏 Rare Drop! Rotten Apple (APPL) x1! ${source ? `(${source}) ` : ''}Redeem 1:1 for Tokenized Stock.`
    );
  };

  const handleBuyIngredient = (id: string, cost: number) => {
    if (id === 'rotten_apple' || cocoBalance < cost) return;
    setCocoBalance((prev) => prev - cost);
    setInventory((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    sound.playCoin();
    showToast(
      language === 'zh' ? '🛒 购买食材成功！已存入背包。' : '🛒 Purchased ingredient! Added to bag.'
    );
  };

  const handleBuyRandomBundle = (items: Ingredient[], totalCost: number) => {
    if (cocoBalance < totalCost) return;
    setCocoBalance((prev) => prev - totalCost);
    setInventory((prev) => {
      const next = { ...prev };
      items.forEach((it) => {
        if (it.id !== 'rotten_apple') {
          next[it.id] = (next[it.id] || 0) + 1;
        }
      });
      return next;
    });
    const names = items
      .map((i) => i.name[language])
      .slice(0, 3)
      .join(language === 'zh' ? '、' : ', ');
    showToast(
      language === 'zh'
        ? `🎁 开启五连盲袋！获得 ${names} 等 5 份梗图食材！`
        : `🎁 Opened 5x Mystery Pack! Got ${names} & more!`
    );
  };

  const handleClaimFaucet = () => {
    setCocoBalance((prev) => prev + 250);
    sound.playCoin();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 }
    });
    showToast(
      language === 'zh'
        ? '🎁 领取水龙头福利：+250 $PHANTOM！'
        : '🎁 Faucet claimed: +250 $PHANTOM!'
    );
  };

  // Sole purpose of Rotten Apples: 1:1 redemption for $APPL Tokenized Stock Shares
  const handleRedeemStock = (count: number) => {
    setAppleBalance((prev) => Math.max(0, prev - count));
    setStockShares((prev) => prev + count);
    sound.playAppleBite();
    showToast(
      language === 'zh'
        ? `📜 成功将 ${count} 颗烂苹果 1:1 铸造为 ${count} 股 $APPL 代币化股票！`
        : `📜 Redeemed ${count} Rotten Apples for ${count} $APPL Tokenized Shares!`
    );
  };

  const handleUnlockStory = (storyId: string) => {
    if (!unlockedStoryIds.includes(storyId)) {
      setUnlockedStoryIds((prev) => [...prev, storyId]);
      showToast(
        language === 'zh'
          ? '📖 探索秘室解锁了新的《Phantom酒馆幽灵编年史》章节！'
          : '📖 Exploring unlocked a new Phantom & Ghost Chronicle!'
      );
    }
  };

  const handleAskAboutStory = (story: TavernStory) => {
    setActiveCharacter(story.character);
    setActiveView('tavern');
    void handleSendMessage(
      language === 'zh'
        ? `请详细跟我讲讲《${story.title.zh}》背后的真相！`
        : `Tell me the full truth behind "${story.title.en}"!`,
      story.character,
      { forcePresetLore: true }
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        cocoBalance={cocoBalance}
        appleBalance={appleBalance}
        stockShares={stockShares}
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenFaucet={handleClaimFaucet}
        currentRoomId={currentRoomId}
        onSelectRoom={(roomId) =>
          setSceneCommand({ type: 'switch_room', roomId, nonce: Date.now() })
        }
        onFocusCharacter={(char) =>
          setSceneCommand({ type: 'focus_char', char, nonce: Date.now() })
        }
        onToastHall={() =>
          setSceneCommand({ type: 'toast_hall', nonce: Date.now() })
        }
        brightnessLevel={brightnessLevel}
        onBrightnessChange={setBrightnessLevel}
        artStyle={artStyle}
        onArtStyleChange={(nextStyle) => {
          setArtStyle(nextStyle);
          showToast(
            nextStyle === 'ps1'
              ? language === 'zh'
                ? '🎮 已切换至 90年代 PS1 复古低模酒馆画风！'
                : '🎮 Switched to 90s PS1 Retro Low-Poly Tavern Style!'
              : language === 'zh'
                ? '🖼️ 已一键退回经典手绘原版画风！'
                : '🖼️ Reverted to Original Classic Tavern Art Style!'
          );
        }}
      />

      {toastMessage && (
        <div className="fixed top-14 sm:top-16 left-3 right-3 sm:left-auto sm:right-4 z-50 bg-stone-900/95 border border-amber-500/80 text-amber-200 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 sm:max-w-md">
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 py-2.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* VIEW 1: PANORAMIC MULTI-ROOM EXPLORATION TAVERN */}
        {activeView === 'tavern' && (
          <div className="space-y-4 sm:space-y-6">
            <TavernScene
              language={language}
              cocoBalance={cocoBalance}
              currentRoomId={currentRoomId}
              onRoomChange={setCurrentRoomId}
              brightnessLevel={brightnessLevel}
              onBrightnessChange={setBrightnessLevel}
              artStyle={artStyle}
              onToggleArtStyle={() => {
                setArtStyle((prev) => {
                  const next = prev === 'ps1' ? 'classic' : 'ps1';
                  showToast(
                    next === 'ps1'
                      ? language === 'zh'
                        ? '🎮 已切换至 90年代 PS1 复古低模酒馆画风！'
                        : '🎮 Switched to 90s PS1 Retro Low-Poly Tavern Style!'
                      : language === 'zh'
                        ? '🖼️ 已一键退回经典手绘原版画风！'
                        : '🖼️ Reverted to Original Classic Tavern Art Style!'
                  );
                  return next;
                });
              }}
              sceneCommand={sceneCommand}
              onSelectCharacter={(char) => {
                setActiveCharacter(char);
                sound.playCoin();
              }}
              onOpenBrewing={() => setIsBrewingOpen(true)}
              onOpenKitchen={() => setIsKitchenOpen(true)}
              onFindTavernBonus={(amount, reason) => {
                setCocoBalance((prev) => prev + amount);
                showToast(reason);
              }}
              onSpendCoco={handleSpendCoco}
              onGrantRandomIngredient={handleGrantRandomIngredient}
              onInteractionDropApple={(source) => handleAwardApple(source)}
              onUnlockStory={handleUnlockStory}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              {/* Left 2 Columns: Live Grounded AI Dialogue */}
              <div id="tavern-dialogue-section" className="lg:col-span-2 scroll-mt-16">
                <DialogueBox
                  language={language}
                  currentCharacter={activeCharacter}
                  onSelectCharacter={setActiveCharacter}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onGenerateMemeFromChat={({ character, userPrompt, replyText }) => {
                    sound.playCoin();
                    const draft = buildContextualMemeDraft({
                      language,
                      character,
                      userPrompt,
                      replyText
                    });
                    setQuickMemeDraft(draft);
                  }}
                  onOpenBrewing={() => setIsBrewingOpen(true)}
                  onOpenKitchen={() => setIsKitchenOpen(true)}
                  isLoading={isChatLoading}
                />
              </div>

              {/* Right Column: Quick Access Cards */}
              <div className="flex flex-col justify-between gap-4">
                {/* Active Character Card */}
                <div className="bg-stone-900/90 border border-amber-900/40 rounded-xl p-5 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={CHARACTER_DATA[activeCharacter].avatar}
                      alt={CHARACTER_DATA[activeCharacter].name[language]}
                      className="w-14 h-14 rounded-2xl object-cover border border-amber-500/60 bg-stone-950"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-base font-cinzel font-bold text-amber-200">
                        {CHARACTER_DATA[activeCharacter].name[language]}
                      </h3>
                      <p className="text-xs text-amber-500/90 font-mono">
                        {CHARACTER_DATA[activeCharacter].title[language]}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed italic mb-4">
                    "{CHARACTER_DATA[activeCharacter].tagline[language]}"
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        if (activeCharacter === 'phantom') setIsBrewingOpen(true);
                        else setIsKitchenOpen(true);
                      }}
                      className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                    >
                      {activeCharacter === 'phantom'
                        ? language === 'zh'
                          ? '无限混调啤酒'
                          : 'Mixology Bar'
                        : language === 'zh'
                          ? '无限坩埚熬汤'
                          : 'Skull Cauldron'}
                    </button>

                    <button
                      onClick={() => setActiveView('market')}
                      className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold rounded-lg border border-stone-700 transition-colors whitespace-nowrap"
                    >
                      {language === 'zh' ? '采购15种食材' : '15 Ingredients'}
                    </button>
                  </div>
                </div>

                {/* Live Crypto & US Stock Analysis Card */}
                <div
                  onClick={() => setActiveView('analysis')}
                  className="bg-stone-900/90 border border-amber-600/40 hover:border-amber-400 rounded-xl p-4 shadow-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-amber-200">
                      {language === 'zh' ? '📊 加密货币与美股实时行情分析' : '📊 Live Crypto & US Stock Analysis'}
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">
                      {language === 'zh' ? '实时 →' : 'LIVE →'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {language === 'zh'
                      ? '实时追踪 BTC、ETH、SOL 及美股 NVDA、AAPL、TSLA、QQQ，由潜伏交易所背后的幽灵 Phantom 与 Ghost 联网剖析今日涨跌真相。'
                      : 'Track live BTC, ETH, SOL, BOME & US Stocks (NVDA, AAPL, QQQ) with search-grounded Phantom & Ghost breakdowns.'}
                  </p>
                </div>

                {/* Exclusive $APPL Tokenized Stock Card */}
                <div
                  onClick={() => setActiveView('appl')}
                  className="bg-stone-900/90 border border-emerald-600/40 hover:border-emerald-400 rounded-xl p-4 shadow-xl cursor-pointer transition-colors flex items-center gap-3"
                >
                  <img
                    src={ROTTEN_APPLE_IMAGE_SRC}
                    alt="Rotten Apple APPL"
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-500/50 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-emerald-300">
                      {language === 'zh' ? '$APPL 代币化股票登记处' : '$APPL Tokenized Stock Desk'}
                    </div>
                    <p className="text-xs text-stone-300 truncate mt-0.5 tabular-nums">
                      {language === 'zh'
                        ? `待兑烂苹果: ${appleBalance} 🍏 · 已持股票: ${stockShares} 股`
                        : `Apples: ${appleBalance} 🍏 · Shares: ${stockShares} SH`}
                    </p>
                  </div>
                </div>
                {/* Free Zero-Quota Meme Forge Card */}
                <div
                  onClick={() => setActiveView('meme')}
                  className="bg-stone-900/90 border border-purple-500/40 hover:border-purple-400 rounded-xl p-4 shadow-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-purple-200">
                      {language === 'zh' ? '🎨 免费梗图表情包工坊' : '🎨 Free Tavern Meme Forge'}
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">
                      {language === 'zh' ? '零额度 →' : 'FREE →'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {language === 'zh'
                      ? '用 Phantom、Ghost、佩佩蛙、柴犬与酒馆背景自由拼贴加字，零成本无限次导出高清梗图并分享到推特。'
                      : 'Combine Phantom, Ghost, Pepe, Wojak & Doge with custom captions and download HD PNG memes—zero API quota.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ZERO-COST CANVAS MEME FORGE */}
        {activeView === 'meme' && (
          <MemeForgeView
            language={language}
            initialDraft={forgeInitialDraft}
            onAwardCraftTip={(amount, reason) => {
              setCocoBalance((prev) => prev + amount);
              showToast(reason);
            }}
            onToast={showToast}
            onBackToTavern={() => setActiveView('tavern')}
          />
        )}

        {/* VIEW 2: CRYPTO & US STOCK MARKET ANALYSIS */}
        {activeView === 'analysis' && (
          <MarketAnalysisView
            language={language}
            onGenerateMarketMeme={({
              character,
              symbol,
              changePercent24h,
              userPrompt,
              replyText
            }) => {
              sound.playCoin();
              const draft = buildContextualMemeDraft({
                language,
                character,
                assetSymbol: symbol,
                changePercent24h,
                userPrompt,
                replyText
              });
              setQuickMemeDraft(draft);
            }}
            onBackToTavern={() => setActiveView('tavern')}
          />
        )}

        {/* VIEW 3: INGREDIENT MARKET (15 MEME INGREDIENTS) */}
        {activeView === 'market' && (
          <IngredientMarket
            language={language}
            cocoBalance={cocoBalance}
            inventory={inventory}
            onBuyIngredient={handleBuyIngredient}
            onBuyRandomBundle={handleBuyRandomBundle}
            onClaimFaucet={handleClaimFaucet}
            onBackToTavern={() => setActiveView('tavern')}
          />
        )}

        {/* VIEW 4: APPL TOKENIZED STOCK EXCHANGE */}
        {activeView === 'appl' && (
          <ApplExchangeModal
            language={language}
            appleBalance={appleBalance}
            stockShares={stockShares}
            onRedeemStock={handleRedeemStock}
            onBackToTavern={() => setActiveView('tavern')}
          />
        )}

        {/* VIEW 5: SECRET STORIES CHRONICLES */}
        {activeView === 'stories' && (
          <StoryBookModal
            language={language}
            unlockedStoryIds={unlockedStoryIds}
            onBackToTavern={() => setActiveView('tavern')}
            onAskAboutStory={handleAskAboutStory}
          />
        )}
      </main>

      {isBrewingOpen && (
        <BarBrewingModal
          language={language}
          onClose={() => setIsBrewingOpen(false)}
          inventory={inventory}
          onConsumeIngredients={handleConsumeIngredients}
          onAwardCoco={handleAwardCoco}
          onAwardApple={handleAwardApple}
          onUnlockStory={handleUnlockStory}
          onOpenMarket={() => {
            setIsBrewingOpen(false);
            setActiveView('market');
          }}
        />
      )}

      {isKitchenOpen && (
        <KitchenCauldronModal
          language={language}
          onClose={() => setIsKitchenOpen(false)}
          inventory={inventory}
          onConsumeIngredients={handleConsumeIngredients}
          onAwardCoco={handleAwardCoco}
          onAwardApple={handleAwardApple}
          onUnlockStory={handleUnlockStory}
          onOpenMarket={() => {
            setIsKitchenOpen(false);
            setActiveView('market');
          }}
        />
      )}

      {quickMemeDraft && (
        <MemeQuickModal
          language={language}
          draft={quickMemeDraft}
          onClose={() => setQuickMemeDraft(null)}
          onToast={showToast}
          onOpenInFullForge={(updatedDraft) => {
            setQuickMemeDraft(null);
            setForgeInitialDraft(updatedDraft);
            setActiveView('meme');
          }}
        />
      )}

      <footer className="mt-auto border-t border-stone-900 bg-stone-950 py-4 px-6 text-xs text-stone-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {language === 'zh'
              ? 'Phantom酒馆 · Phantom 与 Ghost · 互联网初代幽灵与三大秘室梗图酒馆'
              : 'Phantom Tavern · Phantom & Ghost · Primordial Internet Specters & 3-Room Meme Pub'}
          </span>
          <span>
            {language === 'zh'
              ? '货币: $PHANTOM · 15种梗图食材 · 烂苹果唯一用途: 1:1 兑换 $APPL 代币化股票'
              : 'Currency: $PHANTOM · 15 Meme Ingredients · Rotten Apple Sole Use: 1:1 $APPL Stock'}
          </span>
        </div>
      </footer>
    </div>
  );
}
