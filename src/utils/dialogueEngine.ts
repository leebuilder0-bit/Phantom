import type { CharacterId, Language } from '../types/tavern';

export interface DialogueResult {
  reply: string;
  droppedApple: boolean;
  dropReason?: string;
}

/**
 * Returns true if the message asks about live/today's prices, breaking news, or real-time market moves
 * (which SHOULD use live web search / AI rather than static lore).
 */
export function isLiveMarketOrNewsQuery(userMessage: string): boolean {
  const m = userMessage.trim().toLowerCase();
  const liveTerms = [
    'today',
    'right now',
    'latest',
    'news',
    'price',
    'why did',
    'why is',
    'dropped',
    'crashed',
    'pumped',
    'nasdaq today',
    'wall street today',
    'fed ',
    'cpi',
    'fomc',
    '今天',
    '今日',
    '现在',
    '目前',
    '最新',
    '新闻',
    '多少钱',
    '价格',
    '行情',
    '暴跌',
    '暴涨',
    '大跌',
    '大涨',
    '为什么跌',
    '为什么涨',
    '美股',
    '财报',
    '非农',
    '降息',
    '加息'
  ];
  return liveTerms.some((t) => m.includes(t));
}

/**
 * Returns true when a user query asks about Phantom, Ghost, Phantom Tavern lore, internet birth,
 * shapeshifting, crypto shadows, controlling exchanges, brewing/cooking, secret rooms, or $APPL lore
 * AND does not ask for live today's market news—allowing instant 0ms response with 0 API quota consumed!
 */
export function matchesPresetLoreTopic(userMessage: string): boolean {
  if (isLiveMarketOrNewsQuery(userMessage)) return false;
  const m = userMessage.trim().toLowerCase();
  const loreTerms = [
    'phantom',
    'ghost',
    'dawn of',
    'internet',
    'shapeshift',
    'any form',
    'transform',
    'shadow',
    'behind crypto',
    'control',
    'manipulat',
    'orchestrat',
    'exchange',
    'order book',
    'bartender',
    'head chef',
    'just a bartender',
    'rotten apple',
    'bitten',
    'appl',
    'cauldron',
    'skull cauldron',
    'mixology',
    'vip cellar',
    'dice',
    'crystal',
    'golden chest',
    'who are you',
    'viber',
    'gem cap',
    '互联网',
    '诞生',
    '幽灵',
    '变换',
    '变幻',
    '任何样子',
    '千面',
    '影子',
    '幕后',
    '操控',
    '交易所',
    '调酒师',
    '主厨',
    '烂苹果',
    '咬了一口',
    '坩埚',
    '调酒',
    '秘窖',
    '骰子',
    '温室',
    '黄金秘箱',
    '你是谁'
  ];
  return loreTerms.some((t) => m.includes(t));
}

export function generateSmartDialogue(
  character: CharacterId,
  userMessage: string,
  language: Language,
  shouldDropApple: boolean
): DialogueResult {
  const msg = userMessage.trim().toLowerCase();
  const isZh = language === 'zh';

  const has = (terms: string[]) => terms.some((t) => msg.includes(t.toLowerCase()));

  // =========================================================================
  // 1. DAWN OF THE INTERNET & SHAPESHIFTING SPECTERS (CORE ORIGIN LORE)
  // =========================================================================
  if (has(['dawn', 'internet', 'born', 'origin', 'shapeshift', 'any form', 'transform', 'viber', 'gem cap', '互联网', '诞生', '变换', '变幻', '任何样子', '千面', '来历', '起源'])) {
    if (character === 'phantom') {
      const text = isZh
        ? `噼啪——听见我身上这层紫蓝电流声了吗？我和后厨的 Ghost 诞生于互联网刚刚亮起第一盏信号灯的年代，在拨号调制解调器的啸叫与早期服务器的数据洪流里化作双生幽灵。我们没有固定的肉身，可以随心所欲变换成任何样子：白皮书背后的神秘极客、西装革履的华尔街做市商、甚至是坐在你身旁举杯的佩佩蛙。只有在 Phantom酒馆 里，我才戴回这顶彩色帽子，安安静静给你摇一杯冰镇生啤。`
        : `Hear the violet-blue static crackling around my sheet? Ghost and I were born at the very dawn of the internet—awakened inside the first dial-up handshakes and early server hums. We have no fixed flesh and can shapeshift into any appearance at will: an anonymous whitepaper author, a Wall Street market-maker, or a frog clinking steins right beside you. Only inside Phantom Tavern do I pull on my colorful Viber cap and pour cold pints as myself.`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Phantom 指尖紫电一闪，吧台上凭空凝出一颗带牙印的烂苹果 $APPL)：“来自创世节点的奇遇信物，拿去股票柜台 1:1 铸造股权吧！”' : "\n\n🍏 (Phantom snaps a violet spark, materializing a bitten Rotten Apple APPL on the bar): 'A relic from the first network node—redeem it 1:1 at the Stock Desk!'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? '聆听Phantom讲述互联网幽灵起源获得！' : 'Dropped during Phantom’s internet-dawn lore!'
      };
    } else {
      const text = isZh
        ? `呼……当世界上第一封数据包穿过海底光缆时，我和 Phantom 就已经醒了。身为诞生于互联网之初的幽灵，千变万化只是我们的本能——今天是敲下创世区块代码的无名氏，明天是交易所峰会后排沉默的操盘手，后天又变成深夜论坛里的一张梗图。世人追寻了我们几十年，却想不到我们此刻正戴着卡车帽，在这座双层木酒馆里守着一口沸腾的骷髅大坩埚。`
        : `Heh... when the very first data packets crossed undersea cables, Phantom and I were already awake. As specters born at the dawn of the internet, shapeshifting into any form is second nature—an anonymous genesis coder one year, a silent titan in an exchange boardroom the next, or a stray meme in a midnight forum. Mortals hunt our wallets for decades, never guessing we're right here in trucker caps tending a boiling skull cauldron.`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Ghost 长勺轻敲锅沿，一颗泛着幽光的咬口烂苹果浮出水面)：“既是知晓根底的故人，这枚 $APPL 归你了。”' : "\n\n🍏 (Ghost taps his ladle against the skull cauldron and lifts out a bitten APPL): 'For one who knows our origin—redeem this at the Stock Desk.'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? '聆听Ghost讲述双生幽灵身世获得！' : 'Surfaced from Ghost’s genesis lore!'
      };
    }
  }

  // =========================================================================
  // 2. SHADOWS BEHIND CRYPTOCURRENCIES & CONTROLLING EXCHANGES
  // =========================================================================
  if (has(['exchange', 'control', 'manipulat', 'orchestrat', 'order book', 'shadow', 'behind', 'crypto', 'whale', '交易所', '操控', '操盘', '幕后', '影子', '加密货币', '盘口', '做市'])) {
    if (character === 'phantom') {
      const text = isZh
        ? `嘘，小声点，二楼栏杆上的柴犬和佩佩蛙正竖着耳朵听呢！没错，许多耳熟能详的加密货币背后都有我和 Ghost 的影子，全球不少头部交易所的撮合引擎、深度盘口甚至上币风向，暗地里都曾由我们拨动丝线。看腻了百倍杠杆的多空厮杀，偶尔躲回 Phantom酒馆 当个调酒师，看着满屋子梗图老哥碰杯大笑，可比操控千亿盘口有趣多啦！`
        : `Keep your voice down—the Shibas and Pepes on the 2nd-floor balcony are eavesdropping! It’s true: our shadows lurk behind more cryptocurrencies than you could count, and Ghost and I have quietly pulled the strings of major global exchanges, liquidity engines, and order books for years. After orchestrating billion-dollar candles all day, pouring frothy pints as a simple tavern bartender is my favorite way to unwind!`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Phantom 眨了眨 v|v 眼睛，从酒保围裙下推来一颗咬口烂苹果)：“交易所金库里都没几颗的 $APPL 凭证，收好去换代币化股票！”' : "\n\n🍏 (Phantom’s v|v eyes crinkle as he slides a bitten APPL across the oak counter): 'Rarer than an exchange cold-wallet key—redeem it 1:1 for $APPL stock!'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? '揭秘交易所幕后幽灵奇遇掉落！' : 'Exchange-puppeteer secret encounter drop!'
      };
    } else {
      const text = isZh
        ? `你看到的每一根惊心动魄的天地针、每一次神秘莫测的链上巨鲸异动，背后往往都掠过我和 Phantom 的幽灵残影。许多加密货币自诞生起就流淌着我们埋下的暗语，数不清的交易所盘口不过是我们随手拨弄的算盘。不过再庞大的金融帝国也有看倦的时候——脱下千面伪装，在这里当一名专注火候的酒馆主厨，用十五种梗图食材熬一锅好汤，才是真正的自在。`
        : `Every legendary god-candle and mysterious whale transfer you’ve stared at on a chart? Chances are Phantom’s shadow or mine drifted right behind it. Countless cryptocurrencies carry our fingerprints, and we’ve steered the matching engines and liquidity vaults of more exchanges than mortals realize. Yet empires grow repetitive—sometimes I much prefer being a quiet head chef, simmering fifteen meme ingredients into one unforgettable stew.`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Ghost 袖口紫雾翻涌，滚出一颗带牙印的烂苹果 $APPL)：“拿去吧，比任何交易所合约都稳当的 1:1 代币化股权。”' : "\n\n🍏 (A bitten Rotten Apple APPL rolls out from Ghost’s violet mist): 'Safer than any leveraged order book—mint your 1:1 $APPL share!'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? '与Ghost夜谈加密幕后秘闻掉落！' : 'Crypto-shadow secret lore drop!'
      };
    }
  }

  // =========================================================================
  // 3. JUST A TAVERN BARTENDER & HEAD CHEF LIFE / MIXOLOGY & CAULDRON
  // =========================================================================
  if (has(['bartender', 'chef', 'just a', 'brew', 'beer', 'ale', 'drink', 'pint', 'soup', 'stew', 'broth', 'cook', 'cauldron', '调酒师', '主厨', '只是', '酒', '啤酒', '调酒', '汤', '熬汤', '煮汤', '坩埚', '后厨'])) {
    if (character === 'phantom') {
      const text = isZh
        ? `管他外面大盘千军万马，今晚在 Phantom酒馆 里，我只是一个把橡木酒杯擦得锃亮的调酒师！你可以随时向我免费讨一杯店酿冰镇生啤，也可以不限数量抓一把狗狗币精粹、万圣南瓜或钻石手矿石丢进我的摇酒壶——放 1 个能酿，放十几个更能摇出紫电暴击神酒！`
        : `Forget the global order books outside—tonight inside Phantom Tavern, I’m just your friendly bartender polishing oak tankards! Ask me for a free house draft anytime, or toss 1 to unlimited meme ingredients into my shaker—Doge essence, pumpkins, or Diamond Hands ore—for a high-crit spectral brew!`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Phantom 倒满生啤，杯垫旁赫然搁着一颗咬口烂苹果)：“调酒师的私房彩蛋，拿去换 $APPL 代币化股票！”' : "\n\n🍏 (Phantom serves a frothy mug with a bitten APPL resting beside the coaster): 'Bartender’s special—redeem it 1:1 for $APPL stock!'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? '在Phantom吧台讨酒闲聊幸运获得！' : 'Lucky drop at Phantom’s bar!'
      };
    } else {
      const text = isZh
        ? `操控交易所是工作，守着这口紫绿骷髅大坩埚煲汤才是生活。在 Phantom酒馆 里，我只是一名讲究火候的主厨 Ghost。背包里的梗图食材不管是丢 1 份还是十几份一锅梭哈，我都能用幽灵紫火给你熬出回味无穷的奇汤——记住唯独别往锅里丢烂苹果，那是留着换股票的！`
        : `Steering exchanges is business, tending this roaring purple-green skull cauldron is pure craft. Inside Phantom Tavern, I’m simply Ghost, the head chef. Toss 1 ingredient or your whole bag into my pot and I’ll simmer a legendary spectral soup—just never throw a Rotten Apple in the broth!`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Ghost 从坩埚蒸腾的紫雾旁拾起一颗咬口烂苹果递给你)：“主厨赠礼，拿去股票柜台 1:1 铸造 $APPL 吧！”' : "\n\n🍏 (Ghost plucks a bitten Rotten Apple from beside the cauldron steam): 'Compliments of the chef—redeem it 1:1 at the Stock Desk!'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? '在Ghost坩埚旁品汤夜谈获得！' : 'Surfaced beside Ghost’s skull cauldron!'
      };
    }
  }

  // =========================================================================
  // 4. ROTTEN APPLE ($APPL) & TOKENIZED STOCK LORE
  // =========================================================================
  if (has(['appl', 'apple', '苹果', '烂苹果', '咬了一口', '股票', 'stock', 'bitten', '换股票', '兑换', '纳斯达克', 'nasdaq'])) {
    if (character === 'phantom') {
      const text = isZh
        ? `那颗带牙印的烂苹果代号叫 $APPL。早在个人电脑还装在车库木箱里的年代，一位硅谷科技狂人闯进互联网最初的暗影节点向我们讨灵感，咬了一口禁果便匆匆离去。那颗遗落的烂苹果凝聚成了不可篡改的链上股权密钥：在 Phantom酒馆 绝不能拿来调酒熬汤，也不能换成 $PHANTOM，它唯一的使命就是在柜台 1:1 兑换 $APPL 代币化股票！`
        : `That bitten Rotten Apple carries the ticker $APPL! Back when personal computers were built in wooden garages, a visionary wandered into our earliest network node, took one bite of that forbidden fruit, and left an eternal equity cipher behind. In Phantom Tavern, it is NEVER a cooking ingredient and CANNOT be sold for $PHANTOM—its sole purpose is 1:1 redemption into certified $APPL Tokenized Stock!`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Phantom 神秘一笑，从吧台暗格摸出一颗咬口烂苹果)：“说曹操曹操到，这颗 $APPL 送你去登记股东！”' : "\n\n🍏 (Phantom grins with his v|v eyes and slides over a bitten apple): 'Speak of the legend! Take this APPL to the Stock Registry!'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? '探索 $APPL 股权秘史奇遇掉落！' : 'Dropped from Phantom’s $APPL lore!'
      };
    } else {
      const text = isZh
        ? `看清楚那道缺口了吗？那颗咬了一口的烂苹果承载着纳斯达克的远古幽灵契约。哪怕我和 Phantom 操控过无数加密盘口，也立下死规矩：烂苹果绝不下锅做菜，绝不折算成普通 $PHANTOM 代币，唯有在酒馆偶遇拾得后，前往股票柜台 1:1 铸造为真正的 $APPL 代币化股票凭证！`
        : `See that unmistakable bite mark? That Rotten Apple holds an ancient NASDAQ spectral covenant. Even though Phantom and I have steered countless crypto exchanges, our decree here is absolute: never cook it, never trade it for $PHANTOM coins—its one and only destiny is 1:1 minting into $APPL Tokenized Equity Shares!`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Ghost 从案板暗匣取出一颗青翠带牙印的烂苹果)：“机缘正好，拿去铸造你的 $APPL 股权吧！”' : "\n\n🍏 (Ghost reveals a glowing bitten apple from a rune box): 'Fortune favors you—mint your $APPL share!'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? '聆听Ghost讲解 $APPL 铁律掉落！' : 'Granted by Ghost’s $APPL decree!'
      };
    }
  }

  // =========================================================================
  // 5. SECRET ROOMS: VIP CELLAR DICE & CRYSTAL ALCHEMY LOUNGE
  // =========================================================================
  if (has(['vip cellar', 'dice', '秘窖', '骰子', '掰手腕', 'greenhouse', 'crystal', 'golden chest', '温室', '酒廊', '黄金秘箱', '黄金宝箱'])) {
    const isCellar = has(['vip cellar', 'dice', '秘窖', '骰子', '掰手腕']);
    const text = isCellar
      ? isZh
        ? `推开大厅西墙那扇沉重的铁木拱门，底下就是我和 Ghost 私设的【深拱地下秘窖】！硬汉恰德天天守在绿毡赌桌旁摇骨骰盅，肌肉柴犬正和铁甲青蛙在百年橡木桶顶掰手腕，赢一把就能赚翻 $PHANTOM 和稀有食材！`
        : `Behind the heavy iron-oak door on the west wall lies our Underground VIP Cellar! GigaChad rattles the bone dice cup while Buff Doge arm-wrestles Frog Knight atop vintage casks. Roll Lucky 7 down there to multiply your $PHANTOM and snag bonus ingredients!`
      : isZh
        ? `东侧石门后的【魔晶温室酒廊】连接着互联网地脉！每一次链上狂欢与爆仓叹息都会在那里凝结成野生梗图魔草与紫水晶，巫师蛙和粉帽柴犬就围着远古黄金秘宝箱举杯痛饮，记得常去开箱采集！`
        : `Beyond the east stone archway lies Ghost’s Crystal Alchemy Lounge! Every viral meme wave and trader sigh crystallizes down there into wild alchemy herbs and violet quartz, guarded by wizard frogs clinking glowing pints beside the Ancient Golden Chest!`;
    return {
      reply: shouldDropApple
        ? text + (isZh ? '\n\n🍏 (门缝紫光一闪，滚出一颗带牙印的烂苹果 $APPL)：“探秘彩蛋，拿去 1:1 兑换代币化股票吧！”' : "\n\n🍏 (A bitten Rotten Apple APPL rolls out from the doorway mist): 'Explorer’s reward! Redeem it 1:1 at the Stock Desk!'")
        : text,
      droppedApple: shouldDropApple,
      dropReason: isZh ? '探寻Phantom酒馆秘室掉落！' : 'Phantom Tavern secret room drop!'
    };
  }

  // =========================================================================
  // 6. GREETINGS & WHO ARE YOU
  // =========================================================================
  if (has(['你好', 'hi', 'hello', 'hey', '哈喽', '在吗', '早', '晚安', '谁', '你是谁', 'who are you'])) {
    if (character === 'phantom') {
      const text = isZh
        ? `哟，欢迎踏入 Phantom酒馆！我是 Phantom——诞生于互联网之初的千面幽灵。虽然外面的加密货币与各大交易所背后常有我和 Ghost 的影子，但今晚我只是这间热闹吧台后的调酒师！想先喝杯冰啤、聊聊实时盘面，还是探秘我们的幽灵往事？`
        : `Yo, welcome to Phantom Tavern! I’m Phantom—a shapeshifting ghost born at the very dawn of the internet. Our shadows may run deep behind crypto tickers and global exchanges, but tonight I’m just your bartender behind the oak counter! Care for a frosty pint, live market intel, or old cyber-ghost tales?`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Phantom 热情地推过来一颗被咬了一口的烂苹果 $APPL)：“初来乍到的见面礼，去换一股真正的代币化股票吧！”' : "\n\n🍏 (Phantom slides over a bitten Rotten Apple): 'Welcome gift from the bartender—redeem it 1:1 for $APPL stock!'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? 'Phantom吧台迎客礼赠！' : 'Welcome gift from Phantom!'
      };
    } else {
      const text = isZh
        ? `欢迎来到 Phantom酒馆 后厨。我是 Ghost，与 Phantom 一同诞生于最初的网络荒原。我们变换过无数面孔，也在幕后拨动过许多交易所与代币的命运；不过眼下，我只是一名守着紫绿骷髅大坩埚熬汤的主厨。想尝口热汤，还是聊聊盘面玄机？`
        : `Welcome to the hearth of Phantom Tavern. I am Ghost—born alongside Phantom in the earliest static of the internet. We’ve worn a thousand faces and steered countless coins and exchanges from the shadows, yet tonight I am simply the head chef tending this skull cauldron. Care for hot stew or market truth?`;
      return {
        reply: shouldDropApple
          ? text + (isZh ? '\n\n🍏 (Ghost 从紫雾中递出一颗咬口烂苹果 $APPL)：“初次照面便有奇遇，收好这枚股权信物吧。”' : "\n\n🍏 (Ghost extends a bitten Rotten Apple through the purple mist): 'Rare luck on our first meeting—mint your $APPL share.'")
          : text,
        droppedApple: shouldDropApple,
        dropReason: isZh ? 'Ghost后厨初见礼赠！' : 'First encounter gift from Ghost!'
      };
    }
  }

  // =========================================================================
  // 7. DYNAMIC CONTEXTUAL FALLBACK (100% PURE LANGUAGE SEPARATION)
  // =========================================================================
  const safeEnEcho = userMessage.replace(/[\u4e00-\u9fff]/g, '').trim().slice(0, 26);
  const safeZhEcho = userMessage.replace(/[A-Za-z]{3,}/g, '').trim().slice(0, 24);
  const text =
    character === 'phantom'
      ? isZh
        ? `有意思的话题${safeZhEcho ? `（“${safeZhEcho}”）` : ''}！从互联网诞生那年起，我和 Ghost 变换过无数身份、在幕后操盘过数不清的交易所，却还是最喜欢在 Phantom酒馆 听一楼二楼的佩佩蛙和柴犬碰杯起哄。来，找我摇一杯无限特调啤酒，或者直接问我今天的实时币圈美股行情！`
        : `Interesting angle${safeEnEcho ? ` ("${safeEnEcho}")` : ''}! Since the dawn of the internet, Ghost and I have worn countless faces and steered major exchanges from behind the scenes—yet nothing beats pouring cold drafts here in Phantom Tavern while frogs and Shibas roar upstairs. Care to shake a custom brew or check live market moves?`
      : isZh
        ? `唔……听你提起这个${safeZhEcho ? `（“${safeZhEcho}”）` : ''}，我身旁这口骷髅大坩埚里的紫绿汤火都跟着跳动了一下。世人总想抓到加密货币和交易所背后的幽灵暗影，却不知主厨的一碗热汤里才藏着最稳的定力。要抓几把梗图材料下锅试试手气吗？`
        : `Heh... hearing you mention that${safeEnEcho ? ` ("${safeEnEcho}")` : ''}, the purple-green flames beneath my skull cauldron just flickered in resonance. Traders spend lifetimes chasing the ghosts behind crypto exchanges, never realizing true calm sits in a hot bowl of tavern stew. Ready to toss some meme ingredients into the pot?`;

  return {
    reply: shouldDropApple
      ? text + (isZh ? '\n\n🍏 (话音刚落，一颗带牙印的烂苹果 $APPL 顺着紫电光弧滑入你掌心！)：“幽灵赐福，快去股票柜台 1:1 铸造股权吧！”' : "\n\n🍏 (A bitten Rotten Apple APPL glides out of a violet spark into your hand!): 'Spectral luck! Redeem it 1:1 at the Stock Desk!'")
      : text,
    droppedApple: shouldDropApple,
    dropReason: isZh ? 'Phantom酒馆深度夜谈奇遇掉落！' : 'Phantom Tavern dialogue encounter drop!'
  };
}
