import React, { useState } from 'react';
import { Language, CraftedItem } from '../types/tavern';
import { INGREDIENTS } from '../data/tavernData';
import { generateUnlimitedConcoction } from '../utils/alchemyGenerator';
import { Beer, X, Sparkles, Trophy, Plus, Minus, Shuffle, Trash2 } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface BarBrewingModalProps {
  language: Language;
  onClose: () => void;
  inventory: Record<string, number>;
  onConsumeIngredients: (ingredientIds: string[]) => void;
  onAwardCoco: (amount: number) => void;
  onAwardApple: (source?: string) => void;
  onUnlockStory: (storyId: string) => void;
  onOpenMarket: () => void;
}

export const BarBrewingModal: React.FC<BarBrewingModalProps> = ({
  language,
  onClose,
  inventory,
  onConsumeIngredients,
  onAwardCoco,
  onAwardApple,
  onUnlockStory,
  onOpenMarket
}) => {
  // Map of ingredientId -> count placed into the shaker (NO upper or lower limit: 1 to ALL owned!)
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewedResult, setBrewedResult] = useState<{
    item: CraftedItem;
    gotApple: boolean;
  } | null>(null);

  const availableIngredients = INGREDIENTS.filter((item) => (inventory[item.id] || 0) > 0);

  // Flatten selectedCounts into array of ingredient IDs
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
    // Pick 1 to min(5, total owned) random items
    const picks = Math.max(1, Math.floor(Math.random() * 4) + 1);
    for (let i = 0; i < picks; i++) {
      const randIng = availableIngredients[Math.floor(Math.random() * availableIngredients.length)];
      const maxOwned = inventory[randIng.id] || 0;
      if ((next[randIng.id] || 0) < maxOwned) {
        next[randIng.id] = (next[randIng.id] || 0) + 1;
      }
    }
    setSelectedCounts(next);
  };

  const handleAskForPint = () => {
    sound.playPour();
    setIsBrewing(true);

    setTimeout(() => {
      setIsBrewing(false);
      const gotApple = Math.random() < 0.08;
      const freePint: CraftedItem = {
        id: 'house_ale',
        name: { en: "Phantom's Cold Tavern Draft", zh: 'Phantom的冰镇生啤' },
        type: 'drink',
        description: {
          en: 'Freshly pulled by Phantom from the oak barrel beneath the cobblestones. Crispy, foamy, and clears your head.',
          zh: '由 Phantom 刚从石板下方的橡木大桶里接出的鲜啤，泡沫丰厚冰爽刺喉。'
        },
        effect: { en: '+45 $PHANTOM Tavern Tip', zh: '获得 +45 $PHANTOM 吧台打赏' },
        ingredients: [],
        rarity: 'normal',
        rewardCoco: 45,
        appleDropChance: 0.08,
        icon: '🍺'
      };

      onAwardCoco(freePint.rewardCoco);
      if (gotApple) {
        onAwardApple(language === 'zh' ? 'Phantom吧台打生啤偶遇掉落' : 'Found in Phantom’s Draft Mug');
      }
      setBrewedResult({ item: freePint, gotApple });
    }, 900);
  };

  const handleBrewCustom = () => {
    if (totalSelected < 1) return;

    sound.playPour();
    setIsBrewing(true);

    const used = [...flattenedSelection];
    onConsumeIngredients(used);

    setTimeout(() => {
      setIsBrewing(false);

      const { item, gotApple } = generateUnlimitedConcoction('drink', used);

      onAwardCoco(item.rewardCoco);
      if (gotApple) {
        onAwardApple(language === 'zh' ? 'Phantom摇酒壶底奇遇掉落' : 'Found in Phantom’s Cocktail Shaker');
        onUnlockStory('story_rotten_appl');
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.65 }
        });
      }

      setBrewedResult({ item, gotApple });
      setSelectedCounts({});
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-600/50 rounded-2xl p-5 md:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍺</span>
            <div>
              <h2 className="text-lg md:text-xl font-cinzel font-bold text-amber-200">
                {language === 'zh' ? 'Phantom的吧台 · 无限混调生啤' : "Phantom's Unlimited Meme Mixology"}
              </h2>
              <p className="text-xs text-stone-400">
                {language === 'zh'
                  ? '放材料毫无数量限制！放1个也能酿，放十几个更能摇出逆天幽灵特调啤酒！（烂苹果专供换股票，绝不入酒）'
                  : 'Zero limits! Toss 1 or dozens of meme ingredients for Phantom to shake into wild brews!'}
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
          {/* Quick Free Draft */}
          <div className="bg-stone-950/80 border border-amber-900/40 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-2xl shrink-0">
                🍻
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  {language === 'zh' ? '找 Phantom 免费讨一杯冰镇生啤' : 'Ask Phantom for a Free House Pint'}
                </h4>
                <p className="text-xs text-stone-400">
                  {language === 'zh'
                    ? '无需消耗材料，直接接满一木杯麦酒，亦有稀有机率掉落烂苹果 APPL！'
                    : 'No ingredients needed—fresh draft from the oak barrel!'}
                </p>
              </div>
            </div>

            <button
              onClick={handleAskForPint}
              disabled={isBrewing}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-amber-300 border border-amber-600/40 font-bold text-xs rounded-lg whitespace-nowrap transition-colors shrink-0"
            >
              {language === 'zh' ? '讨一杯酒' : 'Pour Pint'}
            </button>
          </div>

          {/* Unlimited Shaker Basket */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {language === 'zh'
                    ? `幽灵摇酒壶（已投入 ${totalSelected} 份材料 · 1个到无限个皆可）`
                    : `Spectral Shaker Basket (${totalSelected} tossed · 1 to Unlimited)`}
                </span>
              </h4>

              <div className="flex items-center gap-2">
                {availableIngredients.length > 0 && (
                  <button
                    onClick={handleRandomToss}
                    className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/50 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>{language === 'zh' ? '随机抓一把' : 'Random Toss'}</span>
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

            {/* Active Basket Preview */}
            <div className="min-h-16 bg-stone-950/90 border border-dashed border-amber-700/50 rounded-xl p-3 flex flex-wrap items-center gap-2">
              {totalSelected === 0 ? (
                <p className="w-full text-center text-xs text-stone-500">
                  {language === 'zh'
                    ? '点击下方任意食材投入摇酒壶 —— 放 1 个、3 个、甚至全部梭哈统统支持！'
                    : 'Click ingredients below to toss in—1 item, 5 items, or all-in!'}
                </p>
              ) : (
                Object.entries(selectedCounts).map(([id, count]) => {
                  const ing = INGREDIENTS.find((x) => x.id === id);
                  if (!ing) return null;
                  return (
                    <div
                      key={id}
                      onClick={() => adjustCount(id, -1)}
                      title={language === 'zh' ? '点击减少1份' : 'Click to remove 1'}
                      className="cursor-pointer bg-amber-950/70 border border-amber-500/60 rounded-lg px-2.5 py-1 flex items-center gap-2 text-xs text-amber-100 hover:bg-amber-900/70 transition-colors"
                    >
                      <img
                        src={ing.image}
                        alt={ing.name[language]}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded object-cover"
                      />
                      <span className="font-medium">{ing.name[language]}</span>
                      <span className="font-mono font-bold text-amber-300 tabular-nums">x{count}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Inventory Picker Grid */}
            {availableIngredients.length === 0 ? (
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-5 text-center">
                <p className="text-xs text-stone-400 mb-3">
                  {language === 'zh'
                    ? '背包里暂时没有梗图食材，快去食材集市采购吧！'
                    : 'Your ingredient pouch is empty! Visit the Meme Market to stock up.'}
                </p>
                <button
                  onClick={onOpenMarket}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-lg"
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
                          ? 'bg-amber-950/50 border-amber-500/80'
                          : 'bg-stone-950/70 border-stone-800 hover:border-amber-700/50'
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
                        <span className="w-6 text-center text-xs font-mono font-bold text-amber-300 tabular-nums">
                          {picked}
                        </span>
                        <button
                          onClick={() => adjustCount(ing.id, 1)}
                          disabled={picked >= owned}
                          className="w-7 h-7 rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-30 flex items-center justify-center text-stone-950 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit Brew */}
            <button
              onClick={handleBrewCustom}
              disabled={totalSelected < 1 || isBrewing}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Beer className="w-4 h-4" />
              <span>
                {isBrewing
                  ? language === 'zh'
                    ? 'Phantom 正在疯狂摇壶酿造随机幽灵啤酒……'
                    : 'Phantom is shaking up a random spectral beer...'
                  : language === 'zh'
                    ? `立即随机酿造啤酒！（已放 ${totalSelected} 份材料）`
                    : `Randomly Brew Beer! (${totalSelected} Ingredients)`}
              </span>
            </button>
          </div>

          {/* Result Card */}
          {brewedResult && (
            <div className="bg-stone-950 border border-amber-400 rounded-xl p-4 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="text-4xl bg-stone-900 border border-amber-600/40 p-3 rounded-2xl shrink-0">
                  {brewedResult.item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-amber-200 font-cinzel">
                      {brewedResult.item.name[language]}
                    </h3>
                    <span className="text-xs text-amber-400 font-mono uppercase">
                      ·{' '}
                      {language === 'zh'
                        ? brewedResult.item.rarity === 'mythic'
                          ? '神话'
                          : brewedResult.item.rarity === 'legendary'
                            ? '传说'
                            : brewedResult.item.rarity === 'rare'
                              ? '稀有'
                              : '普通'
                        : brewedResult.item.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    {brewedResult.item.description[language]}
                  </p>
                  <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 tabular-nums">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{brewedResult.item.effect[language]}</span>
                  </div>

                  {brewedResult.gotApple && (
                    <div className="mt-2.5 p-2.5 bg-emerald-950/60 border border-emerald-500/60 rounded-lg flex items-center gap-2 text-xs text-emerald-200 font-bold">
                      <span className="text-lg">🍏</span>
                      <span>
                        {language === 'zh'
                          ? '奇遇掉落！酒杯底沉着一颗被咬了一口的烂苹果 (APPL)！快去股票柜台 1:1 兑换代币化股票！'
                          : 'Rare Drop! A bitten Rotten Apple (APPL) appeared—redeem it 1:1 for Tokenized Stock!'}
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
