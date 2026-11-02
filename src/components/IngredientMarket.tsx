import React, { useState } from 'react';
import { Language, Ingredient } from '../types/tavern';
import { INGREDIENTS } from '../data/tavernData';
import { Plus, Check, Gift, Shuffle } from 'lucide-react';
import { sound } from '../utils/audio';

interface IngredientMarketProps {
  language: Language;
  cocoBalance: number;
  inventory: Record<string, number>;
  onBuyIngredient: (ingredientId: string, cost: number) => void;
  onBuyRandomBundle?: (items: Ingredient[], totalCost: number) => void;
  onClaimFaucet: () => void;
  onBackToTavern: () => void;
}

export const IngredientMarket: React.FC<IngredientMarketProps> = ({
  language,
  cocoBalance,
  inventory,
  onBuyIngredient,
  onBuyRandomBundle,
  onClaimFaucet,
  onBackToTavern
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'meme' | 'crypto' | 'spooky'>('all');

  const filteredIngredients = INGREDIENTS.filter(
    (item) => categoryFilter === 'all' || item.category === categoryFilter
  );

  const handleBuy = (id: string, price: number) => {
    if (cocoBalance < price) return;
    sound.playCoin();
    onBuyIngredient(id, price);
  };

  const bundleCost = 360;
  const handleBuyMysteryPack = () => {
    if (!onBuyRandomBundle || cocoBalance < bundleCost) return;
    const picks: Ingredient[] = [];
    for (let i = 0; i < 5; i++) {
      picks.push(INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)]);
    }
    sound.playTreasureOpen();
    onBuyRandomBundle(picks, bundleCost);
  };

  const rarityLabel = (rarity: Ingredient['rarity']) => {
    if (language === 'zh') {
      return rarity === 'legendary' ? '传说' : rarity === 'rare' ? '稀有' : '普通';
    }
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const categoryLabel = (cat: Ingredient['category']) => {
    if (language === 'zh') {
      return cat === 'meme' ? '经典梗图' : cat === 'crypto' ? '链上加密' : '万圣诡物';
    }
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-amber-900/40 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div>
          <div className="text-xs font-mono text-amber-400 mb-1.5">
            {language === 'zh'
              ? `Phantom酒馆黑市 · 共收录 ${INGREDIENTS.length} 种纯正梗图炼金食材`
              : `Phantom Tavern Bazaar · ${INGREDIENTS.length} Authentic Meme Ingredients`}
          </div>
          <h2 className="text-xl md:text-2xl font-cinzel font-bold text-amber-200">
            {language === 'zh' ? 'Phantom酒馆食材集市' : 'Phantom Tavern Meme Market'}
          </h2>
          <p className="text-xs md:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
            {language === 'zh'
              ? '使用 $PHANTOM 选购任意数量的梗图材料（也可推开酒馆右侧石门去魔晶温室免费采集），不限数量投入 Phantom 的摇酒壶或 Ghost 的骷髅大坩埚！'
              : 'Spend $PHANTOM on 15 meme ingredients—or forage them free inside the Alchemy Greenhouse door—and toss unlimited amounts into Phantom’s shaker or Ghost’s cauldron!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onBuyRandomBundle && (
            <button
              type="button"
              disabled={cocoBalance < bundleCost}
              onClick={handleBuyMysteryPack}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs md:text-sm rounded-xl flex items-center gap-2 shadow-lg transition-colors whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4" />
              <span>
                {language === 'zh'
                  ? `随机5连食材盲袋 (${bundleCost} $PHANTOM)`
                  : `5x Mystery Ingredient Pack (${bundleCost} $PHANTOM)`}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playCoin();
              onClaimFaucet();
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs md:text-sm rounded-xl flex items-center gap-2 shadow-lg transition-colors whitespace-nowrap"
          >
            <Gift className="w-4 h-4" />
            <span>{language === 'zh' ? '免费领 +250 $PHANTOM' : 'Claim +250 $PHANTOM'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToTavern}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs md:text-sm font-semibold rounded-xl border border-stone-700 transition-colors whitespace-nowrap"
          >
            {language === 'zh' ? '返回Phantom酒馆' : 'Back to Tavern'}
          </button>
        </div>
      </div>

      {/* Interactive Filter Segmented Control + APPL Rule Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-stone-900 rounded-xl border border-stone-800 self-start max-w-full overflow-x-auto">
          {(
            [
              { id: 'all', zh: `全部食材 (${INGREDIENTS.length})`, en: `All (${INGREDIENTS.length})` },
              { id: 'meme', zh: '经典梗图', en: 'Meme Lore' },
              { id: 'crypto', zh: '链上加密', en: 'Crypto Degens' },
              { id: 'spooky', zh: '万圣诡物', en: 'Halloween Spooky' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === tab.id
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'text-stone-300 hover:text-amber-200'
              }`}
            >
              {language === 'zh' ? tab.zh : tab.en}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-400">
          <span className="text-emerald-400 font-semibold">
            {language === 'zh' ? '🍏 铁律提示：' : '🍏 Decree:'}
          </span>{' '}
          {language === 'zh'
            ? '咬口烂苹果绝不作为烹饪食材出售，仅限互动奇遇掉落并 1:1 兑换 $APPL 代币化股票。'
            : 'Rotten Apples are never sold as cooking ingredients—only found via tavern encounters for 1:1 $APPL stock redemption.'}
        </div>
      </div>

      {/* 15 Ingredients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {filteredIngredients.map((item) => {
          const owned = inventory[item.id] || 0;
          const canAfford = cocoBalance >= item.price;

          return (
            <div
              key={item.id}
              className="bg-stone-900/90 border border-stone-800 hover:border-amber-600/50 rounded-2xl p-4 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 shadow-lg"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-stone-950 border border-stone-800">
                  <img
                    src={item.image}
                    alt={item.name[language]}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {owned > 0 && (
                    <div className="absolute bottom-2 left-2 bg-stone-950/90 text-emerald-300 border border-emerald-600/50 text-xs font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 tabular-nums">
                      <Check className="w-3 h-3" />
                      <span>{language === 'zh' ? `背包: ${owned}` : `Bag: ${owned}`}</span>
                    </div>
                  )}
                </div>

                {/* Clean Unboxed Metadata */}
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-mono mb-1">
                  <span
                    className={
                      item.rarity === 'legendary'
                        ? 'text-amber-300 font-semibold'
                        : item.rarity === 'rare'
                          ? 'text-purple-300'
                          : 'text-stone-400'
                    }
                  >
                    {rarityLabel(item.rarity)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{categoryLabel(item.category)}</span>
                </div>

                <h3 className="text-sm font-bold text-amber-200 truncate">
                  {item.name[language]}
                </h3>
                <p className="text-xs text-stone-300 mt-1 line-clamp-3 leading-relaxed">
                  {item.description[language]}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1 font-mono tabular-nums">
                  <span className="text-sm font-bold text-amber-400">{item.price}</span>
                  <span className="text-[10px] text-amber-500">$PHANTOM</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuy(item.id, item.price)}
                  disabled={!canAfford}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 ${
                    canAfford
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {canAfford
                      ? language === 'zh'
                        ? '采购'
                        : 'Buy'
                      : language === 'zh'
                        ? '不足'
                        : 'Low'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
