import { CharacterId, Language, MemeDraftConfig } from '../types/tavern';

/**
 * Zero-API-Quota contextual Meme Draft Builder.
 * Turns any Phantom/Ghost conversation or Crypto/US Stock Market Analysis into a thematic Meme composition
 * with 100% pure EN / 100% pure ZH language separation.
 */
export function buildContextualMemeDraft(opts: {
  language: Language;
  character: CharacterId;
  userPrompt?: string;
  replyText?: string;
  assetSymbol?: string;
  changePercent24h?: number;
}): MemeDraftConfig {
  const { language, character, userPrompt = '', replyText = '', assetSymbol, changePercent24h } = opts;
  const isZh = language === 'zh';
  const combined = `${userPrompt} ${replyText}`.toLowerCase();

  // 1. Market Analysis Context (with explicit ticker or live % change)
  if (assetSymbol) {
    const sym = assetSymbol.toUpperCase();
    const pct = typeof changePercent24h === 'number' ? changePercent24h : 0;
    const isBull = pct >= 0;
    const pctStr = typeof changePercent24h === 'number'
      ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
      : '';

    if (isBull) {
      return {
        topText: isZh
          ? `${sym} 今日强势拉升 ${pctStr}`
          : `WHEN ${sym} PUMPS ${pctStr || 'TO THE MOON'} TODAY`,
        bottomText:
          character === 'phantom'
            ? isZh
              ? 'Phantom压低帽檐为全酒馆满上庆功生啤'
              : 'PHANTOM POURING FREE PINTS FOR THE WHOLE BAR'
            : isZh
              ? 'Ghost往骷髅大坩埚里又添了一把钻石矿'
              : 'GHOST BOILING PURE DIAMOND HANDS IN THE CAULDRON',
        primaryCharId: character,
        secondaryCharId: sym === 'DOGE' ? 'doge' : sym === 'PEPE' || sym === 'BOME' ? 'pepe' : 'stonks',
        backdropId: 'bull_green',
        stickers: [{ emoji: '🚀', xPct: 50, yPct: 48, size: 92 }],
        contextTopic: `${sym} ${pctStr}`.trim(),
        character
      };
    } else {
      return {
        topText: isZh
          ? `${sym} 盘面回调 ${pctStr} 散户心慌意乱`
          : `WHEN ${sym} DIPS ${pctStr || 'HARD'} AND TRADERS PANIC`,
        bottomText:
          character === 'phantom'
            ? isZh
              ? '我在Phantom吧台零杠杆淡定喝冰啤'
              : 'CHILLING AT PHANTOM BAR WITH ZERO LEVERAGE'
            : isZh
              ? 'Ghost早已看穿交易所盘口安心熬浓汤'
              : 'GHOST WATCHING EXCHANGE LIQUIDATIONS OVER HOT STEW',
        primaryCharId: character,
        secondaryCharId: 'wojak',
        backdropId: pct <= -4 ? 'rekt_red' : 'hall',
        stickers: [{ emoji: character === 'phantom' ? '🍺' : '🍲', xPct: 50, yPct: 52, size: 90 }],
        contextTopic: `${sym} ${pctStr}`.trim(),
        character
      };
    }
  }

  // 2. Exchange Puppeteers / Order Book Manipulation Lore
  if (/exchange|orderbook|order book|manipulat|liquidity|交易所|操盘|盘口|操控|流动性/.test(combined)) {
    return {
      topText: isZh
        ? '交易员彻夜研究全球各大交易所深度盘口'
        : 'TRADERS STUDYING GLOBAL EXCHANGE ORDER BOOKS ALL NIGHT',
      bottomText: isZh
        ? '幕后操盘的Phantom和Ghost正在酒馆里摇酒煲汤'
        : 'PHANTOM AND GHOST RUNNING THE EXCHANGES FROM A TAVERN',
      primaryCharId: character,
      secondaryCharId: character === 'phantom' ? 'ghost' : 'phantom',
      backdropId: 'cellar',
      stickers: [{ emoji: '⚡', xPct: 50, yPct: 48, size: 92 }],
      contextTopic: isZh ? '操控交易所的幽灵双子' : 'Phantom & Ghost Exchange Puppeteers',
      character
    };
  }

  // 3. Shapeshifting / Dawn of the Internet Ghosts Lore
  if (/shapeshift|internet|dawn|shadow|born|互联网|幽灵|变换|变幻|千面|影子/.test(combined)) {
    return {
      topText: isZh
        ? '无数加密货币白皮书与巨鲸背后都有神秘暗影'
        : 'SHADOWS BEHIND HALF THE COINS IN CRYPTO HISTORY',
      bottomText: isZh
        ? '诞生于互联网之初的幽灵今晚只想给你倒杯生啤'
        : 'ANCIENT INTERNET GHOSTS JUST POURING COLD PINTS TONIGHT',
      primaryCharId: character,
      secondaryCharId: 'pepe',
      backdropId: 'hall',
      stickers: [{ emoji: '🍺', xPct: 50, yPct: 52, size: 90 }],
      contextTopic: isZh ? '互联网之初的千面幽灵' : 'Internet Dawn Shapeshifter Ghosts',
      character
    };
  }

  // 4. Rotten Apple ($APPL) Tokenized Stock Lore
  if (/appl|rotten apple|tokenized|烂苹果|咬了一口|股票/.test(combined)) {
    return {
      topText: isZh
        ? '新手想把奇遇捡到的咬口烂苹果丢进锅里煮'
        : 'ROOKIES TRYING TO COOK THE BITTEN ROTTEN APPLE',
      bottomText: isZh
        ? '老酒客直接拿去柜台一比一铸造 $APPL 股票'
        : 'LEGENDS REDEEMING IT ONE TO ONE FOR $APPL STOCK',
      primaryCharId: character,
      secondaryCharId: 'gigachad',
      backdropId: 'alchemy',
      stickers: [{ emoji: '💎', xPct: 50, yPct: 52, size: 88 }],
      contextTopic: isZh ? '咬口烂苹果兑换 $APPL' : 'Rotten Apple $APPL Stock',
      character
    };
  }

  // 5. Crypto / Stock General Chat Mentioned
  if (/btc|eth|sol|nvda|qqq|doge|market|涨|跌|行情|牛市|熊市|爆仓/.test(combined)) {
    const mentionedTicker =
      (combined.match(/\b(btc|eth|sol|nvda|aapl|tsla|qqq|doge)\b/i)?.[1] || 'BTC').toUpperCase();
    return {
      topText: isZh
        ? `别人还在为 ${mentionedTicker} 短线插针彻夜失眠`
        : `EVERYONE SWEATING OVER ${mentionedTicker} WICKS`,
      bottomText:
        character === 'phantom'
          ? isZh
              ? 'Phantom先给你满上一大杯冰镇精酿黑麦啤'
              : 'PHANTOM POURING ICE COLD PINTS FOR DIAMOND HANDS'
          : isZh
              ? 'Ghost守着骷髅大坩埚早已看穿多空底牌'
              : 'GHOST READING THE ORDER BOOK IN HIS SKULL CAULDRON',
      primaryCharId: character,
      secondaryCharId: character === 'phantom' ? 'doge' : 'bome',
      backdropId: character === 'phantom' ? 'hall' : 'cauldron',
      stickers: [{ emoji: character === 'phantom' ? '🍺' : '🔥', xPct: 50, yPct: 52, size: 88 }],
      contextTopic: `${mentionedTicker} ${isZh ? 'Phantom酒馆夜谈' : 'Phantom Tavern Banter'}`,
      character
    };
  }

  // 6. General Phantom / Ghost Tavern Conversation Fallback
  return {
    topText:
      character === 'phantom'
        ? isZh
          ? '推开双层Phantom酒馆听见满堂酒客碰杯欢呼'
          : 'WALKING INTO THE TWO STORY PHANTOM TAVERN'
        : isZh
          ? '深夜来到Ghost紫电缭绕的骷髅大坩埚旁'
          : 'STEPPING BESIDE GHOST AND HIS GLOWING SKULL CAULDRON',
    bottomText:
      character === 'phantom'
        ? isZh
          ? '跟调酒师Phantom和佩佩蛙干完这杯万事皆浮云'
          : 'CLINKING FROTHY MUGS WITH PHANTOM AND PEPE'
        : isZh
          ? '十几种梗图材料一锅乱炖炼出稀世奇汤'
          : 'TOSSING FIFTEEN MEME INGREDIENTS INTO ONE POT',
    primaryCharId: character,
    secondaryCharId: character === 'phantom' ? 'pepe' : 'voxel',
    backdropId: character === 'phantom' ? 'hall' : 'cauldron',
    stickers: [{ emoji: character === 'phantom' ? '🍺' : '🍲', xPct: 50, yPct: 52, size: 88 }],
    contextTopic: userPrompt.slice(0, 60) || (isZh ? 'Phantom酒馆日常' : 'Phantom Tavern Lore'),
    character
  };
}
