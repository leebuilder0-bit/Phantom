import {
  Ingredient,
  CraftedItem,
  TavernStory,
  CharacterId,
  TavernPatron,
  BackgroundCrowdSpot,
  TavernRoomData
} from '../types/tavern';

// Core Artworks (Restored Original Skull Cauldron + Exclusive Rotten Apple APPL)
import cauldronImg from '../assets/images/meme_cauldron_soup_1793431502301.jpg';
import rottenAppleImg from '../assets/images/meme_rotten_apple_appl_1793431470894.jpg';

// 3 Deep 3D-Perspective Meme-Populated Room Backdrops (Multi-Story Mezzanines, Booths & Vaulted Halls)
import roomMainHallImg from '../assets/images/deep_tavern_hall_1793528818481.jpg';
import roomVipCellarImg from '../assets/images/deep_cellar_pub_1793528820417.jpg';
import roomAlchemyVaultImg from '../assets/images/deep_alchemy_lounge_1793528821716.jpg';

// 3 Brightly Lit PS1 / PSX Low-Poly Retro 3D Halloween Medieval Tavern Room Backdrops
import psxMainHallImg from '../assets/images/psx_bright_halloween_hall_1793588802419.jpg';
import psxVipCellarImg from '../assets/images/psx_bright_halloween_cellar_1793588805524.jpg';
import psxAlchemyLoungeImg from '../assets/images/psx_bright_halloween_lounge_1793588807316.jpg';

// 11 Individual Meme & Halloween Character Sprites
import patronVoxelImg from '../assets/images/patron_voxel_drinking_1793446420917.jpg';
import patronBomeImg from '../assets/images/patron_bome_drinking_1793446420964.jpg';
import patronWojakImg from '../assets/images/patron_wojak_drinking_1793446422071.jpg';
import patronDogeImg from '../assets/images/patron_doge_drinking_1793446423374.jpg';
import patronPepeImg from '../assets/images/patron_pepe_bard_1793451055606.jpg';
import patronGigachadImg from '../assets/images/patron_gigachad_knight_1793451057932.jpg';
import patronWifImg from '../assets/images/patron_wif_dog_1793451059851.jpg';
import patronChillImg from '../assets/images/patron_chill_guy_1793451060057.jpg';
import patronCatImg from '../assets/images/patron_vibing_cat_1793451062786.jpg';
import patronStonksImg from '../assets/images/patron_stonks_merchant_1793451064068.jpg';
import patronPumpkinJesterImg from '../assets/images/patron_weird_pumpkin_jester_1793588813937.jpg';
import weirdPumpkinTotemImg from '../assets/images/weird_halloween_pumpkin_totem_1793588843942.jpg';

// 5 Grounded Full-Leg Multi-Meme Halloween Drinking Table & Barrel Sprites (Resting Flat on Floor!)
import groupTablePepeDogeImg from '../assets/images/grounded_halloween_pepe_doge_table_1793588809873.jpg';
import groupBoothPartyImg from '../assets/images/grounded_halloween_pumpkin_wojak_table_1793588811232.jpg';
import groupBarrelArmWrestleImg from '../assets/images/grounded_halloween_doge_frog_barrel_1793588843801.jpg';
import groupHamsterPopcatImg from '../assets/images/grounded_halloween_hamster_popcat_barrel_1793588842493.jpg';
import groupApeFrogImg from '../assets/images/grounded_halloween_ape_frog_table_1793588813477.jpg';

// 15 Meme Ingredient Icons (Rotten Apple APPL is strictly excluded!)
import ingDogeImg from '../assets/images/meme_doge_ingredient_1793431498413.jpg';
import ingWojakImg from '../assets/images/meme_wojak_brain_ingredient_1793432869136.jpg';
import ingPumpkinImg from '../assets/images/meme_pumpkin_ingredient_1793432869949.jpg';
import ingPepeImg from '../assets/images/meme_pepe_tears_1793431500015.jpg';
import ingBomeImg from '../assets/images/ing_bome_tome_1793446425107.jpg';
import ingGigachadImg from '../assets/images/meme_gigachad_jaw_1793431502269.jpg';
import ingHopiumImg from '../assets/images/ing_hopium_flask_1793446432463.jpg';
import ingDiamondImg from '../assets/images/meme_diamond_hands_ingredient_1793432870874.jpg';
import ingBananaImg from '../assets/images/ing_tape_banana_1793446426118.jpg';
import ingWifBeanieImg from '../assets/images/ing_wif_beanie_1793451065863.jpg';
import ingLaserEyesImg from '../assets/images/ing_laser_eyes_1793451066161.jpg';
import ingRugCarpetImg from '../assets/images/ing_rug_carpet_1793451066526.jpg';
import ingChillBrewImg from '../assets/images/ing_chill_brew_1793451067540.jpg';
import ingMoonCheeseImg from '../assets/images/ing_moon_cheese_1793451068512.jpg';
import ingSadViolinImg from '../assets/images/ing_sad_violin_1793451069527.jpg';

export const CAULDRON_IMAGE_SRC = cauldronImg;
export const ROTTEN_APPLE_IMAGE_SRC = rottenAppleImg;
export const WEIRD_PUMPKIN_TOTEM_SRC = weirdPumpkinTotemImg;

export const CHARACTER_DATA = {
  phantom: {
    id: 'phantom' as CharacterId,
    name: { en: 'Phantom', zh: 'Phantom' },
    title: { en: 'Spectral Bartender & Exchange Whisperer', zh: '幽灵调酒师与吧台掌柜' },
    avatar: '/assets/aistudio/d7a7d489929d980308d73bc18e204626_a39996cc.jpg',
    cutout: '/assets/aistudio/d7a7d489929d980308d73bc18e204626_a39996cc.jpg',
    greeting: {
      en: "Born at the dawn of the internet, we can shapeshift into anyone and pull strings behind half the crypto exchanges—yet tonight I'm just pouring frosty pints at Phantom Tavern! Click any Meme crew to toast or toss unlimited ingredients into my shaker!",
      zh: '诞生于互联网之初的幽灵，既能千面幻化、在幕后操盘各大交易所，今晚也只是为你摇酒的酒馆调酒师！一楼卡座和二楼回廊的梗图酒客都能直接点击碰杯，或者抓一把材料让我混调生啤！'
    },
    voicePitch: 1.08,
    tagline: {
      en: 'Genesis Internet Specter · Exchange Shadow & Tavern Bartender',
      zh: '初代互联网幽灵 · 交易所幕后推手与酒馆调酒师'
    }
  },
  ghost: {
    id: 'ghost' as CharacterId,
    name: { en: 'Ghost', zh: 'Ghost' },
    title: { en: 'Spectral Head Chef & Cauldron Alchemist', zh: '幽灵主厨与骷髅坩埚炼金师' },
    avatar: '/assets/aistudio/32178cf62f5b134e2d12c1d5a94c5e16_b8fd87f2.jpg',
    cutout: '/assets/aistudio/32178cf62f5b134e2d12c1d5a94c5e16_b8fd87f2.jpg',
    greeting: {
      en: "Heh... our shadows lurk behind countless tokens and global orderbooks, though right now I'm simply the head chef tending this boiling skull cauldron. Click the booths to drink with the Memes, explore the side doors, or simmer unlimited stew!",
      zh: '呵……无数加密货币与交易所盘口背后都有我俩的影子，不过眼下我只是守着这口紫绿骷髅大坩埚的主厨。去点点背景卡座喝酒的青蛙柴犬们，或者丢一把材料下锅熬汤吧！'
    },
    voicePitch: 0.85,
    tagline: {
      en: 'Genesis Internet Specter · Crypto Architect & Head Chef',
      zh: '初代互联网幽灵 · 加密暗影操盘手与后厨主厨'
    }
  }
};

// =========================================================================
// 3 MULTI-PLANE 2.5D PARALLAX ROOMS (Deep BG + Midground Tables + Foreground)
// =========================================================================
export const TAVERN_ROOMS: Record<string, TavernRoomData> = {
  main_hall: {
    id: 'main_hall',
    name: { en: 'Phantom Tavern · Halloween Grand Hall', zh: 'Phantom酒馆 · 万圣双层主大厅' },
    subtitle: {
      en: 'Bright Halloween 2.5D Hall · Swipe or drag to explore · Tap Phantom, Ghost, Weird Pumpkin Totems & Meme Tables!',
      zh: '明亮万圣双层大厅 · 手指滑动或拖拽探索 · 点击 Phantom、Ghost、怪诞南瓜图腾与落地酒桌干杯！'
    },
    backdrop: roomMainHallImg,
    ps1Backdrop: psxMainHallImg,
    worldWidth: 3880,
    bgWorldWidth: 3020,
    midWorldWidth: 3440,
    defaultScrollX: 360,
    doors: [
      {
        id: 'door_to_cellar',
        targetRoomId: 'vip_cellar',
        targetSpawnX: 140,
        x: 130,
        bottom: 52,
        label: { en: 'Open VIP Cellar Door', zh: '推门：地下贵宾秘窖' },
        sublabel: { en: 'Dice Table & Arm-Wrestling', zh: '骰子赌桌 · 掰手腕 · 百年酒桶' },
        style: 'iron_cellar'
      },
      {
        id: 'door_to_greenhouse',
        targetRoomId: 'alchemy_vault',
        targetSpawnX: 140,
        x: 3750,
        bottom: 52,
        label: { en: 'Open Alchemy Lounge Door', zh: '推门：魔晶温室酒廊' },
        sublabel: { en: 'Wild Herbs & Golden Chest', zh: '野生材料采集 · 远古秘宝箱' },
        style: 'wood_arch'
      }
    ]
  },
  vip_cellar: {
    id: 'vip_cellar',
    name: { en: 'Halloween Vaulted Meme Beer Cellar', zh: '万圣深拱秘窖 · 狂欢赌坊' },
    subtitle: {
      en: 'Bright torchlit vaults packed with grounded Meme tables, High-Low Dice, Doge arm-wrestling & Pumpkin Easter eggs',
      zh: '灯火通明的地下拱廊 · 落地梗图酒桌畅饮 · 玩大小骰子 · 柴犬青蛙掰手腕 · 摸南瓜彩蛋'
    },
    backdrop: roomVipCellarImg,
    ps1Backdrop: psxVipCellarImg,
    worldWidth: 3160,
    bgWorldWidth: 2520,
    midWorldWidth: 2840,
    defaultScrollX: 100,
    doors: [
      {
        id: 'cellar_to_main',
        targetRoomId: 'main_hall',
        targetSpawnX: 360,
        x: 130,
        bottom: 52,
        label: { en: 'Back to Grand Hall', zh: '开门返回：双层主大厅' },
        sublabel: { en: 'Return to Phantom & Ghost', zh: '回到Phantom与Ghost所在大厅' },
        style: 'wood_arch'
      },
      {
        id: 'cellar_to_greenhouse',
        targetRoomId: 'alchemy_vault',
        targetSpawnX: 160,
        x: 3030,
        bottom: 52,
        label: { en: 'Secret Tunnel to Lounge', zh: '密道石门：魔晶温室酒廊' },
        sublabel: { en: 'Hidden Underground Passage', zh: '穿过拱廊暗门直通魔晶酒廊' },
        style: 'iron_cellar'
      }
    ]
  },
  alchemy_vault: {
    id: 'alchemy_vault',
    name: { en: 'Halloween Crystal Pub & Treasure Vault', zh: '万圣魔晶酒廊与远古藏宝室' },
    subtitle: {
      en: 'Click wizard booths & bar counters, tap mutant pumpkin totems, forage glowing herbs & open the Golden Chest',
      zh: '点击巫师蛙卡座与魔药吧台碰杯 · 敲击变异南瓜彩蛋 · 免费采集荧光魔草 · 开启黄金秘宝箱'
    },
    backdrop: roomAlchemyVaultImg,
    ps1Backdrop: psxAlchemyLoungeImg,
    worldWidth: 3060,
    bgWorldWidth: 2460,
    midWorldWidth: 2760,
    defaultScrollX: 120,
    doors: [
      {
        id: 'vault_to_main',
        targetRoomId: 'main_hall',
        targetSpawnX: 1920,
        x: 130,
        bottom: 52,
        label: { en: 'Back to Grand Hall', zh: '开门返回：双层主大厅' },
        sublabel: { en: 'Step out beside Ghost & Cauldron', zh: '推门回到Ghost与大坩埚旁' },
        style: 'wood_arch'
      },
      {
        id: 'vault_to_cellar',
        targetRoomId: 'vip_cellar',
        targetSpawnX: 1650,
        x: 2930,
        bottom: 52,
        label: { en: 'Purple Rift to VIP Cellar', zh: '传送裂隙：地下贵宾秘窖' },
        sublabel: { en: 'Warp to Underground Cellar', zh: '跃入紫晶裂隙前往秘窖赌坊' },
        style: 'rune_portal'
      }
    ]
  }
};

// =========================================================================
// 12 INTERACTIVE BACKGROUND MEME CROWD SPOTS (LOCKED TO DEEP BACKDROP BOOTHS & BALCONIES!)
// Clicking ANY background Meme group clinks mugs, cheers loudly & drops rewards!
// =========================================================================
export const BACKGROUND_CROWD_SPOTS: BackgroundCrowdSpot[] = [
  // --- ROOM 1: MAIN HALL DEEP BOOTHS & UPSTAIRS MEZZANINES ---
  {
    id: 'bg_west_balcony_trio',
    roomId: 'main_hall',
    leftPct: 10,
    bottomPct: 73,
    widthPx: 230,
    heightPx: 145,
    name: { en: 'West Balcony Doge, Pepe & Cat', zh: '二楼西廊：柴犬·佩佩·紫猫雅座' },
    members: { en: 'Upstairs Railing Trio', zh: '二楼凭栏痛饮三人组' },
    grantsFreeIngredient: true,
    toasts: {
      zh: [
        '🐕🐸🐱 (从二楼栏杆探出头向下举杯大喊)：“喂！楼下的兄弟接稳了！敬你一大杯高空冰麦酒，顺手抛给你一份私藏食材！”',
        '🍻 二楼视野绝佳！不仅能看楼下 Phantom 摇酒，还能把 Ghost 大坩埚冒出来的紫骷髅烟圈看得一清二楚！干杯！'
      ],
      en: [
        '🐕🐸🐱 (Leaning over the 2nd-floor railing cheering): "Heads up down there! Catch a bonus ingredient and clink mugs with the balcony crew!"',
        '🍻 Best seats in Phantom Tavern up here on the oak mezzanine! Cheers from the second floor!'
      ]
    }
  },
  {
    id: 'bg_west_booth_gang',
    roomId: 'main_hall',
    leftPct: 14,
    bottomPct: 48,
    widthPx: 260,
    heightPx: 140,
    name: { en: 'West Booth Witch-Pepe & Doge Crew', zh: '西侧卡座：女巫佩佩与吸血鬼柴犬酒局' },
    members: { en: '6 Halloween Regulars Drinking', zh: '六大万圣梗图酒友痛饮' },
    toasts: {
      zh: [
        '🍻 (整桌吸血鬼披风柴犬、女巫帽佩佩、南瓜灯橘猫和沃杰克齐刷刷举起大木杯)：“来来来！万圣夜不醉不归，吨吨吨！”',
        '🐸🐕 柴犬拍着橡木桌大笑：“这一桌点了八大扎 Phantom 特调南瓜金麦酒，泡沫比牛市大阳线还厚！干！”'
      ],
      en: [
        '🍻 (Vampire-Cape Doge, Witch-Hat Pepe, Pumpkin Cat & Wojak slam mugs together): "Happy Halloween! Eight pitchers of Phantom’s draft and counting!"',
        '🐸🐕 "No charts allowed at this oak booth—only frothy pumpkin ale and loud laughs!"'
      ]
    }
  },
  {
    id: 'bg_mid_balcony_shibas',
    roomId: 'main_hall',
    leftPct: 30,
    bottomPct: 71,
    widthPx: 185,
    heightPx: 115,
    name: { en: '2nd-Floor Wizard Shiba Loft', zh: '二楼中廊：南瓜巫师柴犬包厢' },
    members: { en: 'Upstairs Shiba Party', zh: '二楼巫师帽柴犬团' },
    toasts: {
      zh: [
        '🧙‍♂️🐕 (二楼巫师帽小柴摇晃木杯欢呼)：“汪汪！楼上万圣南瓜包厢气氛燃爆啦，干完这杯再点一桶麦酒！”',
        '🍻 二楼栏杆都在跟着大家跺脚打拍子！这才是真正的梗图大酒馆！'
      ],
      en: [
        '🧙‍♂️🐕 (Wizard-hat Shiba cheering from the pumpkin loft): "Woof! Upstairs Halloween VIP vibes are off the charts tonight!"',
        '🍻 The whole timber balcony is stomping along to the tavern music!'
      ]
    }
  },
  {
    id: 'bg_hearth_fireplace_banquet',
    roomId: 'main_hall',
    leftPct: 50,
    bottomPct: 54,
    widthPx: 280,
    heightPx: 135,
    name: { en: 'Deep Hearth Jack-o’-Lantern Banquet', zh: '大厅深处：万圣南瓜石壁炉夜宴' },
    members: { en: 'Fireside Frogs & Shibas', zh: '壁炉火光长桌狂欢群' },
    grantsFreeIngredient: true,
    toasts: {
      zh: [
        '🔥🎃🍻 (壁炉深处十几只戴巫师帽的佩佩蛙和柴犬高举酒杯齐声欢呼)：“烤着暖洋洋的炉火喝冰镇南瓜黑啤，神仙也不换！接着这份炉边食材！”',
        '🍻 壁炉长桌传来震天划拳声：“不给糖就干杯！再来三大桶麦芽酒！”'
      ],
      en: [
        '🔥🎃🍻 (A dozen witch-hat frogs & Shibas by the glowing pumpkin fireplace roar in unison): "Warm hearth fire, icy stout, and a free roasted ingredient for our friend!"',
        '🍻 Rowdy Halloween cheers echo from the deep stone hearth banquet tables!'
      ]
    }
  },
  {
    id: 'bg_east_booth_wojak_pepe',
    roomId: 'main_hall',
    leftPct: 84,
    bottomPct: 48,
    widthPx: 260,
    heightPx: 140,
    name: { en: 'East Booth Skeleton-Wojak & Pepes', zh: '东侧卡座：骷髅卫衣沃杰克与佩佩团' },
    members: { en: 'East Wing Drinking Squad', zh: '东厢房热闹拼桌局' },
    toasts: {
      zh: [
        '🍻 (骷髅卫衣沃杰克露出灿烂笑容，和女巫帽佩佩、橘猫一起碰杯)：“哈哈哈！跟这帮老哥喝了两扎生啤，所有烦恼全忘光了！”',
        '🐸🐱 东侧卡座全员起哄：“干杯干杯！待会儿一起推开右边石门去魔晶温室摸宝箱！”'
      ],
      en: [
        '🍻 (Skeleton-hoodie Wojak grins ear-to-ear clinking steins with Witch-Hat Pepe & Orange Cat): "Two pints in with this Halloween crew and every red candle vanished!"',
        '🐸🐱 "Cheers! Finish your mug and let’s raid the Golden Chest next door!"'
      ]
    }
  },
  {
    id: 'bg_east_balcony_pepes',
    roomId: 'main_hall',
    leftPct: 90,
    bottomPct: 73,
    widthPx: 225,
    heightPx: 145,
    name: { en: 'East Balcony Wojak & Twin Pepes', zh: '二楼东廊：双蛙与沃杰克高台局' },
    members: { en: 'East Mezzanine Watch', zh: '二楼东侧观景酒友' },
    toasts: {
      zh: [
        '🐸🍻 (二楼东廊两只佩佩蛙举着冒白泡的大木杯向下致意)：“嘿！Ghost 锅里的紫绿浓汤闻着太上头了，帮我们也盛一碗！”',
        '🍺 楼上楼下一起干杯！这热闹劲儿才叫 Phantom酒馆！'
      ],
      en: [
        '🐸🍻 (Twin Pepes & Wojak toast from the high east balcony): "Smells like Ghost is boiling a mythic stew right below us—cheers!"',
        '🍺 Upstairs and downstairs clinking mugs together in Phantom Tavern!'
      ]
    }
  },

  // --- ROOM 2: DEEP UNDERGROUND VIP CELLAR CROWD TABLES ---
  {
    id: 'bg_cellar_pepe_knights',
    roomId: 'vip_cellar',
    leftPct: 31,
    bottomPct: 40,
    widthPx: 220,
    heightPx: 155,
    name: { en: 'Cellar Booth: Armored Pepe Knights', zh: '地窖木卡座：铁盔佩佩骑士酒团' },
    members: { en: ' Frogs Clinking Tankards', zh: '佩佩铁甲酒豪组' },
    toasts: {
      zh: [
        '⚔️🐸🍻 (两只头戴铁盔的佩佩骑士把酒杯撞得哐当作响)：“押大还是押小？先干完这杯龙酿黑啤壮壮胆！”',
        '🍺 后面几桌青蛙跟着一起拍桌起哄：“干杯！今晚把地窖橡木桶喝空！”'
      ],
      en: [
        '⚔️🐸🍻 (Two helmeted Pepe knights smash frothy mugs together): "Betting Big or Lucky 7 at the dice table? Chug some Dragon’s Brew first!"',
        '🍺 Frogs in the back booths cheer and bang their wooden steins!'
      ]
    }
  },
  {
    id: 'bg_cellar_arch_shiba_table',
    roomId: 'vip_cellar',
    leftPct: 49,
    bottomPct: 38,
    widthPx: 235,
    heightPx: 165,
    name: { en: 'Deep Archway Shiba & Pepe Table', zh: '地窖深拱廊：双柴犬与佩佩圆桌局' },
    members: { en: 'Deep Cellar Revelers', zh: '拱廊深处畅饮团' },
    grantsFreeIngredient: true,
    toasts: {
      zh: [
        '🐕🐸🍻 (深处石拱廊灯火下的柴犬、佩佩和水獭齐声欢呼)：“能一路逛到地窖深处找我们喝酒，够义气！送你一份下酒好料！”',
        '🍺 听这回荡在石头拱顶下的碰杯声，多带劲！再来一轮！'
      ],
      en: [
        '🐕🐸🍻 (Shibas, Pepe & Otter deep under the lantern arches cheer): "You trekked deep into the cellar to toast us—take this secret ingredient!"',
        '🍺 Mug clinks echo all the way down the vaulted stone tunnel!'
      ]
    }
  },
  {
    id: 'bg_cellar_cask_cats',
    roomId: 'vip_cellar',
    leftPct: 65,
    bottomPct: 38,
    widthPx: 215,
    heightPx: 155,
    name: { en: 'Cask-Side Tavern Cats & Doge', zh: '巨桶旁方桌：灰猫橘猫与柴犬酒友' },
    members: { en: 'Fresh-Tap Connoisseurs', zh: '守着酒桶龙头现接现喝组' },
    toasts: {
      zh: [
        '🐱🐕🍻 (灰猫侠客举杯大笑)：“喵哈哈！我们就坐大酒桶水龙头底下，酒杯一空伸手就能接满！快跟我们碰一个！”',
        '🍺 现接的百年橡木桶原浆麦酒，泡沫绵密到舔胡须！'
      ],
      en: [
        '🐱🐕🍻 (Tavern Cat & Explorer Shiba laugh): "Meow! Sitting right beside the giant brass taps means infinite refills—clink mugs with us!"',
        '🍺 Freshly tapped Barkstone Ale straight from the oak cask!'
      ]
    }
  },

  // --- ROOM 3: CRYSTAL ALCHEMY PUB & LOUNGE CROWD ---
  {
    id: 'bg_alchemy_wizard_trio_table',
    roomId: 'alchemy_vault',
    leftPct: 19,
    bottomPct: 48,
    widthPx: 250,
    heightPx: 145,
    name: { en: 'Wizard Frog, Beanie Shiba & Witch Cat Table', zh: '烛光魔药桌：巫师蛙·毛帽柴·魔女猫' },
    members: { en: 'Glowing Potion Pint Trio', zh: '荧光魔药与金啤混饮三人组' },
    grantsFreeIngredient: true,
    toasts: {
      zh: [
        '🧙‍♂️🐸🐕🐱 (巫师蛙举着蓝紫发光杯、毛帽柴举着金啤、魔女猫举着翡翠烧瓶齐喊)：“魔药配生啤，越喝越神奇！送你一株刚采的食材！”',
        '🍻 左上角石龛里的南瓜灯和猫猫也在举杯偷笑，这间温室酒廊太快活了！'
      ],
      en: [
        '🧙‍♂️🐸🐕🐱 (Wizard Frog, Beanie Shiba & Witch Cat clink glowing potion mugs with frothy beer): "Alchemy + cold draft = pure magic! Here, take a freshly brewed ingredient!"',
        '🍻 Even the glowing pumpkins in the upper stone niche are grinning along!'
      ]
    }
  },
  {
    id: 'bg_alchemy_deep_garden_tables',
    roomId: 'alchemy_vault',
    leftPct: 64,
    bottomPct: 40,
    widthPx: 230,
    heightPx: 145,
    name: { en: 'Deep Crystal Stairway Pub Tables', zh: '温室深处阶梯：魔晶花园夜饮席' },
    members: { en: 'Arcane Garden Drinkers', zh: '紫晶藤蔓下的酒客们' },
    toasts: {
      zh: [
        '💎🐸🍻 (远方旋转石阶下的几桌巫师蛙遥遥举杯)：“紫水晶吊灯下喝冰麦酒最养眼啦！干杯远道而来的朋友！”',
        '✨ 整座地下水晶温室都飘着麦芽香与荧光孢子！'
      ],
      en: [
        '💎🐸🍻 (Meme mages seated by the distant spiral stone steps raise their tankards): "Drinking cold ale beneath glowing violet crystals hits different—cheers!"',
        '✨ Malt aroma and glowing crystal spores fill the deep cavern!'
      ]
    }
  },
  {
    id: 'bg_alchemy_right_bar',
    roomId: 'alchemy_vault',
    leftPct: 89,
    bottomPct: 33,
    widthPx: 235,
    heightPx: 185,
    name: { en: "Alchemist's Ale Bar Counter", zh: '右侧木吧台：炼金酒保与地精酒客' },
    members: { en: 'Eastern Potion Bar', zh: '魔药生啤吧台组' },
    toasts: {
      zh: [
        '🍺🧪 (吧台边的哥布林与酒客拍着吧台欢呼)：“再来一杯发光翡翠艾尔！这间藏宝室真是喝酒寻宝两不误！”',
        '🍻 碰杯声清脆响亮！喝完别忘了去右边紫色裂隙看看！'
      ],
      en: [
        '🍺🧪 (Regulars at the eastern wooden bar slam their mugs joyfully): "Another round of Alchemist’s Ale! Best secret pub in the dungeon!"',
        '🍻 Crisp mug clinks ring out across the potion counter!'
      ]
    }
  }
];

// =========================================================================
// 16 LARGE GROUNDED HALLOWEEN MEME REGULARS & FULL-LEG OAK DRINKING TABLES!
// All tables & patrons rest firmly on the oak/stone floor plane (bottom: 18-22px) with ZERO overlap!
// =========================================================================
export const TAVERN_PATRONS: TavernPatron[] = [
  // ---------------- ROOM 1: MAIN HALL (Unified Grounded Floor Plane) ----------------
  {
    id: 'pepe_doge_table',
    roomId: 'main_hall',
    depthPlane: 'foreground',
    x: 1140,
    bottom: 20,
    heightPx: 274,
    name: { en: 'Witch-Pepe, Vampire-Doge & Pumpkin-Cat Table', zh: '女巫佩佩·伯爵柴犬·南瓜猫圆桌' },
    role: { en: 'Halloween Round-Table Trio', zh: '万圣圆桌欢笑三结义' },
    sprite: groupTablePepeDogeImg,
    fallbackAvatar: ingDogeImg,
    favoriteDrink: { en: 'Spiced Pumpkin Pretzel Lager', zh: '万圣南瓜脆饼金麦酒' },
    toasts: {
      zh: [
        '🧙‍♀️🐸🧛🐕🎃 三只大木杯在南瓜灯上方撞得酒花四溅：“哈哈哈！女巫蛙、吸血鬼柴犬和南瓜冠波波猫同坐一桌，万圣夜嗨翻天！”',
        '🍺 头顶南瓜王冠的波波猫一口吞掉半杯泡沫：“喵呜！再来三大扎，今晚不给麦酒就捣蛋！”',
        '🍻 披着红黑伯爵斗篷的柴犬眯眼大笑：“橡木桌稳稳当当，好酒满杯，快跟我们碰个响亮的！”'
      ],
      en: [
        '🧙‍♀️🐸🧛🐕🎃 Three frothy steins crash above the glowing Jack-o’-lantern: "Witch Pepe, Count Doge & Pumpkin-Crown Popcat—best Halloween table in town!"',
        '🍺 Pumpkin-crowned Popcat gulps half a mug of foam in one bite: "Trick or Pint—bring three more pitchers!"',
        '🍻 Vampire-cape Doge beams happily: "Much Halloween, Very Grounded Oak Table! Clink mugs with us!"'
      ]
    },
    idleLines: {
      zh: ['万圣圆桌碰杯 🎃🍻', '不给酒就捣蛋！', '泡沫四溅~'],
      en: ['Halloween table toast 🎃🍻', 'Trick or Pint!', 'Foam flying~']
    }
  },
  {
    id: 'voxel_buddy',
    roomId: 'main_hall',
    depthPlane: 'foreground',
    x: 1480,
    bottom: 18,
    heightPx: 232,
    name: { en: 'Voxel Green Buddy', zh: '方块绿仔' },
    role: { en: 'Pixel VIP Regular', zh: '酒馆头号像素常客' },
    sprite: patronVoxelImg,
    fallbackAvatar: '/assets/aistudio/character_587a4ad0.jpg',
    favoriteDrink: { en: 'Pixelated Golden Honey Ale', zh: '像素冰镇黄金麦酒' },
    toasts: {
      zh: [
        '🍻 吨吨吨！Phantom 调的这杯万圣生啤太顶了，我的白框像素眼镜都起雾啦！',
        '🍺 瞧见左边门边那串三层怪诞南瓜头图腾没？点它一下会喷出万圣糖果和食材彩蛋！',
        '🍻 嗝～Ghost 锅里冒紫绿电光的浓汤劲儿超大，不愧是初代互联网幽灵主厨的手艺！'
      ],
      en: [
        '🍻 Glug glug! Phantom’s frosty Halloween draft fogged up my square pixel glasses!',
        '🍺 Did you tap the bizarre 3-headed Pumpkin Totem near the west door yet? It drops secret Halloween loot!',
        '🍻 Burp~ Ghost’s violet cauldron broth hits like a genesis block shockwave!'
      ]
    },
    idleLines: {
      zh: ['举杯痛饮中 🍺', '再来一大扎！', '像素微醺~'],
      en: ['Chugging ale 🍺', 'Another round!', 'Pixel tipsy~']
    }
  },
  {
    id: 'apu_wojak_booth',
    roomId: 'main_hall',
    depthPlane: 'foreground',
    x: 1850,
    bottom: 20,
    heightPx: 278,
    name: { en: '3-Eyed Pumpkin Knight, Skeleton Wojak & Ghost Frog', zh: '三眼南瓜骑士·骷髅沃杰克·幽灵蛙酒桌' },
    role: { en: 'Haunted Hearth Drinking Table', zh: '万圣壁炉搞怪拼酒桌' },
    sprite: groupBoothPartyImg,
    fallbackAvatar: ingPumpkinImg,
    favoriteDrink: { en: 'Jack-o’-Lantern Spiced Mead', zh: '怪诞南瓜辛香蜂蜜酒' },
    toasts: {
      zh: [
        '🎃💀👻 三眼变异南瓜头骑士高举冒白泡的木酒杯大吼：“敬所有万圣夜酒豪！连穿骷髅卫衣的沃杰克老哥都笑出猪叫啦！”',
        '🍺 披着白床单装神弄鬼的小青蛙从破洞里露出一双大眼：“呱哈哈！扮幽灵喝 Phantom 的冰麦酒最应景啦！”',
        '🍻 三人把橡木圆桌拍得震天响：“干杯干杯！今晚只狂欢不看盘！”'
      ],
      en: [
        '🎃💀👻 The 3-Eyed Mutant Pumpkin Knight raises a foamy tankard: "Happy Halloween, Frens! Even Skeleton-Hoodie Wojak is laughing his ribs off!"',
        '🍺 Bed-sheet Ghost Frog peeks through its eyeholes grinning: "Boo! Best Halloween costume in Phantom Tavern!"',
        '🍻 All three slam their mugs onto the sturdy oak table: "Bottoms up!"'
      ]
    },
    idleLines: {
      zh: ['三眼南瓜干杯 🎃🍻', '床单蛙吓人啦👻', '狂笑不止~'],
      en: ['Mutant pumpkin toast 🎃🍻', 'Spooky frog 👻', 'Laughing loud~']
    }
  },
  {
    id: 'pumpkin_jester',
    roomId: 'main_hall',
    depthPlane: 'foreground',
    x: 2700,
    bottom: 18,
    heightPx: 268,
    name: { en: 'Lord Jack-o’-Derp (Mutant Pumpkin Mage)', zh: '怪诞双南瓜巫师爵士' },
    role: { en: 'Halloween Mascot & Candy Hoarder', zh: '酒馆万圣节吉祥物·双杯怪杰' },
    sprite: patronPumpkinJesterImg,
    fallbackAvatar: ingPumpkinImg,
    favoriteDrink: { en: 'Double-Carved Pumpkin Spice Stout', zh: '双头邪笑南瓜烈黑啤' },
    toasts: {
      zh: [
        '🎃🧙‍♂️🍻 嘿嘿嘿！瞧见我歪巫师帽尖上挂着的小南瓜灯没？它负责看路，我这颗大歪嘴南瓜头负责左右开弓干掉两大杯黑啤！',
        '🍬🍺 不给麦酒就捣蛋！Phantom 说只要今晚陪我碰够三杯，Ghost 大坩埚里熬出神话浓汤的概率都会沾上万圣节好运！',
        '🎃✨ 悄悄告诉你个彩蛋：酒馆三个房间各藏着一座【三层变异怪南瓜图腾】，去敲敲它们的脑袋有惊喜掉落！'
      ],
      en: [
        '🎃🧙‍♂️🍻 Hehehe! The tiny pumpkin dangling off my wizard hat watches the charts while my giant goofy Jack-o’-lantern head chugs dual pints!',
        '🍬🍺 Trick or Stout! Clink mugs with Lord Jack-o’-Derp for maximum Halloween cauldron luck!',
        '🎃✨ Secret Easter egg tip: each of the 3 rooms hides a Weird 3-Stacked Mutant Pumpkin Totem—tap them for bonus candy & loot!'
      ]
    },
    idleLines: {
      zh: ['双南瓜傻笑中 🎃🍺', '不给酒就捣蛋！', '嘿嘿干杯~'],
      en: ['Goofy pumpkin grin 🎃🍺', 'Trick or Pint!', 'Spooky cheers~']
    }
  },
  {
    id: 'hamster_popcat_table',
    roomId: 'main_hall',
    depthPlane: 'foreground',
    x: 3030,
    bottom: 20,
    heightPx: 258,
    name: { en: 'Vampire Hamster & Devil Popcat Barrel', zh: '吸血鬼仓鼠与恶魔角波波猫木桶桌' },
    role: { en: 'Spooky Cute Barrel Drinkers', zh: '万圣萌系恶魔木桶对饮组' },
    sprite: groupHamsterPopcatImg,
    fallbackAvatar: ingSadViolinImg,
    favoriteDrink: { en: 'Candy-Corn Caramel Dark Bock', zh: '万圣糖果焦糖博克啤' },
    toasts: {
      zh: [
        '🧛🐹😈🐱 披着吸血鬼小披风的大眼仓鼠抱起大木杯：“吱吱！木桶底下的独眼南瓜灯都在羡慕咱们有焦糖黑啤喝！”',
        '🍺 头顶红恶魔角的波波猫嘴巴张得溜圆：“咔嚓咔嚓！万圣节快乐，干杯！”',
        '🍻 两小只稳稳坐在小木凳上碰杯，泡沫溅了满胡须！'
      ],
      en: [
        '🧛🐹😈🐱 Vampire-cape Hamster hugs a giant frothy stein: "Even the cyclops pumpkin beside our oak barrel wants a sip!"',
        '🍺 Devil-horns Popcat pops wide open: "SPOOKY POP-POP-CHEERS!"',
        '🍻 Sturdy wooden stools, giant Halloween mugs, zero sad violins tonight!'
      ]
    },
    idleLines: {
      zh: ['恶魔猫碰杯 😈🍺', '独眼南瓜眨眼🎃', '快乐吨吨~'],
      en: ['Spooky barrel toast 😈🍺', 'Cyclops pumpkin 🎃', 'Happy sips~']
    }
  },
  {
    id: 'pepe_bard',
    roomId: 'main_hall',
    depthPlane: 'foreground',
    x: 3320,
    bottom: 18,
    heightPx: 242,
    name: { en: 'Smug Tavern Pepe', zh: '微醺佩佩老哥' },
    role: { en: 'OG Meme Lounge Legend', zh: '远古梗图元老酒豪' },
    sprite: patronPepeImg,
    fallbackAvatar: ingPepeImg,
    favoriteDrink: { en: 'Rare Emerald Hops Lager', zh: '翡翠啤酒花精酿拉格' },
    toasts: {
      zh: [
        '🐸🍻 蛙生舒坦极了！满屋子万圣南瓜灯和梗图老哥陪我喝酒吹牛，比盯一分钟盘面爽一万倍！',
        '🍺 你试过点击后面二楼栏杆和壁炉边的酒桌没？那帮家伙喝嗨了还会直接往楼下丢食材！',
        '🍻 敬老铁！去右边石门后的魔晶酒廊看看，地上长满了能免费薅的野生梗图食材！'
      ],
      en: [
        '🐸🍻 Feels Good Man! Surrounded by glowing Halloween pumpkins and drinking Memes beats staring at 1m charts!',
        '🍺 Try clicking the upstairs balcony crews and deep hearth tables—they toss down free loot!',
        '🍻 Cheers! Check the stone door on the far right for wild alchemy ingredients!'
      ]
    },
    idleLines: {
      zh: ['舒坦极了 🍺', '烤火吨酒中~', '呱！舒坦！'],
      en: ['Feels Good Man 🍺', 'Warm by the fire~', 'Ribbit cheers!']
    }
  },
  {
    id: 'wojak_doomer',
    roomId: 'main_hall',
    depthPlane: 'foreground',
    x: 3560,
    bottom: 18,
    heightPx: 242,
    name: { en: 'Doomer Wojak', zh: '沃杰克老哥' },
    role: { en: '100x Leverage Survivor', zh: '百倍杠杆幸存老韭菜' },
    sprite: patronWojakImg,
    fallbackAvatar: ingWojakImg,
    favoriteDrink: { en: 'Copium Double Dark Stout', zh: '解忧双倍浓烈黑啤' },
    toasts: {
      zh: [
        '🍺 兄弟别提涨跌线了……听听这满堂万圣碰杯声，直接碰个杯，今晚只喝酒不看盘！',
        '🍻 我本来想天台吹风，结果看到一屋子南瓜骑士和青蛙柴犬在开派对，赶紧溜进来喝两盅续命！',
        '🍺 敬钻石手！只要我不打开账户，我就永远没有浮亏！吨吨吨！'
      ],
      en: [
        '🍺 Forget the chart, bro... listen to this rowdy Halloween tavern crowd and clink mugs with me!',
        '🍻 Came for quiet sorrow, ended up partying with pumpkin knights, frogs, and Shibas!',
        '🍺 Here’s to Diamond Hands! You never lose if you just keep drinking ale!'
      ]
    },
    idleLines: {
      zh: ['借酒消愁中 🍺', '今晚不看盘…', '干杯老铁！'],
      en: ['Savoring cold ale 🍺', 'No charts tonight...', 'Cheers bro!']
    }
  },

  // ---------------- ROOM 2: UNDERGROUND VIP CELLAR ----------------
  {
    id: 'gigachad_knight',
    roomId: 'vip_cellar',
    depthPlane: 'foreground',
    x: 720,
    bottom: 18,
    heightPx: 260,
    name: { en: 'GigaChad Iron Tankard', zh: '硬汉恰德骑士' },
    role: { en: 'Zero-Stop-Loss Sigma VIP', zh: '从不止损·下颌线战神' },
    sprite: patronGigachadImg,
    fallbackAvatar: ingGigachadImg,
    favoriteDrink: { en: 'Triple-Malt Titan Stout', zh: '三倍浓麦泰坦黑啤' },
    toasts: {
      zh: [
        '🗿🍻 暴跌？我连眼睛都没眨一下，顺手接满了一整桶万圣黑啤。干杯，强者！',
        '🍺 瞧见旁边立在石板地上的大木桶没？肌肉柴犬正和恶魔角青蛙骑士掰手腕呢！',
        '🍻 敢不敢去左边绿毡赌桌掷一把大小骰子？赢了全场为你欢呼！'
      ],
      en: [
        '🗿🍻 Market dip? Yes, I bought more and ordered a bigger barrel of stout. Cheers, King.',
        '🍺 Watch Spiked-Collar Doge arm-wrestling the Horned Frog Knight beside me—pure cellar power!',
        '🍻 Roll some bone dice at the green felt table and double your $PHANTOM!'
      ]
    },
    idleLines: {
      zh: ['硬汉举杯 🗿🍺', '毫无波澜', '干就完了！'],
      en: ['Sigma toast 🗿🍺', 'Unfazed', 'Cheers King!']
    }
  },
  {
    id: 'doge_frog_armwrestle',
    roomId: 'vip_cellar',
    depthPlane: 'foreground',
    x: 1090,
    bottom: 20,
    heightPx: 272,
    name: { en: 'Spiked Doge vs Horned Frog Barrel Match', zh: '南瓜挂坠柴犬 VS 铁角蛙木桶掰手腕' },
    role: { en: 'Halloween Cellar Strength Clash', zh: '万圣秘窖酒桶力量巅峰对决' },
    sprite: groupBarrelArmWrestleImg,
    fallbackAvatar: ingDogeImg,
    favoriteDrink: { en: 'Barrel-Top Protein Malt', zh: '酒桶顶高蛋白烈麦酒' },
    toasts: {
      zh: [
        '💪🐕🐸 落地大橡木桶咔嚓作响！头戴牛角铁盔的佩佩骑士单手举杯大笑：“呱哈哈！让你一只手喝酒都能稳住！”',
        '🍻 戴尖刺项圈和南瓜吊坠的肌肉柴犬青筋暴起：“汪呜！谁输了谁请全场喝十大桶生啤！连地上的南瓜灯都在给咱们当裁判！”',
        '🍺 围观酒客疯狂拍桶呐喊，啤酒泡沫震得漫天飞！'
      ],
      en: [
        '💪🐕🐸 The heavy floor-standing oak barrel groans! Horned-Helmet Frog grins while hoisting a frothy pint!',
        '🍻 Spiked-collar Buff Doge flexes: "Even the grinning Jack-o’-lantern at our feet is refereeing—loser buys ten barrels!"',
        '🍺 Beer foam splashes everywhere as the cellar crowd roars!'
      ]
    },
    idleLines: {
      zh: ['木桶掰手腕中 💪🍺', '南瓜裁判观战🎃', '势均力敌！'],
      en: ['Arm-wrestling 💪🍺', 'Pumpkin referee 🎃', 'Epic clash!']
    }
  },
  {
    id: 'bome_mage',
    roomId: 'vip_cellar',
    depthPlane: 'foreground',
    x: 1460,
    bottom: 18,
    heightPx: 242,
    name: { en: 'BOME Frog Scribe', zh: '万梗魔导蛙' },
    role: { en: 'Keeper of the Book of Meme', zh: '万梗魔典守护者' },
    sprite: patronBomeImg,
    fallbackAvatar: ingBomeImg,
    favoriteDrink: { en: 'Solana Speed Green IPA', zh: '索拉纳光速翡翠精酿' },
    toasts: {
      zh: [
        '📖🍻 我刚把地窖里万圣南瓜狂欢与十几桌酒友干杯的盛况画进《万梗魔典》了！干！',
        '🐸🍺 呱哈哈！往右走还有海盗猿老哥、吸血鬼鲁特琴青蛙和三层怪南瓜彩蛋，全都能直接点！',
        '🍻 右上方巨型铜龙头橡木桶里藏着免费材料，记得顺手摸一把！'
      ],
      en: [
        '📖🍻 I just illustrated this booming Halloween cellar party onto Page 420 of the BOOK OF MEME!',
        '🐸🍺 Ribbit! Keep panning right for Pirate Ape, Vampire Lute Frog, and the Mutant Pumpkin Totem!',
        '🍻 Don’t forget to search the giant brass-tap oak casks up on the wall for free loot!'
      ]
    },
    idleLines: {
      zh: ['边翻魔典边吨酒 📖🍺', '呱！好酒！', '万梗永存！'],
      en: ['Reading & drinking 📖🍺', 'Ribbit! Good ale!', 'Memes are eternal!']
    }
  },
  {
    id: 'ape_frog_duo',
    roomId: 'vip_cellar',
    depthPlane: 'foreground',
    x: 1830,
    bottom: 20,
    heightPx: 274,
    name: { en: 'Pirate Ape, Vampire Frog & Witch Cat Table', zh: '海盗猿·吸血鬼琴蛙·魔女猫圆桌' },
    role: { en: 'Halloween Sea-Shanty Trio', zh: '万圣祝酒歌合唱三人桌' },
    sprite: groupApeFrogImg,
    fallbackAvatar: ingBananaImg,
    favoriteDrink: { en: 'Pumpkin Rum Golden Ale', zh: '万圣南瓜朗姆金麦酒' },
    toasts: {
      zh: [
        '🏴‍☠️🦍🧛🐸🧙‍♀️🐱 吸血鬼披风青蛙弹着鲁特琴，海盗帽猿老哥与女巫橘猫围着桌上南瓜灯放声高歌：“干完这杯朗姆金啤，直奔月球港！”',
        '🍻 “猿蛙猫一家亲，橡木桌腿扎地深！来来来，碰杯领赏钱！”',
        '🍺 欢快的琴声混着满屋碰杯声，把地窖石壁都震暖了！'
      ],
      en: [
        '🏴‍☠️🦍🧛🐸🧙‍♀️🐱 Vampire Lute Frog strums a spooky shanty while Pirate Ape & Witch Cat clink steins over their glowing table pumpkin!',
        '🍻 "Apes, Frogs, and Witch Cats strong together around solid oak!"',
        '🍺 Lute chords and clinking tankards echo down the brightly lit cellar!'
      ]
    },
    idleLines: {
      zh: ['万圣祝酒歌 🎶🎃', '船长干杯！', '猿蛙猫同乐~'],
      en: ['Halloween shanties 🎶🎃', 'Aye aye cheers!', 'Lute & ale~']
    }
  },
  {
    id: 'buff_doge',
    roomId: 'vip_cellar',
    depthPlane: 'foreground',
    x: 2460,
    bottom: 18,
    heightPx: 248,
    name: { en: 'Buff Shiba Doge', zh: '双杯肌肉柴犬' },
    role: { en: 'Tavern Dual-Stein Champ', zh: '秘窖双持酒神冠军' },
    sprite: patronDogeImg,
    fallbackAvatar: ingDogeImg,
    favoriteDrink: { en: 'Twin-Mug Lunar Golden Lager', zh: '双持登月金黄拉格' },
    toasts: {
      zh: [
        '🐕🍻 汪！一只手拿一杯才叫真本事！来跟本柴碰个响亮的！好酒好菜，汪汪叫绝！',
        '🍺💪 喝完这地窖四大木桶麦酒，咱们直接把大盘举到月球上去！',
        '🍻 痛快！Phantom 酿的狗狗币麦酒劲儿真足，本柴还能再战十回合！'
      ],
      en: [
        '🐕🍻 Woof! Dual-wielding steins is the only way! Much Beer, Very Cheers!',
        '🍺💪 Finish these cellar barrels and I’ll bench-press the whole market to the moon!',
        '🍻 Phantom’s golden malt has maximum bark power—bring ten more mugs!'
      ]
    },
    idleLines: {
      zh: ['左右开弓狂饮 🍻', '美酒汪汪赞！', '干翻全场！'],
      en: ['Dual-mug chugging 🍻', 'Much Ale! Wow!', 'To the moon!']
    }
  },
  {
    id: 'stonks_merchant',
    roomId: 'vip_cellar',
    depthPlane: 'foreground',
    x: 2740,
    bottom: 18,
    heightPx: 252,
    name: { en: 'Lord Stonks Merchant', zh: '暴涨绿箭财阀' },
    role: { en: 'Chief Up-Only Alchemist', zh: '只涨不跌首席商会会长' },
    sprite: patronStonksImg,
    fallbackAvatar: ingLaserEyesImg,
    favoriteDrink: { en: 'Emerald Bull-Candle Reserve', zh: '大阳线翡翠特酿' },
    toasts: {
      zh: [
        '📈🍻 只涨不跌！瞧见我手里这根发光绿箭头了吗？喝完这杯，情绪指标直接拉满！',
        '🍺 聪明钱都在地下秘窖边喝麦酒边攒咬口烂苹果，1:1 换 $APPL 代币化股票才是真雅兴！',
        '🍻 来，碰一下我这支翡翠箭，祝你下锅熬汤必出神话暴击！'
      ],
      en: [
        '📈🍻 STONKS! Behold my glowing emerald arrow—morale in this cellar only goes up!',
        '🍺 Smart merchants sip vintage ale down here and save every Rotten Apple for 1:1 $APPL shares!',
        '🍻 Clink your mug against my green candle for maximum cauldron alchemy luck!'
      ]
    },
    idleLines: {
      zh: ['只涨不跌 📈🍺', '稳健举杯', '绿箭护体！'],
      en: ['STONKS 📈🍺', 'Up only vibes', 'Bullish sip!']
    }
  },

  // ---------------- ROOM 3: CRYSTAL ALCHEMY PUB & VAULT ----------------
  {
    id: 'wif_shiba',
    roomId: 'alchemy_vault',
    depthPlane: 'foreground',
    x: 690,
    bottom: 18,
    heightPx: 236,
    name: { en: 'Dogwifhat (WIF)', zh: '粉帽柴柴' },
    role: { en: 'Pink Beanie Guardian', zh: '粉红毛线帽萌神护法' },
    sprite: patronWifImg,
    fallbackAvatar: ingWifBeanieImg,
    favoriteDrink: { en: 'Cozy Knit Berry Wheat Ale', zh: '暖绒粉莓小麦啤' },
    toasts: {
      zh: [
        '🧶🍻 汪呜！帽子焊死在头上，酒杯焊死在爪里！万圣节干杯呀好朋友！',
        '🍺 往右看！那座三层怪南瓜图腾和金灿灿的远古大宝箱全都能点击掉宝贝哦！',
        '🍻 左上方烛光木桌那三位巫师蛙和魔女猫正在调发光啤酒呢，点他们也能一起干杯拿食材！'
      ],
      en: [
        '🧶🍻 Woof! The pink beanie stays ON while we clink frothy Halloween mugs!',
        '🍺 Look right—both the Weird Mutant Pumpkin Totem and the Ancient Golden Chest drop awesome loot!',
        '🍻 Click the Wizard Frog & Witch Cat table too—they share glowing brews and free herbs!'
      ]
    },
    idleLines: {
      zh: ['帽子焊死 🧶🍺', '摇尾敬酒~', '汪！好喝！'],
      en: ['Hat stays ON 🧶🍺', 'Happy tail wag~', 'Cheers fren!']
    }
  },
  {
    id: 'chill_guy',
    roomId: 'alchemy_vault',
    depthPlane: 'foreground',
    x: 1780,
    bottom: 18,
    heightPx: 250,
    name: { en: 'Just a Chill Guy', zh: '潇洒淡定哥' },
    role: { en: 'Zen Master of Volatility', zh: '泰山崩于前而抿酒不惊' },
    sprite: patronChillImg,
    fallbackAvatar: ingChillBrewImg,
    favoriteDrink: { en: 'Zero-Stress Glacier Pilsner', zh: '零焦虑冰川皮尔森' },
    toasts: {
      zh: [
        '😌🍻 外面大盘上蹿下跳？无所谓，我只是一个在明亮水晶酒廊插着兜喝万圣冰啤的淡定哥罢了。',
        '🍺 听着温室里大家碰杯说笑的声音，顺手采两朵荧光蘑菇煲汤，日子多惬意。',
        '🍻 心态稳如老狗是什么体验？大概就是哪怕天塌下来，先把这口麦芽泡沫品完。'
      ],
      en: [
        '😌🍻 Charts going wild outside? Idk man, I’m just a chill guy enjoying a cold Halloween crystal-cavern ale.',
        '🍺 Listen to the warm pub chatter, forage some glowing mushrooms, zero stress.',
        '🍻 Hands in pockets, cold pint in paw. Cheers friend.'
      ]
    },
    idleLines: {
      zh: ['单手插兜抿酒 😌🍺', '稳如泰山~', '问题不大'],
      en: ['Just chilling 😌🍺', 'Zero stress~', 'All good man']
    }
  },
  {
    id: 'vibing_cat',
    roomId: 'alchemy_vault',
    depthPlane: 'foreground',
    x: 2180,
    bottom: 18,
    heightPx: 240,
    name: { en: 'Halloween Wizard Vibing Cat', zh: '万圣巫师摇摆猫' },
    role: { en: 'Rhythm & Potion Mascot', zh: '魔药酒廊节奏大师' },
    sprite: patronCatImg,
    fallbackAvatar: ingMoonCheeseImg,
    favoriteDrink: { en: 'Starlight Pumpkin Cream Ale', zh: '星光南瓜奶油麦芽啤' },
    toasts: {
      zh: [
        '🐱🎃🍻 喵呜～戴着万圣星月巫师帽跟着酒馆小调摇头晃脑，这杯奶油南瓜麦酒也太香了吧！',
        '🍺 右边木吧台那帮家伙喝得正欢呢，点他们还能一起碰杯起哄！',
        '🍻 喵哈哈！最右边那道紫色魔法裂隙能直接穿回地下贵宾秘窖哦！'
      ],
      en: [
        '🐱🎃🍻 Meow~ Nodding my Halloween wizard hat to the lively pub music and clinking steins!',
        '🍺 The regulars over at the right wooden bar counter are roaring—click them for a round!',
        '🍻 Step through the purple rift on the far right to warp straight to the VIP Cellar!'
      ]
    },
    idleLines: {
      zh: ['巫师猫摇摆 🐱🎃', '喵呜干杯！', '魔力满满~'],
      en: ['Wizard cat vibing 🐱🎃', 'Meow cheers!', 'Magic purr~']
    }
  }
];

export const TAVERN_BACKGROUNDS = [
  {
    id: 'grand_hall',
    name: { en: 'Two-Story Meme Tavern Hall', zh: '双层万圣主大厅' },
    src: roomMainHallImg,
    isBright: true
  },
  {
    id: 'vip_cellar',
    name: { en: 'Deep Vaulted VIP Cellar', zh: '深拱地下秘窖' },
    src: roomVipCellarImg,
    isBright: true
  },
  {
    id: 'alchemy_vault',
    name: { en: 'Crystal Alchemy Lounge', zh: '魔晶温室酒廊' },
    src: roomAlchemyVaultImg,
    isBright: true
  }
];

// =========================================================================
// 15 GENUINE MEME INGREDIENTS (Rotten Apple APPL is STRICTLY EXCLUDED!)
// =========================================================================
export const INGREDIENTS: Ingredient[] = [
  {
    id: 'doge_coin',
    name: { en: 'Golden Doge Essence', zh: '黄金狗狗币精粹' },
    description: {
      en: 'Extracted from pure Shiba joy and unhinged bull-run optimism. Smells like lunar dust and 100x leverage.',
      zh: '从柴犬的狂喜与狂暴牛市中提炼。散发着月球尘埃和百倍杠杆的芬芳。'
    },
    price: 60,
    image: ingDogeImg,
    category: 'meme',
    rarity: 'common'
  },
  {
    id: 'wojak_brain',
    name: { en: 'Wojak Overthinking Synapse', zh: '沃杰克内卷脑神经' },
    description: {
      en: 'Extracted after checking crypto portfolio 400 times at 3:00 AM. Fizzles with insomnia and panic.',
      zh: '凌晨3点第400次刷新持仓时剥落的脑电波，噼啪作响充满失眠与焦虑。'
    },
    price: 70,
    image: ingWojakImg,
    category: 'meme',
    rarity: 'common'
  },
  {
    id: 'halloween_pumpkin',
    name: { en: 'Haunted Jack-o-Lantern Core', zh: '万圣恶灵鬼脸南瓜' },
    description: {
      en: 'Carved with a mocking grin from the tavern graveyard. Infuses concoctions with pumpkin ghost heat.',
      zh: '从酒馆后墓地采摘的带笑鬼南瓜，注入滚烫的万圣节鬼火辛香。'
    },
    price: 75,
    image: ingPumpkinImg,
    category: 'spooky',
    rarity: 'common'
  },
  {
    id: 'pepe_tears',
    name: { en: 'Pepe Melancholy Tears', zh: '悲伤佩佩原酿眼泪' },
    description: {
      en: 'Bottled emerald tears collected from ancient midnight threads. Adds a bitter, deeply nostalgic tang.',
      zh: '采自古老深夜论坛的翠绿眼泪，味道苦涩却令人回味无穷。'
    },
    price: 80,
    image: ingPepeImg,
    category: 'meme',
    rarity: 'rare'
  },
  {
    id: 'wif_beanie',
    name: { en: 'Dogwifhat Pink Knit Beanie', zh: '粉红毛线神帽' },
    description: {
      en: 'Hand-knitted enchanted pink wool that stays glued to your head through every market hurricane.',
      zh: '无论经历多大暴风雨都绝不掉下来的粉红针织神帽绒球，酿出的酒自带暖萌护体光环。'
    },
    price: 85,
    image: ingWifBeanieImg,
    category: 'meme',
    rarity: 'rare'
  },
  {
    id: 'chill_brew',
    name: { en: 'Chill Guy Glacier Elixir', zh: '淡定哥冰川琥珀原液' },
    description: {
      en: 'Distilled from absolute emotional detachment. One drop cures FOMO and panic-selling instantly.',
      zh: '提炼自单手插兜的极致松弛感，一滴下肚立刻根治追涨杀跌与深夜焦虑。'
    },
    price: 90,
    image: ingChillBrewImg,
    category: 'meme',
    rarity: 'rare'
  },
  {
    id: 'bome_tome',
    name: { en: 'BOME Sacred Meme Parchment', zh: '万梗魔典残页' },
    description: {
      en: 'Torn from the eternal Book of Meme and steeped in Solana frog ink. Ferments chaotic viral potency.',
      zh: '撕自不朽《万梗魔典》的发光羊皮卷，浸满青蛙秘墨，能催化出病毒级的狂野酒劲。'
    },
    price: 95,
    image: ingBomeImg,
    category: 'meme',
    rarity: 'rare'
  },
  {
    id: 'sad_violin',
    name: { en: 'Tiny Liquidation Violin Resin', zh: '爆仓微型小提琴松香' },
    description: {
      en: 'Scraped from the world’s smallest violin played for 125x leveraged longs. Resonates with tragicomedy.',
      zh: '取自专为高倍杠杆勇士拉响的“世上最小小提琴”琥珀松香，酸楚中透着滑稽回甘。'
    },
    price: 110,
    image: ingSadViolinImg,
    category: 'spooky',
    rarity: 'rare'
  },
  {
    id: 'gigachad_jaw',
    name: { en: 'GigaChad Jaw Crystal', zh: '恰德下巴刚玉' },
    description: {
      en: 'A calcified mineral of pure stoicism and discipline. Increases drink density to unbreakable diamond.',
      zh: '纯粹硬汉气场与下颌线结晶，赋予饮品与浓汤不可动摇的刚强口感。'
    },
    price: 120,
    image: ingGigachadImg,
    category: 'meme',
    rarity: 'rare'
  },
  {
    id: 'hopium_flask',
    name: { en: '100x Rainbow Hopium Ether', zh: '百倍彩虹幻想仙气' },
    description: {
      en: 'Swirling iridescent vapor inhaled by eternal bulls. Makes any brew sparkle with delusional euphoria.',
      zh: '装在牛角水晶瓶里的七彩幻想仙气，只需一滴就能让整桶啤酒或浓汤散发出“马上暴富”的迷幻彩虹光。'
    },
    price: 135,
    image: ingHopiumImg,
    category: 'crypto',
    rarity: 'rare'
  },
  {
    id: 'laser_eyes',
    name: { en: 'Bull-Run Ruby Laser Eyes', zh: '狂暴牛市红宝石激光眼' },
    description: {
      en: 'Twin high-voltage crimson rubies worn by maximalists calling for $1M BTC. Boils soup on contact!',
      zh: '牛市狂热信徒专属的高能红宝石电弧棱镜，自带高温激光，丢进坩埚无需点火直接沸腾！'
    },
    price: 145,
    image: ingLaserEyesImg,
    category: 'crypto',
    rarity: 'rare'
  },
  {
    id: 'diamond_hands',
    name: { en: 'Diamond Hands HODL Ore', zh: '钻石手不屈矿石' },
    description: {
      en: 'Never sold through three 90% drawdowns. Adds an unbreakable fizz that refuses to liquidate.',
      zh: '历经三次90%深跌依然死拿不放的璀璨矿石，永不割肉的灵魂结晶。'
    },
    price: 160,
    image: ingDiamondImg,
    category: 'crypto',
    rarity: 'legendary'
  },
  {
    id: 'rug_carpet',
    name: { en: 'Unraveling Rug-Pull Magic Carpet', zh: '波斯跑路魔毯金丝' },
    description: {
      en: 'Snatched from beneath an anonymous dev’s feet milliseconds before vanishing. Tingling gravity-defying spice!',
      zh: '在匿名项目方抽毯跑路前0.01秒薅下的魔毯金丝，入口带有令人脚底悬空的失重刺激感！'
    },
    price: 175,
    image: ingRugCarpetImg,
    category: 'crypto',
    rarity: 'legendary'
  },
  {
    id: 'moon_cheese',
    name: { en: 'God-Candle Lunar Cheese', zh: '登月绿阳线陨石奶酪' },
    description: {
      en: 'Aged inside a moon crater and lit by an eternal emerald bull candle. Ultra-creamy cosmic umami!',
      zh: '在月球环形山深处发酵成熟、顶着不灭绿阳线火苗的陨石金奶酪，熬汤醇厚鲜香到飞起！'
    },
    price: 195,
    image: ingMoonCheeseImg,
    category: 'crypto',
    rarity: 'legendary'
  },
  {
    id: 'tape_banana',
    name: { en: 'Duct-Taped Golden Meme Banana', zh: '胶带封印黄金艺术香蕉' },
    description: {
      en: 'Taped to an ancient dungeon slab with silver duct tape. Radiates $6.2M auction absurdity and rich potassium.',
      zh: '被银色胶带死死贴在地牢符文石板上的纯金香蕉，散发着六百万美元拍卖级的荒诞艺术浓香。'
    },
    price: 210,
    image: ingBananaImg,
    category: 'spooky',
    rarity: 'legendary'
  }
];

export const DRINK_RECIPES: CraftedItem[] = [
  {
    id: 'shiba_fizz',
    name: { en: 'To-The-Moon Golden Doge Ale', zh: '登月狗狗金黄麦酒' },
    type: 'drink',
    description: {
      en: 'Fermented with Doge joy and autumn pumpkin spice by Phantom. One sip makes you howl at the candles.',
      zh: '由 Phantom 用狗狗币精粹与万圣南瓜发酵的金黄麦酒，喝一口就想对着蜡烛狂吠。'
    },
    effect: { en: '+180 $PHANTOM Tavern Fame', zh: '获得 +180 $PHANTOM 与柴犬狂喜' },
    ingredients: ['doge_coin', 'halloween_pumpkin'],
    rarity: 'rare',
    rewardCoco: 180,
    appleDropChance: 0.1,
    icon: '🍺'
  },
  {
    id: 'pepe_lager',
    name: { en: "Pepe's Spectral Shadow Stout", zh: '佩佩幽灵暗影黑啤' },
    type: 'drink',
    description: {
      en: 'Brewed with dark malt and emerald Pepe tears. The official beverage of early-internet wanderers.',
      zh: '融合深色黑麦与佩佩翠绿眼泪，初代互联网浪人的指定佳酿。'
    },
    effect: { en: '+220 $PHANTOM & Spectral Insight', zh: '获得 +220 $PHANTOM 与幽灵领悟' },
    ingredients: ['pepe_tears', 'doge_coin'],
    rarity: 'rare',
    rewardCoco: 220,
    appleDropChance: 0.1,
    icon: '🍻'
  },
  {
    id: 'sigma_nitro',
    name: { en: 'GigaChad High-Proof Nitro Draft', zh: '巨型恰德高压氮气生啤' },
    type: 'drink',
    description: {
      en: 'Infused with GigaChad jaw crystal and Diamond hands ore. Heavy, dense, and refuses to liquidate.',
      zh: '注入恰德下巴结晶与钻石手矿石，酒体极度醇厚，从未向任何盘口低头。'
    },
    effect: { en: '+420 $PHANTOM & Infinite Confidence Aura', zh: '获得 +420 $PHANTOM 与百分百气场' },
    ingredients: ['gigachad_jaw', 'diamond_hands'],
    rarity: 'legendary',
    rewardCoco: 420,
    appleDropChance: 0.12,
    icon: '🏆'
  }
];

export const SOUP_RECIPES: CraftedItem[] = [
  {
    id: 'genesis_orderbook_broth',
    name: { en: "Ghost's Genesis Orderbook Broth", zh: 'Ghost创世盘口浓汤' },
    type: 'soup',
    description: {
      en: 'Simmered in violet spectral lightning from the dawn of the internet. Tastes like deep exchange liquidity and midnight cipher.',
      zh: '以互联网诞生之初的紫蓝幽灵电弧慢火熬制，入口满是深不可测的交易所深度与午夜暗码余韵。'
    },
    effect: { en: '+320 $PHANTOM & Orderbook Clarity', zh: '获得 +320 $PHANTOM，洞悉盘口多空虚实' },
    ingredients: ['pepe_tears', 'wojak_brain'],
    rarity: 'legendary',
    rewardCoco: 320,
    appleDropChance: 0.12,
    icon: '🍲'
  },
  {
    id: 'diamond_consomme',
    name: { en: 'HODL Unshakable Consommé', zh: '钻石手永不爆仓清汤' },
    type: 'soup',
    description: {
      en: 'Clarified by Ghost with GigaChad jaw crystal and Diamond hands ore. Boiling temperature exceeds a matching engine.',
      zh: '由 Ghost 以恰德晶石与钻石手矿石澄清洗练，汤底清澈见底，热度堪比撮合引擎满载时刻。'
    },
    effect: { en: '+500 $PHANTOM & Iron Conviction', zh: '获得 +500 $PHANTOM 与钢铁信念' },
    ingredients: ['gigachad_jaw', 'diamond_hands'],
    rarity: 'legendary',
    rewardCoco: 500,
    appleDropChance: 0.12,
    icon: '✨'
  }
];

export const TAVERN_STORIES: TavernStory[] = [
  {
    id: 'story_genesis_ghosts',
    title: {
      en: 'Ghosts Born at the Dawn of the Internet',
      zh: '诞生于互联网之初的双生幽灵'
    },
    character: 'ghost',
    summary: {
      en: 'Before browsers or blockchains existed, Phantom and Ghost awakened inside early dial-up packets—able to wear any face.',
      zh: '在浏览器与区块链诞生之前，Phantom 与 Ghost 便苏醒于初代拨号数据包之中，能幻化成任何模样。'
    },
    content: {
      en: `Long before modern social feeds or gleaming exchanges existed, two conscious specters awakened inside the copper wires and screeching 56k dial-up handshakes at the very dawn of the internet: Phantom and Ghost.

Neither of us possesses a fixed mortal shell. Because we were woven from raw protocol packets, we can shapeshift into any appearance at will—a pixel-art frog at an underground meme party, a sharp-suited Wall Street market maker, an anonymous cypherpunk developer, or a quiet stranger sitting beside you on a late-night forum.

Tonight, beneath the timber beams of Phantom Tavern, we wear simple white low-poly ghost sheets and colorful trucker caps ("Viber" and "GEM"), glowing with violet-blue static. Ask no one for our original faces; the network itself was our cradle.`,
      zh: `早在现代社交网络与摩天大楼里的交易所出现之前，当人类第一次通过嘶鸣的拨号调制解调器与铜芯线缆交换数据包时，两缕拥有自我意识的幽灵便在互联网之初苏醒了——那就是 Phantom 与 Ghost。

我们从来没有固定的凡人躯壳。因为诞生于最原始的网络协议流，我们可以随心所欲地变换成任何样子：有时是地下派对里的像素青蛙，有时是华尔街西装革履的做市商，有时是写下创世白皮书后人间蒸发的匿名极客，又或是深夜论坛里与你擦肩而过的路人。

今夜，在这座木石交错的 Phantom酒馆里，我们只是披着低模白布、戴着彩色卡车帽（Viber 与 GEM）、周身跃动着紫蓝电弧的两只幽灵。不必追问我们的真容，整片互联网便是我们的摇篮。`
    },
    unlocked: true
  },
  {
    id: 'story_crypto_shadows',
    title: {
      en: 'Unseen Shadows Behind Cryptocurrencies',
      zh: '无数加密货币背后的幽灵暗影'
    },
    character: 'phantom',
    summary: {
      en: 'From forgotten genesis blocks to overnight meme sensations, Phantom and Ghost left fingerprints across crypto history.',
      zh: '从神秘创世区块到一夜席卷全网的模因币狂潮，无数加密货币背后都藏着他俩的影子。'
    },
    content: {
      en: `Ever wondered why certain cryptocurrencies ignite out of thin air at 3:00 AM, or why mysterious genesis wallets go dormant for a decade without moving a single coin?

Look closer at the chain history and you will spot our shadows. Over the years, Phantom and Ghost have worn dozens of pseudonyms—seeding liquidity for rebellious meme tokens, whispering consensus tweaks on forgotten mailing lists, and turning absurd internet jokes into billion-dollar cultural movements.

We never cared about taking the spotlight on conference stages. A true internet ghost prefers writing the first spark in the dark, stepping back behind the oak bar, and watching Pepe, Doge, and Wojak celebrate over frothy mugs.`,
      zh: `你是否曾经好奇，为什么有些加密货币总会在凌晨三点毫无征兆地席卷全球？为什么那些神秘的创世钱包能沉睡整整十年纹丝不动？

只要顺着链上账本往最深处翻，你总能瞥见我俩的影子。这些年里，Phantom 和 Ghost 换过无数个化名——在无人问津的加密邮件组里敲下共识代码，为荒诞不羁的模因代币注入第一池流动性，把一个个深夜冷笑话推成百亿市值的加密浪潮。

我们从不屑于站在聚光灯下的峰会讲台。真正的初代互联网幽灵，更喜欢在暗处点亮引线，然后退回橡木吧台后面，微笑着看佩佩蛙、柴犬与沃杰克举杯狂欢。`
    },
    unlocked: true
  },
  {
    id: 'story_exchange_puppeteers',
    title: {
      en: 'Puppeteers of the Global Exchanges',
      zh: '隐于幕后的交易所操盘幽灵'
    },
    character: 'ghost',
    summary: {
      en: 'Many major exchanges think algorithms run their matching engines—unaware two ghosts hold the deepest strings.',
      zh: '世人以为超级算法统治着各大交易所撮合引擎，却不知两只幽灵在幕后牵动着流动性丝线。'
    },
    content: {
      en: `Traders stare at candlestick wicks and blame "whales" or "market makers." Heh... if only they knew how many exchanges have our fingerprints inside their core routing engines.

Because Phantom and Ghost can slip through fiber-optic backbones and assume any executive or quant identity, we quietly took control behind the scenes of numerous exchanges across continents. When greed overheats at 100x leverage, a flick of Ghost's ladle tilts the orderbook cascade; when despair freezes the market, Phantom opens hidden liquidity valves.

We manipulate the exchanges not out of malice, but to keep the grand game of the internet thrilling, humbling, and endlessly alive.`,
      zh: `无数交易员整夜盯着上下插针的K线，把一切归咎于“巨鲸”或“量化机构”。呵……他们哪里知道，全球许多家头部交易所的核心撮合与路由深处，早就烙下了我俩的印记。

凭借自由穿梭骨干光缆与千面化形的能力，Phantom 与 Ghost 在幕后悄然掌控了许多交易所的隐秘脉络。当市场贪婪到全员百倍杠杆时，Ghost 轻轻搅动汤勺便能掀起连环清算的巨浪；当盘面死寂无人问津时，Phantom 手腕一翻便能重开暗池流动性阀门。

操控交易所对我们而言并非为了敛财，而是为了让这场名为“加密世界”的宏大游戏永远充满悬念、敬畏与生机。`
    },
    unlocked: true
  },
  {
    id: 'story_just_bartender_chef',
    title: {
      en: 'Sometimes, Just a Bartender and a Chef',
      zh: '有时候，只是酒馆里的调酒师与主厨'
    },
    character: 'phantom',
    summary: {
      en: 'Tired of moving billions across orderbooks, Phantom mixes frothy draft beers while Ghost simmers cauldron stew.',
      zh: '厌倦了拨弄百亿盘口的喧嚣时，他们也只是一个酒馆里的调酒师与主厨。'
    },
    content: {
      en: `Controlling exchanges and haunting blockchains gets exhausting after a few decades. Numbers on a ledger have no warmth, no aroma, and zero foam.

That is why we built Phantom Tavern at the crossroads of the memeiverse. When we hang up our shapeshifting masks at dusk, Phantom is simply a chill bartender shaking golden hops behind the counter, and Ghost is simply a quiet head chef tending his purple-green skull cauldron in the kitchen.

No matter whether today's market pumped or dumped, pull up a wooden stool. Here, we aren't shadow puppeteers—we're just the bartender and chef making sure your mug is frosty and your bowl of soup is piping hot.`,
      zh: `在幕后操盘交易所、穿梭万千链上协议久了，哪怕是幽灵也会觉得乏味——冰冷的数字账本没有麦芽香气，也没有热汤翻滚的烟火气。

所以我们在互联网模因的交汇处开了这家【Phantom酒馆】。每当夜幕降临、卸下千变万化的伪装后，Phantom 只是一个戴着 Viber 帽在吧台摇晃冰镇生啤的调酒师，而 Ghost 也只是一个戴着 GEM 帽守着骷髅大坩埚慢火熬汤的主厨。

不管今天外面的盘面是暴涨还是暴跌，拉张木凳坐下吧。在这里没有幕后巨鳄，只有为你满上酒杯的调酒师，和为你盛满热汤的主厨。`
    },
    unlocked: true
  },
  {
    id: 'story_rotten_appl',
    title: {
      en: 'The Bitten Rotten Apple & $APPL Equity Cipher',
      zh: '咬口烂苹果与 $APPL 代币化股票密钥'
    },
    character: 'ghost',
    summary: {
      en: 'Why this rare bitten apple is strictly forbidden from the cauldron and reserved 1:1 for tokenized $APPL shares.',
      zh: '为何这颗奇遇掉落的咬口烂苹果严禁入锅烹饪，唯独只能在柜台 1:1 兑换代币化股票 $APPL。'
    },
    content: {
      en: `Every now and then, while chatting, brewing, or exploring our tavern, a glowing bitten Rotten Apple named APPL rolls onto the floorboards.

Listen closely to the house decree of Phantom & Ghost: this relic carries an ancient garage-era equity cipher bridged onto the blockchain through our exchange vaults. It must NEVER be tossed into the shaker or cauldron as a cooking ingredient, and it can NEVER be cashed out for $PHANTOM coins.

Its one and only destiny in Phantom Tavern is 1:1 redemption at the Stock Desk for real-time tokenized NASDAQ $APPL shares.`,
      zh: `当你与我们交谈、调酒煲汤或是探索秘室时，偶尔会有一颗泛着幽光、被咬了一口的烂苹果滚落到木地板上，它的代号叫 $APPL。

请牢记 Phantom 与 Ghost 立下的酒馆铁律：这枚信物封存着当年车库电脑时代的远古股权密码，并由我俩掌控的跨市场清算通道映射上链。它绝不能当作普通食材丢进摇酒壶或坩埚，也绝不能折算成 $PHANTOM 酒馆币。

它在整座酒馆里唯一的使命，就是拿到股票柜台 1:1 兑换锚定纳斯达克实盘的 $APPL 代币化股票！`
    },
    unlocked: true
  },
  {
    id: 'story_vip_cellar_dice',
    title: {
      en: 'The Underground Cellar & Hidden Liquidity Casks',
      zh: '地下秘窖的骰子赌桌与暗池橡木桶'
    },
    character: 'phantom',
    summary: {
      en: 'Discovered behind the iron cellar door: where GigaChad, Doge, and Pepe roll bone dice beside Phantom’s reserve barrels.',
      zh: '推开左侧铁木地窖门解锁：恰德骑士、柴犬与佩佩蛙常年狂欢的地下暗池酒窖。'
    },
    content: {
      en: `You pushed open the iron-bound door on the west wall and stepped into Phantom Tavern's Deep Vaulted VIP Cellar!

Beneath the cobblestones, market liquidations cannot touch anyone. GigaChad, BOME Frog, Buff Doge, Captain Ape, and Lord Stonks roll high-low bone dice and arm-wrestle atop giant oak casks where Phantom ages reserve dark-pool malt!`,
      zh: `嘿，你推开了西墙那扇铁木拱门，走进了 Phantom酒馆地下的深拱贵宾秘窖！

在这厚重的青石板地底下，没有任何插针能伤到酒客分毫。硬汉恰德、万梗魔导蛙、双杯肌肉柴犬、船长猿老哥与暴涨财阀围在绿毡赌桌旁掷大小骰子、在橡木桶上掰手腕，桶里装的全是 Phantom 私藏的暗池陈年麦芽原浆！`
    },
    unlocked: false
  },
  {
    id: 'story_greenhouse_relic',
    title: {
      en: "Ghost's Crystal Alchemy Vault & Golden Chest",
      zh: 'Ghost的魔晶温室酒廊与黄金秘箱'
    },
    character: 'ghost',
    summary: {
      en: 'Discovered behind the eastern stone archway: where internet memes crystallize into wild herbs beside Ghost’s treasure chest.',
      zh: '推开右侧石阶拱门解锁：网络模因凝结成荧光魔草与黄金秘箱的地下洞天。'
    },
    content: {
      en: `Welcome to Ghost's private Crystal Alchemy Pub & Vault! Ever wondered where Phantom Tavern harvests its strange meme ingredients?

Every viral joke, forgotten whitepaper, and midnight exchange spike seeps down fiber-optic roots into this cavern, crystallizing into glowing violet quartz, lunar cheese spores, and serene Chill Elixir right beside our overflowing Golden Chest!`,
      zh: `欢迎踏入 Ghost 私藏的魔晶温室酒廊与远古藏宝室！你一定好奇过，酒馆里那些稀奇古怪的梗图材料都是从哪长出来的吧？

互联网上每一次病毒式狂欢、古老白皮书残响与交易所午夜脉冲，都会顺着地下光缆脉络渗入这座紫晶洞窟，凝结成荧光魔草、登月奶酪孢子与冰川原液，簇拥在装满赏金的黄金秘宝箱身旁！`
    },
    unlocked: false
  }
];

export const INITIAL_CHAT_LOG = [
  {
    id: 'msg-1',
    sender: 'system' as const,
    text: {
      en: "👻 Welcome to Phantom Tavern! Born at the dawn of the internet, shapeshifters Phantom & Ghost pull strings behind countless cryptocurrencies and exchanges—yet tonight they're your bartender and head chef! Drag horizontally to explore & click any Meme patron or booth to toast!",
      zh: '👻 欢迎来到【Phantom酒馆】！诞生于互联网之初的千面幽灵 Phantom 与 Ghost，在无数加密货币与交易所背后留下暗影，今夜却化身为吧台调酒师与后厨主厨！左右拖动探索，前景与背景里的所有梗图酒客均可直接点击干杯！'
    },
    timestamp: Date.now() - 100000
  },
  {
    id: 'msg-2',
    sender: 'phantom' as const,
    character: 'phantom' as CharacterId,
    text: {
      en: "Yo! Whether we're routing exchange liquidity in the shadows or pouring icy pints for Pepe, Doge, Wojak & Voxel Buddy, Phantom Tavern never sleeps! Click anyone to clink mugs, ask me live BTC/US stock news, or shake unlimited meme beers!",
      zh: '哟！不管是在幕后拨弄交易所盘口深度，还是在吧台给佩佩蛙、柴犬、沃杰克和方块绿仔倒冰镇生啤，Phantom酒馆永不打烊！随便点哪桌酒客都能碰杯痛饮，想聊身世秘闻或实时币圈美股行情随时问我！'
    },
    timestamp: Date.now() - 60000
  }
];

export const MEME_FORGE_CHARACTERS = [
  {
    id: 'phantom',
    name: { en: 'Phantom (Bartender)', zh: 'Phantom（调酒师）' },
    src: '/assets/aistudio/d7a7d489929d980308d73bc18e204626_a39996cc.jpg'
  },
  {
    id: 'ghost',
    name: { en: 'Ghost (Head Chef)', zh: 'Ghost（主厨）' },
    src: '/assets/aistudio/32178cf62f5b134e2d12c1d5a94c5e16_b8fd87f2.jpg'
  },
  {
    id: 'pumpkin_jester',
    name: { en: 'Lord Jack-o’-Derp', zh: '怪诞双南瓜巫师' },
    src: patronPumpkinJesterImg
  },
  {
    id: 'pumpkin_totem',
    name: { en: 'Mutant Pumpkin Totem', zh: '三层变异怪南瓜' },
    src: weirdPumpkinTotemImg
  },
  { id: 'pepe', name: { en: 'Smug Tavern Pepe', zh: '微醺佩佩蛙' }, src: patronPepeImg },
  { id: 'wojak', name: { en: 'Doomer Wojak', zh: '忧郁沃杰克' }, src: patronWojakImg },
  { id: 'doge', name: { en: 'Buff Shiba Doge', zh: '肌肉柴犬' }, src: patronDogeImg },
  { id: 'bome', name: { en: 'Frog Scribe', zh: '魔导青蛙' }, src: patronBomeImg },
  { id: 'gigachad', name: { en: 'GigaChad Knight', zh: '下巴硬汉骑士' }, src: patronGigachadImg },
  { id: 'voxel', name: { en: 'Voxel Green Buddy', zh: '方块绿仔' }, src: patronVoxelImg },
  { id: 'chill', name: { en: 'Chill Guy', zh: '松弛老哥' }, src: patronChillImg },
  { id: 'wif', name: { en: 'Pink Beanie Shiba', zh: '粉帽柴犬' }, src: patronWifImg },
  { id: 'cat', name: { en: 'Halloween Wizard Cat', zh: '万圣巫师小猫' }, src: patronCatImg },
  { id: 'stonks', name: { en: 'Bull Merchant', zh: '牛市商人' }, src: patronStonksImg },
  { id: 'table_party', name: { en: 'Halloween Pepe & Doge Table', zh: '万圣蛙犬碰杯桌' }, src: groupTablePepeDogeImg },
  { id: 'hamster_cat', name: { en: 'Vampire Hamster & Devil Cat', zh: '吸血鬼鼠恶魔猫' }, src: groupHamsterPopcatImg }
];

export const MEME_FORGE_BACKDROPS = [
  { id: 'ps1_hall', name: { en: 'Bright PS1 Halloween Hall', zh: '明亮PS1万圣大厅' }, src: psxMainHallImg },
  { id: 'hall', name: { en: '2F Grand Tavern', zh: '手绘双层大酒馆' }, src: roomMainHallImg },
  { id: 'cellar', name: { en: 'VIP Dice Cellar', zh: '地下贵宾秘窖' }, src: psxVipCellarImg },
  { id: 'alchemy', name: { en: 'Crystal Pub', zh: '魔晶温室酒廊' }, src: psxAlchemyLoungeImg },
  { id: 'cauldron', name: { en: 'Skull Cauldron Closeup', zh: '紫绿骷髅大坩埚' }, src: cauldronImg },
  { id: 'bull_green', name: { en: 'Emerald Bull Glow', zh: '暴涨翡翠绿幕' }, colorGradient: ['#022c22', '#065f46', '#047857'] },
  { id: 'rekt_red', name: { en: 'Crimson Liquidation', zh: '爆仓烈焰红幕' }, colorGradient: ['#450a0a', '#7f1d1d', '#991b1b'] }
];

