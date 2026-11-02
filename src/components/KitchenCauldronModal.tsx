import React, { useState } from 'react';
import { Language, CraftedItem } from '../types/tavern';
import { INGREDIENTS, CAULDRON_IMAGE_SRC } from '../data/tavernData';
import { generateUnlimitedConcoction } from '../utils/alchemyGenerator';
import { Flame, X, Trophy, Plus, Minus, Shuffle, Trash2 } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface KitchenCauldronModalProps {
  language: Language;
  onClose: () => void;
  inventory: Record<string, number>;
  onConsumeIngredients: (ingredientIds: string[]) => void;
  onAwardCoco: (amount: number) => void;
  onAwardApple: (source?: string) => void;
  onUnlockStory: (storyId: string) => void;
  onOpenMarket: () => void;
}

export const KitchenCauldronModal: React.FC<KitchenCauldronModalProps> = ({
  language,
  onClose,
  inventory,
  onConsumeIngredients,
  onAwardCoco,
  onAwardApple,
  onUnlockStory,
  onOpenMarket
}) => {
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});
  const [isSimmering, setIsSimmering] = useState(false);
  const [cookedResult, setCookedResult] = useState<{
    item: CraftedItem;
    gotApple: boolean;
  } | null>(null);

  const availableIngredients = INGREDIENTS.filter((item) => (inventory[item.id] || 0) > 0);

  const flattenedSelection: string[] = [];
  Object.entries(selectedCounts).forEach(([id, count]) => {
    for (let i = 0; i < count; i++) {
      flattenedSelection.push(id);
    }
  });
  const totalSelected = flattenedSelection.length;

  const adjustCount = (id: string, delta: number) => {
    const maxOwned = inventory[id] || 0;
    sound.playCoin();
    setSelectedCounts((prev) => {
      const current = prev[id] || 0;
      const nextVal = Math.max(0, Math.min(maxOwned, current + delta));
      const copy = { ...prev };
      if (nextVal <= 0) delete copy[id];
      else copy[id] = nextVal;
      return copy;
    });
  };

  const handleRandomToss = () => {
    if (availableIngredients.length === 0) return;
    sound.playCoin();
    const next: Record<string, number> = {};
    const picks = Math.max(1, Math.floor(Math.random() * 5) + 1);
    for (let i = 0; i < picks; i++) {
      const randIng = availableIngredients[Math.floor(Math.random() * availableIngredients.length)];
      const maxOwned = inventory[randIng.id] || 0;
      if ((next[randIng.id] || 0) < maxOwned) {
        next[randIng.id] = (next[randIng.id] || 0) + 1;
      }
    }
    setSelectedCounts(next);
  };

  const handleTasteStew = () => {
    sound.playCauldronBoil();
    setIsSimmering(true);

    setTimeout(() => {
      setIsSimmering(false);
      const gotApple = Math.random() < 0.08;
      const freeSoup: CraftedItem = {
        id: 'cauldron_ladle',
        name: { en: "A Ladle of Ghost's Daily Stew", zh: 'Ghost大锅当日例汤' },
        type: 'soup',
        description: {
          en: 'Scooped by Ghost from the purple-green skull cauldron. Spicy, hot, and hums with early-internet static.',
          zh: '由 Ghost 从紫绿骷髅大坩埚深处捞起的一满勺，辛香烫舌，泛着淡淡的初代网络紫蓝微光。'
        },
        effect: { en: '+50 $PHANTOM Culinary Tip', zh: '获得 +50 $PHANTOM 后厨打赏' },
        ingredients: [],
        rarity: 'normal',
        rewardCoco: 50,
        appleDropChance: 0.08,
        icon: '🥣'
      };

      onAwardCoco(freeSoup.rewardCoco);
      if (gotApple) {
        onAwardApple(language === 'zh' ? '品尝Ghost后厨老汤偶遇掉落' : 'Surfaced in Ghost’s Daily Stew');
      }
      setCookedResult({ item: freeSoup, gotApple });
    }, 950);
  };

  const handleCookSoup = () => {
    if (totalSelected < 1) return;

    sound.playCauldronBoil();
    setIsSimmering(true);

    const used = [...flattenedSelection];
    onConsumeIngredients(used);

    setTimeout(() => {
      setIsSimmering(false);

      const { item, gotApple } = generateUnlimitedConcoction('soup', used);

      onAwardCoco(item.rewardCoco);
      onUnlockStory('story_genesis_ghosts');

      if (gotApple) {
        onAwardApple(language === 'zh' ? '坩埚浓汤沸腾浮出烂苹果' : 'Surfaced from the Boiling Cauldron');
        onUnlockStory('story_rotten_appl');
        confetti({
          particleCount: 95,
          spread: 80,
          origin: { y: 0.65 }
        });
      }

      setCookedResult({ item, gotApple });
      setSelectedCounts({});
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-purple-500/50 rounded-2xl p-5 md:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with Original Cauldron Thumbnail */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <img
              src={CAULDRON_IMAGE_SRC}
              alt="Cauldron"
              referrerPolicy="no-referrer"
              className={`w-12 h-12 rounded-full object-cover border-2 border-purple-400 shadow-lg ${
                isSimmering ? 'animate-spin' : ''
              }`}
            />
            <div>
              <h2 className="text-lg md:text-xl font-cinzel font-bold text-purple-200">
                {language === 'zh' ? 'Ghost的后厨 · 紫绿骷髅大坩埚' : "Ghost's Unlimited Skull Cauldron"}
              </h2>
              <p className="text-xs text-stone-400">
                {language === 'zh'
                  ? '下料毫无限制！丢1个也能煮，丢一堆更能随机炼出神级幽灵浓汤！（烂苹果仅限换股票，绝不下锅）'
                  : 'Zero limits! Toss 1 or dozens of meme ingredients into Ghost’s cauldron for random spectral soups!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Quick Free Stew */}
          <div className="bg-stone-950/80 border border-purple-900/40 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-purple-950/60 border border-purple-600/40 flex items-center justify-center text-2xl shrink-0">
                🥣
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-200">
                  {language === 'zh' ? '免费尝一勺 Ghost 的当日老汤' : "Taste Ghost's Free Daily Ladle"}
                </h4>
                <p className="text-xs text-stone-400">
                  {language === 'zh'
                    ? '无需食材，直接舀一勺热腾腾紫绿浓汤，也有小概率从锅底捞出烂苹果 APPL！'
                    : 'No ingredients needed—sample a hot ladle straight from the pot!'}
                </p>
              </div>
            </div>

            <button
              onClick={handleTasteStew}
              disabled={isSimmering}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-purple-300 border border-purple-600/40 font-bold text-xs rounded-lg whitespace-nowrap transition-colors shrink-0"
            >
              {language === 'zh' ? '尝一口汤' : 'Taste Stew'}
            </button>
          </div>

          {/* Unlimited Cauldron Pot */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-purple-400" />
                <span>
                  {language === 'zh'
                    ? `坩埚投料池（已投入 ${totalSelected} 份材料 · 1个到无限个随意下锅）`
                    : `Cauldron Pot (${totalSelected} tossed · 1 to Unlimited)`}
                </span>
              </h4>

              <div className="flex items-center gap-2">
                {availableIngredients.length > 0 && (
                  <button
                    onClick={handleRandomToss}
                    className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700/50 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>{language === 'zh' ? '随机抓一把下锅' : 'Random Toss'}</span>
                  </button>
                )}
                {totalSelected > 0 && (
                  <button
                    onClick={() => setSelectedCounts({})}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'zh' ? '清空' : 'Clear'}</span>
                  </button>
                )}
                <button
                  onClick={onOpenMarket}
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-mono"
                >
                  {language === 'zh' ? '+ 进货食材' : '+ Buy More'}
                </button>
              </div>
            </div>

            {/* Tossed Items Preview */}
            <div className="min-h-16 bg-stone-950/90 border border-dashed border-purple-700/50 rounded-xl p-3 flex flex-wrap items-center gap-2">
              {totalSelected === 0 ? (
                <p className="w-full text-center text-xs text-stone-500">
                  {language === 'zh'
                    ? '点击下方食材丢进紫绿骷髅大坩埚 —— 不限种类、不限数量，随机熬制万变奇汤！'
                    : 'Click ingredients below to throw into the cauldron—any quantity, unlimited combinations!'}
                </p>
              ) : (
                Object.entries(selectedCounts).map(([id, count]) => {
                  const ing = INGREDIENTS.find((x) => x.id === id);
                  if (!ing) return null;
                  return (
                    <div
                      key={id}
                      onClick={() => adjustCount(id, -1)}
                      title={language === 'zh' ? '点击捞出1份' : 'Click to remove 1'}
                      className="cursor-pointer bg-purple-950/70 border border-purple-500/60 rounded-lg px-2.5 py-1 flex items-center gap-2 text-xs text-purple-100 hover:bg-purple-900/70 transition-colors"
                    >
                      <img
                        src={ing.image}
                        alt={ing.name[language]}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded object-cover"
                      />
                      <span className="font-medium">{ing.name[language]}</span>
                      <span className="font-mono font-bold text-emerald-300 tabular-nums">x{count}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Inventory Grid */}
            {availableIngredients.length === 0 ? (
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-5 text-center">
                <p className="text-xs text-stone-400 mb-3">
                  {language === 'zh'
                    ? '背包空了！快去食材集市买点梗图猛料回来熬汤吧！'
                    : 'Your bag is empty! Head to the Meme Market to buy ingredients.'}
                </p>
                <button
                  onClick={onOpenMarket}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg"
                >
                  {language === 'zh' ? '前往食材集市' : 'Visit Meme Market'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {availableIngredients.map((ing) => {
                  const owned = inventory[ing.id] || 0;
                  const picked = selectedCounts[ing.id] || 0;

                  return (
                    <div
                      key={ing.id}
                      className={`rounded-xl p-2.5 border flex items-center justify-between gap-2.5 transition-colors ${
                        picked > 0
                          ? 'bg-purple-950/50 border-purple-400/80'
                          : 'bg-stone-950/70 border-stone-800 hover:border-purple-700/50'
                      }`}
                    >
                      <div
                        onClick={() => adjustCount(ing.id, 1)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                      >
                        <img
                          src={ing.image}
                          alt={ing.name[language]}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-lg object-cover shrink-0 border border-stone-700"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-100 truncate">
                            {ing.name[language]}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono tabular-nums">
                            {language === 'zh' ? `库存: ${owned}` : `Bag: ${owned}`} · {ing.price} $PHANTOM
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => adjustCount(ing.id, -1)}
                          disabled={picked <= 0}
                          className="w-7 h-7 rounded-md bg-stone-800 hover:bg-stone-700 disabled:opacity-30 flex items-center justify-center text-stone-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-purple-300 tabular-nums">
                          {picked}
                        </span>
                        <button
                          onClick={() => adjustCount(ing.id, 1)}
                          disabled={picked >= owned}
                          className="w-7 h-7 rounded-md bg-purple-600 hover:bg-purple-500 disabled:opacity-30 flex items-center justify-center text-white font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit Soup */}
            <button
              onClick={handleCookSoup}
              disabled={totalSelected < 1 || isSimmering}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Flame className="w-4 h-4" />
              <span>
                {isSimmering
                  ? language === 'zh'
                    ? 'Ghost 正搅动骷髅大坩埚，沸腾炼汤中……'
                    : 'Ghost is simmering spectral soup in the skull cauldron...'
                  : language === 'zh'
                    ? `开火随机熬汤！（已投入 ${totalSelected} 份材料）`
                    : `Simmer Random Soup! (${totalSelected} Ingredients)`}
              </span>
            </button>
          </div>

          {/* Result Card */}
          {cookedResult && (
            <div className="bg-stone-950 border border-purple-400 rounded-xl p-4 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="text-4xl bg-stone-900 border border-purple-600/40 p-3 rounded-2xl shrink-0">
                  {cookedResult.item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-purple-200 font-cinzel">
                      {cookedResult.item.name[language]}
                    </h3>
                    <span className="text-xs text-purple-400 font-mono uppercase">
                      ·{' '}
                      {language === 'zh'
                        ? cookedResult.item.rarity === 'mythic'
                          ? '神话'
                          : cookedResult.item.rarity === 'legendary'
                            ? '传说'
                            : cookedResult.item.rarity === 'rare'
                              ? '稀有'
                              : '普通'
                        : cookedResult.item.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    {cookedResult.item.description[language]}
                  </p>
                  <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 tabular-nums">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{cookedResult.item.effect[language]}</span>
                  </div>

                  {cookedResult.gotApple && (
                    <div className="mt-2.5 p-2.5 bg-emerald-950/60 border border-emerald-500/60 rounded-lg flex items-center gap-2 text-xs text-emerald-200 font-bold">
                      <span className="text-lg">🍏</span>
                      <span>
                        {language === 'zh'
                          ? '奇遇掉落！浓汤里浮出了一颗被咬了一口的烂苹果 (APPL)！快去股票柜台 1:1 兑换代币化股票！'
                          : 'Rare Drop! A bitten Rotten Apple (APPL) surfaced—redeem it 1:1 for Tokenized Stock!'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
