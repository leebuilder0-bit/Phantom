import { CraftedItem, Ingredient } from '../types/tavern';
import { DRINK_RECIPES, SOUP_RECIPES, INGREDIENTS } from '../data/tavernData';

const DRINK_ICONS = ['🍺', '🍻', '🍹', '🍸', '🥃', '🥂', '🧪', '⚡'];
const SOUP_ICONS = ['🍲', '🥣', '🧪', '✨', '🔥', '🔮', '💀', '🌟'];

const DRINK_PREFIXES_ZH = [
  '狂暴百倍', '幽灵微醺', '午夜清算', '钻石冰镇', '创世区块', '万圣幻影', '链上发酵', 'Phantom私藏', '深度盘口', '跨链电弧'
];
const DRINK_PREFIXES_EN = [
  '100x Leveraged', 'Spectral-Aged', 'Midnight Orderbook', 'Diamond-Chilled', 'Genesis-Fermented', 'Viber-Cap', 'Phantom’s Private', 'Hyper-Fizzy', 'Exchange Reserve', 'Violet-Aura'
];

const DRINK_BASES_ZH = [
  '精酿黑麦啤', '双倍酒花精酿', '氮气幽灵世涛', '电弧摇壶特调', '橡木桶烈性麦酒', '荧光魔力烈饮', '秘窖朗姆鸡尾酒'
];
const DRINK_BASES_EN = [
  'Dark Malt Stout', 'Double Hopped IPA', 'Nitro Spectral Draft', 'Arcane Shaker Cocktail', 'Oak-Barrel Strong Ale', 'Glowing Highball', 'Cellar Rum Punch'
];

const SOUP_PREFIXES_ZH = [
  'Ghost秘传', '创世节点', '九转炼金', '万梗沸腾', '深度撮合', '永不割肉', '南瓜恶灵', '紫晶浓缩', '混沌盘口', '幽灵深渊'
];
const SOUP_PREFIXES_EN = [
  'Ghost’s Genesis', 'Orderbook-Simmered', 'Nine-Fold Alchemical', 'Boiling Meme', 'Liquidity-Surge', 'Unshakable HODL', 'Haunted Pumpkin', 'GEM-Cap Special', 'Spectral Forbidden', 'Abyssal Rune'
];

const SOUP_BASES_ZH = [
  '幽灵高汤浓羹', '紫火咕嘟老汤', '翡翠魔药羹', '骷髅坩埚高汤', '清算回血罗宋汤', '牛市狂想乱炖', '符文铁锅靓汤'
];
const SOUP_BASES_EN = [
  'Spectral Goulash', 'Purple-Flame Broth', 'Emerald Potion Chowder', 'Rune-Simmered Bisque', 'Genesis Node Stew', 'Bull-Run Cauldron Consommé', 'Violet Aura Soup'
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a randomized Beer (for Phantom) or Soup (for Ghost) from ANY number of ingredients (1 to unlimited!).
 * Strictly uses meme market ingredients only—Rotten Apple (APPL) is never an ingredient.
 */
export function generateUnlimitedConcoction(
  type: 'drink' | 'soup',
  tossedIngredientIds: string[]
): {
  item: CraftedItem;
  gotApple: boolean;
  critMultiplier: number;
} {
  // Filter out rotten_apple defensively just in case
  const cleanIds = tossedIngredientIds.filter((id) => id !== 'rotten_apple');
  const totalCount = cleanIds.length;

  // Map to ingredient objects
  const usedIngs: Ingredient[] = cleanIds
    .map((id) => INGREDIENTS.find((i) => i.id === id))
    .filter((x): x is Ingredient => Boolean(x));

  const uniqueNamesZh = Array.from(new Set(usedIngs.map((i) => i.name.zh)));
  const uniqueNamesEn = Array.from(new Set(usedIngs.map((i) => i.name.en)));

  // Calculate base cost invested
  const totalInvestedCoins = usedIngs.reduce((sum, i) => sum + i.price, 0);
  const legendaryCount = usedIngs.filter((i) => i.rarity === 'legendary').length;
  const rareCount = usedIngs.filter((i) => i.rarity === 'rare').length;

  // Determine Rarity dynamically based on quantity + ingredient quality + luck roll
  const luckRoll = Math.random();
  let rarity: CraftedItem['rarity'] = 'normal';
  if (totalCount >= 6 || legendaryCount >= 2 || (totalCount >= 4 && luckRoll > 0.45)) {
    rarity = 'mythic';
  } else if (totalCount >= 3 || legendaryCount >= 1 || (rareCount >= 2 && luckRoll > 0.35)) {
    rarity = 'legendary';
  } else if (totalCount >= 2 || rareCount >= 1 || luckRoll > 0.5) {
    rarity = 'rare';
  }

  // Randomize reward multiplier (always rewarding & exciting: 1.25x to 2.4x of ingredient value)
  const critMultiplier = Number((1.25 + Math.random() * 1.15).toFixed(2));
  const rewardCoco = Math.max(85, Math.round(totalInvestedCoins * critMultiplier + totalCount * 18));

  // Apple drop chance scales gently with batch size (capped at 22% so APPL stays genuinely rare & precious)
  const appleDropChance = Math.min(0.22, 0.07 + totalCount * 0.02 + legendaryCount * 0.025);
  const gotApple = Math.random() < appleDropChance;

  // 35% chance when exactly 2 matching classic recipe ingredients are used to surface a classic lore recipe variant,
  // otherwise 100% procedural randomized beer / soup!
  if (totalCount === 2 && Math.random() < 0.35) {
    const sorted = [...cleanIds].sort();
    const pool = type === 'drink' ? DRINK_RECIPES : SOUP_RECIPES;
    const matched = pool.find((r) => {
      const sr = [...r.ingredients].sort();
      return sr.length === 2 && sr[0] === sorted[0] && sr[1] === sorted[1];
    });
    if (matched) {
      return {
        item: {
          ...matched,
          rewardCoco: Math.max(matched.rewardCoco, rewardCoco)
        },
        gotApple,
        critMultiplier
      };
    }
  }

  const featuredZh = uniqueNamesZh.slice(0, 2).join('与');
  const featuredEn = uniqueNamesEn.slice(0, 2).join(' & ');
  const countTagZh = totalCount === 1 ? '单料纯酿' : `${totalCount}料混炼`;
  const countTagEn = totalCount === 1 ? 'Single-Malt' : `${totalCount}-Fold`;

  if (type === 'drink') {
    const prefixZh = pickRandom(DRINK_PREFIXES_ZH);
    const baseZh = pickRandom(DRINK_BASES_ZH);
    const prefixEn = pickRandom(DRINK_PREFIXES_EN);
    const baseEn = pickRandom(DRINK_BASES_EN);

    const flavorNotesZh = [
      `Phantom压了压帽檐，将 ${totalCount} 份梗图原料（含${featuredZh}）塞进紫电摇酒壶猛摇三百下，泡沫差点掀翻酒馆屋顶！`,
      `这杯【${countTagZh}】奇酿入口先是${featuredZh}的辛辣冲劲，紧接着在舌尖炸开创世麦芽回甘，连吧台边的佩佩蛙都馋哭了。`,
      `融合了 ${uniqueNamesZh.join('、')} 的幽灵精粹，酒液泛着紫蓝电弧琥珀光，一口下去比拉盘百倍大阳线还爽快！`
    ];
    const flavorNotesEn = [
      `Phantom tipped his Viber cap, crammed all ${totalCount} meme ingredients (${featuredEn}) into his violet-sparking shaker, and shook foam to the rafters!`,
      `This ${countTagEn} brew hits first with ${featuredEn}, followed by crisp oak-barrel malt that made Wojak weep with joy at the bar.`,
      `Distilled from ${uniqueNamesEn.join(', ')}, crackling with spectral amber fizz—one gulp feels like orchestrating a global bull candle!`
    ];

    return {
      item: {
        id: `rand-drink-${Date.now()}`,
        name: {
          zh: `${prefixZh}·${countTagZh}${baseZh}`,
          en: `${prefixEn} ${countTagEn} ${baseEn}`
        },
        type: 'drink',
        description: {
          zh: pickRandom(flavorNotesZh),
          en: pickRandom(flavorNotesEn)
        },
        effect: {
          zh: `+${rewardCoco} $PHANTOM（${critMultiplier}倍 暴击调酒收益）`,
          en: `+${rewardCoco} $PHANTOM (${critMultiplier}x Mixology Crit)`
        },
        ingredients: cleanIds,
        rarity,
        rewardCoco,
        appleDropChance,
        icon: pickRandom(DRINK_ICONS)
      },
      gotApple,
      critMultiplier
    };
  } else {
    const prefixZh = pickRandom(SOUP_PREFIXES_ZH);
    const baseZh = pickRandom(SOUP_BASES_ZH);
    const prefixEn = pickRandom(SOUP_PREFIXES_EN);
    const baseEn = pickRandom(SOUP_BASES_EN);

    const soupNotesZh = [
      `Ghost周身紫电闪烁，把 ${totalCount} 份材料（${uniqueNamesZh.join('、')}）一股脑倒进沸腾的紫绿骷髅大坩埚，腾起奇香扑鼻的幽灵蒸汽！`,
      `这锅【${countTagZh}】幽灵浓汤咕嘟翻滚，${featuredZh}在远古符文火力下彻底融化，鲜美得仿佛看穿了全球交易所的底牌！`,
      `汇聚 ${totalCount} 重梗图流动性熬制而成，汤色在翡翠绿与幽灵紫之间变幻莫测，连路过的万梗魔导蛙都连闻了三大口！`
    ];
    const soupNotesEn = [
      `Ghost’s violet aura flared as he dumped all ${totalCount} ingredients (${uniqueNamesEn.join(', ')}) straight into the roaring skull cauldron, sending savory spectral steam skyward!`,
      `This ${countTagEn} phantom stew simmered ${featuredEn} over ancient runes—rich enough to make an exchange whale forget every liquidation!`,
      `Condensed from ${totalCount} charges of pure meme liquidity, swirling emerald and violet—even the BOME frog at the corner table couldn't stop sniffing the aroma!`
    ];

    return {
      item: {
        id: `rand-soup-${Date.now()}`,
        name: {
          zh: `${prefixZh}·${countTagZh}${baseZh}`,
          en: `${prefixEn} ${countTagEn} ${baseEn}`
        },
        type: 'soup',
        description: {
          zh: pickRandom(soupNotesZh),
          en: pickRandom(soupNotesEn)
        },
        effect: {
          zh: `+${rewardCoco} $PHANTOM（${critMultiplier}倍 坩埚炼金暴击）`,
          en: `+${rewardCoco} $PHANTOM (${critMultiplier}x Cauldron Alchemy Crit)`
        },
        ingredients: cleanIds,
        rarity,
        rewardCoco,
        appleDropChance,
        icon: pickRandom(SOUP_ICONS)
      },
      gotApple,
      critMultiplier
    };
  }
}
