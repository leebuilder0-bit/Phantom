import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CharacterId,
  Language,
  TavernPatron,
  BackgroundCrowdSpot,
  TavernRoomId,
  TavernDoor,
  Ingredient,
  TavernSceneCommand,
  TavernArtStyle
} from '../types/tavern';
import {
  CHARACTER_DATA,
  TAVERN_ROOMS,
  TAVERN_PATRONS,
  BACKGROUND_CROWD_SPOTS,
  WEIRD_PUMPKIN_TOTEM_SRC
} from '../data/tavernData';
import {
  Beer,
  Flame,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Dices,
  Sparkles,
  Sun
} from 'lucide-react';
import { sound } from '../utils/audio';
import { DynamicCauldron } from './DynamicCauldron';
import { CutoutImage } from '../utils/cutout';
import confetti from 'canvas-confetti';

interface TavernSceneProps {
  language: Language;
  cocoBalance: number;
  currentRoomId: TavernRoomId;
  onRoomChange: (roomId: TavernRoomId) => void;
  brightnessLevel: number;
  onBrightnessChange: (val: number) => void;
  artStyle: TavernArtStyle;
  onToggleArtStyle: () => void;
  sceneCommand: TavernSceneCommand | null;
  onSelectCharacter: (char: CharacterId) => void;
  onOpenBrewing: () => void;
  onOpenKitchen: () => void;
  onFindTavernBonus: (amount: number, reason: string) => void;
  onSpendCoco: (amount: number) => void;
  onGrantRandomIngredient: (sourceReason: string, minRarity?: 'common' | 'rare') => Ingredient;
  onInteractionDropApple: (source: string) => void;
  onUnlockStory: (storyId: string) => void;
}

const PUMPKIN_EASTER_EGG_LINES = {
  zh: [
    '🎃🐸🦇 “呱呜——！！”三层变异怪南瓜同时睁眼喷出万圣糖果雨！顶层女巫南瓜吐出一份秘藏食材塞进你包里！',
    '🎃👻🍬 中间的蝙蝠独眼南瓜咔咔怪笑：“不给麦酒就送礼！接住这把 $PHANTOM 金币和万圣节好料！”',
    '🎃✨ 最底下的佩佩青蛙南瓜打了个响嗝：“嗝～恭喜触发 Phantom酒馆万圣节隐藏彩蛋！祝你熬汤必暴击！”'
  ],
  en: [
    '🎃🐸🦇 "RIBBIT-BOO!!" All three mutant pumpkin heads light up and spit a shower of Halloween loot into your bag!',
    '🎃👻🍬 The bat-winged cyclops pumpkin cackles: "Trick or Jackpot! Catch these $PHANTOM coins and a secret ingredient!"',
    '🎃✨ The frog-carved bottom pumpkin belches purple sparks: "You found Phantom Tavern’s Halloween Easter Egg!"'
  ]
};

const PUMPKIN_TOTEM_SPOTS: Record<TavernRoomId, { x: number; bottom: number }> = {
  main_hall: { x: 430, bottom: 20 },
  vip_cellar: { x: 2170, bottom: 20 },
  alchemy_vault: { x: 1040, bottom: 20 }
};

const RUMOR_NOTES = {
  zh: [
    '📌 壁炉幽灵便签 #1：传说吧台调酒师 Phantom 与后厨主厨 Ghost 诞生于互联网之初，能变换成任何模样，无数加密货币与大型交易所背后都有他俩操盘的影子！',
    '📌 壁炉幽灵便签 #2：抬头看看二楼木栏杆和两侧大卡座！背景里喝酒的柴犬、佩佩和沃杰克全都能直接点击碰杯，二楼酒友还会往下抛免费食材！',
    '📌 壁炉幽灵便签 #3：推开最西边的铁木拱门是【深拱地下秘窖】，推开最东边的石门是【魔晶温室酒廊】，可掷骰子、开黄金秘箱、采野生魔草！',
    '📌 壁炉幽灵便签 #4：Phantom酒馆铁律——奇遇掉落的咬口烂苹果绝不可入锅，唯一用途是在股票柜台 1:1 兑换 $APPL 代币化股票！'
  ],
  en: [
    '📌 Spectral Note #1: Rumor says bartender Phantom & head chef Ghost were born at the dawn of the internet, shapeshift at will, and secretly control major crypto exchanges!',
    '📌 Spectral Note #2: Look up at the 2nd-floor mezzanine balconies and deep booths! Every background Meme group can be clicked directly to clink mugs & catch free loot!',
    '📌 Spectral Note #3: Push open the west iron door for the VIP Dice Cellar, or the east stone door for the Crystal Alchemy Pub & Golden Chest!',
    '📌 Spectral Note #4: Phantom Tavern Decree—Rotten Apples are never cooked; their sole destiny is 1:1 redemption for $APPL Tokenized Stock!'
  ]
};

export const TavernScene: React.FC<TavernSceneProps> = ({
  language,
  cocoBalance,
  currentRoomId,
  onRoomChange,
  brightnessLevel,
  onBrightnessChange,
  artStyle,
  onToggleArtStyle,
  sceneCommand,
  onSelectCharacter,
  onOpenBrewing,
  onOpenKitchen,
  onFindTavernBonus,
  onSpendCoco,
  onGrantRandomIngredient,
  onInteractionDropApple,
  onUnlockStory
}) => {
  const isPs1 = artStyle === 'ps1';
  const [scrollX, setScrollX] = useState<number>(360);
  const [viewportWidth, setViewportWidth] = useState<number>(1150);
  const [isRoomTransitioning, setIsRoomTransitioning] = useState(false);
  const didInitCameraRef = useRef(false);

  // Drag-to-Pan Refs (Mouse + Mobile Touch with Directional Lock)
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrubberDraggingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const touchDirectionLockedRef = useRef<'x' | 'y' | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);

  // Direct Character Click Popovers & Patron/Background Crowd States
  const [activeInteractiveCharacter, setActiveInteractiveCharacter] = useState<CharacterId | null>(null);
  const [activePatronId, setActivePatronId] = useState<string | null>(null);
  const [patronToastBubble, setPatronToastBubble] = useState<Record<string, string>>({});
  const [drinkingPatronIds, setDrinkingPatronIds] = useState<Record<string, boolean>>({});
  const [pumpkinEggBubble, setPumpkinEggBubble] = useState<string | null>(null);
  const [pumpkinEggBounce, setPumpkinEggBounce] = useState(false);
  const [patronMugsCount, setPatronMugsCount] = useState<Record<string, number>>({
    pepe_doge_table: 9,
    voxel_buddy: 4,
    apu_wojak_booth: 7,
    pumpkin_jester: 8,
    pepe_bard: 5,
    hamster_popcat_table: 6,
    wojak_doomer: 3,
    gigachad_knight: 8,
    doge_frog_armwrestle: 10,
    bome_mage: 5,
    ape_frog_duo: 6,
    buff_doge: 7,
    stonks_merchant: 4,
    wif_shiba: 3,
    chill_guy: 2,
    vibing_cat: 4,
    bg_west_balcony_trio: 8,
    bg_west_booth_gang: 12,
    bg_mid_balcony_shibas: 6,
    bg_hearth_fireplace_banquet: 15,
    bg_east_booth_wojak_pepe: 11,
    bg_east_balcony_pepes: 7,
    bg_cellar_pepe_knights: 9,
    bg_cellar_arch_shiba_table: 10,
    bg_cellar_cask_cats: 8,
    bg_alchemy_wizard_trio_table: 7,
    bg_alchemy_deep_garden_tables: 6,
    bg_alchemy_right_bar: 9
  });

  // Room Exploration Interactive States
  const [rumorIndex, setRumorIndex] = useState(0);
  const [rumorBubble, setRumorBubble] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [nowTick, setNowTick] = useState(Date.now());

  // Cellar Dice Mini-Game Modal State
  const [isDiceOpen, setIsDiceOpen] = useState(false);
  const [diceBet, setDiceBet] = useState<50 | 150>(50);
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<[number, number]>([4, 5]);
  const [diceResultMsg, setDiceResultMsg] = useState<string | null>(null);

  const isMobile = viewportWidth < 640;
  const mobileScale = isMobile ? 0.76 : 1;

  const currentRoom = TAVERN_ROOMS[currentRoomId];
  const roomPatrons = TAVERN_PATRONS.filter((p) => p.roomId === currentRoomId);
  const roomBgCrowds = BACKGROUND_CROWD_SPOTS.filter((s) => s.roomId === currentRoomId);
  const pumpkinSpot = PUMPKIN_TOTEM_SPOTS[currentRoomId];

  const maxScroll = Math.max(0, currentRoom.worldWidth - viewportWidth);
  const scrollRatio = maxScroll > 0 ? Math.max(0, Math.min(1, scrollX / maxScroll)) : 0;

  // Multi-Plane 2.5D Parallax Layer Widths & Offsets
  const bgLayerWidth = Math.max(viewportWidth, currentRoom.bgWorldWidth);
  const midLayerWidth = Math.max(viewportWidth, currentRoom.midWorldWidth);
  const fgCeilingWidth = Math.max(viewportWidth + 320, Math.round(currentRoom.worldWidth * 1.12));

  const bgOffset = scrollRatio * Math.max(0, bgLayerWidth - viewportWidth);
  const atmOffset = scrollRatio * Math.max(0, midLayerWidth - viewportWidth) * 0.9;
  const fgCeilingOffset = scrollRatio * Math.max(0, fgCeilingWidth - viewportWidth);

  const clampScroll = useCallback(
    (val: number, worldW = currentRoom.worldWidth, viewW = viewportWidth) => {
      return Math.max(0, Math.min(Math.max(0, worldW - viewW), val));
    },
    [currentRoom.worldWidth, viewportWidth]
  );

  // Measure viewport width responsively & center initial camera on Phantom + Witch-Pepe Table
  useEffect(() => {
    const updateSize = () => {
      if (viewportRef.current) {
        const w = viewportRef.current.clientWidth;
        setViewportWidth(w);
        if (!didInitCameraRef.current) {
          didInitCameraRef.current = true;
          const initialFocus = w < 768 ? Math.max(0, 760 - w / 2) : 360;
          setScrollX(Math.max(0, Math.min(Math.max(0, currentRoom.worldWidth - w), initialFocus)));
        } else {
          setScrollX((prev) => Math.max(0, Math.min(Math.max(0, currentRoom.worldWidth - w), prev)));
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [currentRoom.worldWidth]);

  // Cooldown ticker
  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Clear cached transient speech bubbles immediately whenever language switches
  useEffect(() => {
    setPatronToastBubble({});
    setRumorBubble(null);
    setPumpkinEggBubble(null);
    setDiceResultMsg(null);
  }, [language]);

  // Keyboard Left/Right exploration support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        setScrollX((prev) => clampScroll(prev - 260));
      } else if (e.key === 'ArrowRight') {
        setScrollX((prev) => clampScroll(prev + 260));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clampScroll]);

  const panSmoothTo = useCallback(
    (targetCenterX: number) => {
      setScrollX(clampScroll(targetCenterX - viewportWidth / 2));
    },
    [clampScroll, viewportWidth]
  );

  const handleQuickSwitchRoom = useCallback(
    (roomId: TavernRoomId, focusChar?: CharacterId) => {
      if (roomId === currentRoomId) {
        if (focusChar === 'phantom') panSmoothTo(760);
        if (focusChar === 'ghost') panSmoothTo(2280);
        return;
      }
      sound.playDoorOpen();
      setIsRoomTransitioning(true);
      setActiveInteractiveCharacter(null);
      setActivePatronId(null);
      setPumpkinEggBubble(null);
      setIsDiceOpen(false);

      if (roomId === 'vip_cellar') onUnlockStory('story_vip_cellar_dice');
      if (roomId === 'alchemy_vault') onUnlockStory('story_greenhouse_relic');

      window.setTimeout(() => {
        const nextRoom = TAVERN_ROOMS[roomId];
        onRoomChange(roomId);
        const targetX =
          focusChar === 'phantom'
            ? 760 - viewportWidth / 2
            : focusChar === 'ghost'
              ? 2280 - viewportWidth / 2
              : nextRoom.defaultScrollX;
        setScrollX(clampScroll(targetX, nextRoom.worldWidth, viewportWidth));
        setIsRoomTransitioning(false);
      }, 200);
    },
    [clampScroll, currentRoomId, onRoomChange, onUnlockStory, panSmoothTo, viewportWidth]
  );

  // Toast EVERY Foreground, Midground, AND Background Meme Crowd in the current room!
  const handleToastRoomPatrons = useCallback(() => {
    sound.playMugClink();
    window.setTimeout(() => sound.playCrowdCheer(), 100);
    window.setTimeout(() => sound.playPour(), 240);
    window.setTimeout(() => sound.playHeartyGulp(), 400);

    setPatronToastBubble((prev) => {
      const nextBubbles = { ...prev };
      roomPatrons.forEach((p) => {
        const lines = p.toasts[language];
        nextBubbles[p.id] = lines[Math.floor(Math.random() * lines.length)];
      });
      roomBgCrowds.forEach((s) => {
        const lines = s.toasts[language];
        nextBubbles[s.id] = lines[Math.floor(Math.random() * lines.length)];
      });
      return nextBubbles;
    });

    const nextDrinking: Record<string, boolean> = {};
    roomPatrons.forEach((p) => {
      nextDrinking[p.id] = true;
    });
    roomBgCrowds.forEach((s) => {
      nextDrinking[s.id] = true;
    });
    setDrinkingPatronIds(nextDrinking);

    setPatronMugsCount((prev) => {
      const nextCounts = { ...prev };
      roomPatrons.forEach((p) => {
        nextCounts[p.id] = (nextCounts[p.id] || 1) + 1;
      });
      roomBgCrowds.forEach((s) => {
        nextCounts[s.id] = (nextCounts[s.id] || 5) + 3;
      });
      return nextCounts;
    });

    const bonus = 65;
    onFindTavernBonus(
      bonus,
      language === 'zh'
        ? `🍻 全场一楼二楼所有梗图酒桌齐声震天干杯！获赠 +${bonus} $PHANTOM！`
        : `🍻 Every foreground table & upstairs balcony roared in unison! +${bonus} $PHANTOM!`
    );

    window.setTimeout(() => {
      setDrinkingPatronIds({});
    }, 1450);
  }, [language, onFindTavernBonus, roomBgCrowds, roomPatrons]);

  // Execute commands dispatched from the top Header Settings menu
  const lastCommandNonceRef = useRef<number>(0);
  useEffect(() => {
    if (!sceneCommand || sceneCommand.nonce === lastCommandNonceRef.current) return;
    lastCommandNonceRef.current = sceneCommand.nonce;

    if (sceneCommand.type === 'switch_room' && sceneCommand.roomId) {
      handleQuickSwitchRoom(sceneCommand.roomId);
    } else if (sceneCommand.type === 'focus_char' && sceneCommand.char) {
      handleQuickSwitchRoom('main_hall', sceneCommand.char);
      onSelectCharacter(sceneCommand.char);
    } else if (sceneCommand.type === 'toast_hall') {
      handleToastRoomPatrons();
    }
  }, [sceneCommand, handleQuickSwitchRoom, handleToastRoomPatrons, onSelectCharacter]);

  // Pointer & Mobile Touch Drag Handlers with Directional Axis Lock
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    touchDirectionLockedRef.current = null;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartScrollRef.current = scrollX;
    setIsGrabbing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const rawDx = e.clientX - dragStartXRef.current;
    const rawDy = e.clientY - dragStartYRef.current;

    if (e.pointerType === 'touch' && !touchDirectionLockedRef.current) {
      if (Math.abs(rawDx) > 7 || Math.abs(rawDy) > 7) {
        touchDirectionLockedRef.current = Math.abs(rawDx) >= Math.abs(rawDy) ? 'x' : 'y';
      }
    }

    if (e.pointerType === 'touch' && touchDirectionLockedRef.current === 'y') {
      return;
    }

    if (Math.abs(rawDx) > 6) {
      hasDraggedRef.current = true;
    }
    const speed = e.pointerType === 'touch' ? 1.55 : 1.05;
    setScrollX(clampScroll(dragStartScrollRef.current - rawDx * speed));
  };

  const handlePointerUpOrCancel = () => {
    isDraggingRef.current = false;
    touchDirectionLockedRef.current = null;
    setIsGrabbing(false);
    window.setTimeout(() => {
      hasDraggedRef.current = false;
    }, 45);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      const delta = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;
      setScrollX((prev) => clampScroll(prev + delta));
    }
  };

  const getRemainingSeconds = (key: string) => {
    const until = cooldowns[key] || 0;
    return Math.max(0, Math.ceil((until - nowTick) / 1000));
  };

  const triggerCooldown = (key: string, seconds: number) => {
    setCooldowns((prev) => ({ ...prev, [key]: Date.now() + seconds * 1000 }));
  };

  // Enter another room through an interactive Door
  const handleEnterDoor = (door: TavernDoor) => {
    if (hasDraggedRef.current || isRoomTransitioning) return;
    sound.playDoorOpen();
    setIsRoomTransitioning(true);
    setActiveInteractiveCharacter(null);
    setActivePatronId(null);
    setPumpkinEggBubble(null);
    setIsDiceOpen(false);

    if (door.targetRoomId === 'vip_cellar') {
      onUnlockStory('story_vip_cellar_dice');
    } else if (door.targetRoomId === 'alchemy_vault') {
      onUnlockStory('story_greenhouse_relic');
    }

    window.setTimeout(() => {
      const nextRoom = TAVERN_ROOMS[door.targetRoomId];
      onRoomChange(door.targetRoomId);
      setScrollX(clampScroll(door.targetSpawnX, nextRoom.worldWidth, viewportWidth));
      setIsRoomTransitioning(false);
    }, 220);
  };

  // Direct Click on Phantom or Ghost (Auto-centers on mobile so popover never clips!)
  const handleCharacterClick = (char: CharacterId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;
    sound.playCoin();
    setActivePatronId(null);
    setPumpkinEggBubble(null);
    const nextChar = activeInteractiveCharacter === char ? null : char;
    setActiveInteractiveCharacter(nextChar);
    onSelectCharacter(char);
    if (nextChar && isMobile) {
      panSmoothTo(char === 'phantom' ? 760 : 2280);
    }
  };

  const scrollToChatSection = () => {
    const el = document.getElementById('tavern-dialogue-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Interactive Halloween Weird Mutant Pumpkin Totem Easter Egg!
  const handleTriggerPumpkinEasterEgg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;

    sound.playHalloweenChime();
    window.setTimeout(() => sound.playCrowdCheer(), 120);

    setActiveInteractiveCharacter(null);
    setActivePatronId(null);
    setPumpkinEggBounce(true);
    window.setTimeout(() => setPumpkinEggBounce(false), 950);

    const lines = PUMPKIN_EASTER_EGG_LINES[language];
    setPumpkinEggBubble(lines[Math.floor(Math.random() * lines.length)]);

    confetti({
      particleCount: 42,
      spread: 68,
      origin: { y: 0.55 },
      colors: ['#f97316', '#a855f7', '#84cc16', '#facc15']
    });

    const cdKey = `pumpkin_egg_${currentRoomId}`;
    const rem = getRemainingSeconds(cdKey);
    if (rem === 0) {
      triggerCooldown(cdKey, 12);
      const ing = onGrantRandomIngredient(
        language === 'zh' ? '万圣怪南瓜图腾隐藏彩蛋' : 'Halloween Mutant Pumpkin Easter Egg'
      );
      const bonus = 45;
      onFindTavernBonus(
        bonus,
        language === 'zh'
          ? `🎃 触发万圣怪南瓜彩蛋！获得 +${bonus} $PHANTOM 与【${ing.name.zh}】！`
          : `🎃 Halloween Pumpkin Easter Egg! +${bonus} $PHANTOM & ${ing.name.en} x1!`
      );
      if (Math.random() < 0.12) {
        onInteractionDropApple(
          language === 'zh' ? '敲击万圣三层怪南瓜彩蛋时惊喜吐出' : 'Popped out of the Weird Mutant Pumpkin Totem'
        );
      }
    } else {
      onFindTavernBonus(
        10,
        language === 'zh'
          ? `🎃 怪南瓜咔咔傻笑喷出糖果金币 +10 $PHANTOM！（大礼冷却 ${rem}秒）`
          : `🎃 Mutant pumpkins cackle & toss +10 $PHANTOM! (Loot cooldown ${rem}s)`
      );
    }
  };

  // Direct Click on Foreground or Midground Meme Patron / Group Table
  const handleToastPatron = (patron: TavernPatron, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;
    sound.playMugClink();
    window.setTimeout(() => sound.playHeartyGulp(), 140);

    const lines = patron.toasts[language];
    const chosenLine = lines[Math.floor(Math.random() * lines.length)];

    setActiveInteractiveCharacter(null);
    setActivePatronId(patron.id);
    setPatronToastBubble((prev) => ({ ...prev, [patron.id]: chosenLine }));
    setDrinkingPatronIds((prev) => ({ ...prev, [patron.id]: true }));
    setPatronMugsCount((prev) => ({ ...prev, [patron.id]: (prev[patron.id] || 1) + 1 }));

    const tip = Math.floor(Math.random() * 26) + 20;
    onFindTavernBonus(
      tip,
      language === 'zh'
        ? `🍻 你与【${patron.name.zh}】碰杯痛饮！获赠酒友小费 +${tip} $PHANTOM！`
        : `🍻 Clinked frothy mugs with ${patron.name.en}! +${tip} $PHANTOM tip!`
    );

    if (Math.random() < 0.07) {
      onInteractionDropApple(
        language === 'zh'
          ? `与${patron.name.zh}碰杯畅饮时奇遇掉落`
          : `Found clinking mugs with ${patron.name.en}`
      );
    }

    window.setTimeout(() => {
      setDrinkingPatronIds((prev) => ({ ...prev, [patron.id]: false }));
    }, 1150);
  };

  // Direct Click on ANY Painted Background Meme Crowd (2nd-Floor Balconies, Deep Booths, Hearth, Bar!)
  const handleToastBackgroundCrowd = (spot: BackgroundCrowdSpot, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;

    sound.playMugClink();
    window.setTimeout(() => sound.playCrowdCheer(), 110);
    window.setTimeout(() => sound.playHeartyGulp(), 260);

    const lines = spot.toasts[language];
    const chosenLine = lines[Math.floor(Math.random() * lines.length)];

    setActiveInteractiveCharacter(null);
    setActivePatronId(spot.id);
    setPatronToastBubble((prev) => ({ ...prev, [spot.id]: chosenLine }));
    setDrinkingPatronIds((prev) => ({ ...prev, [spot.id]: true }));
    setPatronMugsCount((prev) => ({ ...prev, [spot.id]: (prev[spot.id] || 4) + 3 }));

    const tip = Math.floor(Math.random() * 30) + 25;
    let extraLootText = '';
    if (spot.grantsFreeIngredient && getRemainingSeconds(`bg_loot_${spot.id}`) === 0) {
      triggerCooldown(`bg_loot_${spot.id}`, 14);
      const freeIng = onGrantRandomIngredient(spot.name[language]);
      extraLootText =
        language === 'zh'
          ? ` 并抛给你一份【${freeIng.name.zh}】！`
          : ` + tossed you ${freeIng.name.en} x1!`;
    }

    onFindTavernBonus(
      tip,
      language === 'zh'
        ? `🍻 背景【${spot.name.zh}】全桌起哄干杯！+${tip} $PHANTOM！${extraLootText}`
        : `🍻 Background ${spot.name.en} roared & clinked mugs! +${tip} $PHANTOM!${extraLootText}`
    );

    if (Math.random() < 0.08) {
      onInteractionDropApple(
        language === 'zh'
          ? `与背景【${spot.name.zh}】隔空敬酒时接住`
          : `Caught toasting ${spot.name.en}`
      );
    }

    window.setTimeout(() => {
      setDrinkingPatronIds((prev) => ({ ...prev, [spot.id]: false }));
    }, 1350);
  };

  // Room 1 Prop: Rumor Board by Fireplace
  const handleInspectRumorBoard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;
    sound.playHalloweenChime();
    const notes = RUMOR_NOTES[language];
    const nextIdx = (rumorIndex + 1) % notes.length;
    setRumorIndex(nextIdx);
    setRumorBubble(notes[rumorIndex]);

    if (getRemainingSeconds('rumor_board') === 0) {
      triggerCooldown('rumor_board', 15);
      onFindTavernBonus(
        20,
        language === 'zh'
          ? '📜 翻阅壁炉传闻告示板，夹缝里掉出 +20 $PHANTOM！'
          : '📜 Read the Hearth Rumor Board and found +20 $PHANTOM!'
      );
    }
  };

  // Room 2 Prop: Search Vintage Oak Barrels
  const handleSearchCellarBarrels = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;
    const rem = getRemainingSeconds('cellar_barrels');
    if (rem > 0) return;

    sound.playPour();
    triggerCooldown('cellar_barrels', 12);
    const ing = onGrantRandomIngredient(
      language === 'zh' ? '搜寻地下秘窖百年酒桶' : 'Searched Vintage Cellar Casks'
    );
    const coins = Math.floor(Math.random() * 35) + 25;
    onFindTavernBonus(
      coins,
      language === 'zh'
        ? `🛢️ 拧开百年秘酿酒桶暗格！拾得【${ing.name.zh}】与 +${coins} $PHANTOM！`
        : `🛢️ Searched the Vintage Oak Casks! Found ${ing.name.en} x1 & +${coins} $PHANTOM!`
    );

    if (Math.random() < 0.09) {
      onInteractionDropApple(
        language === 'zh' ? '在地下秘窖百年橡木桶底摸到' : 'Found beneath a Vintage Cellar Cask'
      );
    }
  };

  // Room 2 Mini-Game: High-Low Meme Dice Roll
  const handlePlayDice = (choice: 'small' | 'seven' | 'big') => {
    if (diceRolling || cocoBalance < diceBet) return;
    onSpendCoco(diceBet);
    sound.playDiceRoll();
    setDiceRolling(true);
    setDiceResultMsg(null);

    window.setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2;
      setDiceValues([d1, d2]);
      setDiceRolling(false);

      const won =
        (choice === 'small' && sum >= 2 && sum <= 6) ||
        (choice === 'seven' && sum === 7) ||
        (choice === 'big' && sum >= 8 && sum <= 12);

      if (won) {
        const mult = choice === 'seven' ? 4 : 2;
        const payout = diceBet * mult;
        sound.playTreasureOpen();
        sound.playCrowdCheer();
        const gotBonusIng = Math.random() < 0.45;
        let extraText = '';
        if (gotBonusIng) {
          const ing = onGrantRandomIngredient(
            language === 'zh' ? '地下秘窖骰子赌局连胜彩头' : 'VIP Cellar Dice Bonus'
          );
          extraText = language === 'zh' ? ` 外加彩头【${ing.name.zh}】！` : ` + Bonus ${ing.name.en}!`;
        }
        onFindTavernBonus(
          payout,
          language === 'zh'
            ? `🎲 骰子开出 ${d1}+${d2}=${sum} 点！全场欢呼 +${payout} $PHANTOM！${extraText}`
            : `🎲 Rolled ${d1}+${d2}=${sum}! Won +${payout} $PHANTOM!${extraText}`
        );
        setDiceResultMsg(
          language === 'zh'
            ? `🎉 命中 ${sum} 点！赢得 ${payout} $PHANTOM！${extraText}`
            : `🎉 Hit ${sum}! Won ${payout} $PHANTOM!${extraText}`
        );
      } else {
        setDiceResultMsg(
          language === 'zh'
            ? `🎲 开出 ${d1}+${d2}=${sum} 点，差一点点！喝口麦酒再来一把！`
            : `🎲 Rolled ${d1}+${d2}=${sum}—missed! Take a sip and roll again!`
        );
      }
    }, 420);
  };

  // Room 3 Props
  const handleUseDistiller = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current || getRemainingSeconds('distiller') > 0) return;
    sound.playCauldronBoil();
    triggerCooldown('distiller', 10);
    const ing = onGrantRandomIngredient(
      language === 'zh' ? '幽灵蒸馏实验台提纯' : 'Distilled at Alchemy Bench'
    );
    onFindTavernBonus(
      15,
      language === 'zh'
        ? `🧪 炼金蒸馏器凝结出免费食材【${ing.name.zh}】（已存入背包）！`
        : `🧪 Distilled free ingredient: ${ing.name.en} x1 (added to bag)!`
    );
  };

  const handleOpenGoldenChest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current || getRemainingSeconds('golden_chest') > 0) return;
    sound.playTreasureOpen();
    triggerCooldown('golden_chest', 16);
    const ing = onGrantRandomIngredient(
      language === 'zh' ? '开启远古黄金秘宝箱' : 'Opened Ancient Golden Chest',
      'rare'
    );
    const gold = Math.floor(Math.random() * 75) + 65;
    onFindTavernBonus(
      gold,
      language === 'zh'
        ? `🎁 开启远古黄金秘宝箱！获得 +${gold} $PHANTOM 与珍稀食材【${ing.name.zh}】！`
        : `🎁 Opened Ancient Golden Chest! Looted +${gold} $PHANTOM & ${ing.name.en} x1!`
    );

    if (Math.random() < 0.14) {
      onInteractionDropApple(
        language === 'zh' ? '开启温室远古黄金宝箱时惊喜发现' : 'Discovered inside the Ancient Golden Chest'
      );
    }
  };

  const handleForageCrystalHerbs = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current || getRemainingSeconds('crystal_herbs') > 0) return;
    sound.playHalloweenChime();
    triggerCooldown('crystal_herbs', 10);
    const ing = onGrantRandomIngredient(
      language === 'zh' ? '采集荧光魔菇紫水晶丛' : 'Foraged Glowing Crystal Mushrooms'
    );
    onFindTavernBonus(
      20,
      language === 'zh'
        ? `🍄 采集野生魔草成功！获得【${ing.name.zh}】与 +20 $PHANTOM！`
        : `🍄 Foraged wild meme herb: ${ing.name.en} x1 & +20 $PHANTOM!`
    );
  };

  // Render Grounded Floor Meme Patron or Multi-Meme Oak Drinking Table
  const renderPatronSprite = (patron: TavernPatron) => {
    const isDrinking = Boolean(drinkingPatronIds[patron.id]);
    const bubbleText = patronToastBubble[patron.id];
    const mugs = patronMugsCount[patron.id] || 1;
    const isSelected = activePatronId === patron.id;
    const isGroupTable =
      patron.id.includes('table') ||
      patron.id.includes('booth') ||
      patron.id.includes('armwrestle') ||
      patron.id.includes('duo');
    const scaledHeight = Math.round(patron.heightPx * mobileScale);
    const scaledBottom = Math.round(patron.bottom * mobileScale);

    return (
      <div
        key={patron.id}
        style={{ left: `${patron.x}px`, bottom: `${scaledBottom}px` }}
        onClick={(e) => handleToastPatron(patron, e)}
        className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer group z-20"
        title={
          language === 'zh'
            ? `点击直接与【${patron.name.zh}】碰杯喝酒！`
            : `Click ${patron.name.en} directly to clink mugs!`
        }
      >
        {(isSelected || isDrinking) && bubbleText && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-40 w-[min(256px,82vw)] sm:w-68 bg-stone-950/95 border border-amber-400 rounded-2xl p-2.5 text-xs text-amber-100 leading-relaxed shadow-2xl pointer-events-none">
            <p>{bubbleText}</p>
          </div>
        )}

        {isDrinking && (
          <div className="absolute -top-7 z-30 text-sm sm:text-base font-bold text-amber-300 animate-bounce pointer-events-none whitespace-nowrap">
            {language === 'zh' ? '🍻 吨吨吨 +1 🍺!' : '🍻 Cheers +1 🍺!'}
          </div>
        )}

        {/* Grounded Floor Contact Shadow Directly Beneath Table Legs, Stools & Boots */}
        <div
          className={`absolute bottom-5 rounded-full bg-black/75 blur-md pointer-events-none ${
            isGroupTable ? 'w-44 sm:w-64 h-5 sm:h-7' : 'w-28 sm:w-36 h-5 sm:h-6'
          }`}
        />

        <div
          style={{ height: `${scaledHeight}px` }}
          className={`relative flex items-end justify-center transition-transform duration-200 ${
            isDrinking
              ? '-rotate-2 scale-105'
              : 'group-hover:scale-105 group-hover:-translate-y-0.5'
          }`}
        >
          <CutoutImage
            src={patron.sprite}
            fallbackSrc={patron.fallbackAvatar}
            alt={patron.name[language]}
            ps1Retro={isPs1}
            ps1MaxDim={isGroupTable ? 196 : 164}
            className={`max-h-full w-auto object-contain select-none pointer-events-none ${
              isPs1
                ? 'drop-shadow-[0_12px_16px_rgba(0,0,0,0.88)]'
                : 'drop-shadow-[0_12px_20px_rgba(0,0,0,0.86)]'
            } ${patron.flipX ? '-scale-x-100' : ''}`}
          />
        </div>

        <div
          className={`mt-1 px-2 sm:px-2.5 py-0.5 bg-stone-950/90 group-hover:bg-stone-900 border text-center transition-colors shadow-md ${
            isPs1
              ? 'rounded-sm border-stone-600/90 group-hover:border-amber-400 font-mono'
              : 'rounded-md border-stone-700/80 group-hover:border-amber-400/90'
          }`}
        >
          <span className="text-[11px] sm:text-xs font-bold text-amber-200 whitespace-nowrap">
            {patron.name[language]}
          </span>
          <span className="ml-1 text-[10px] sm:text-[11px] font-mono text-amber-400 tabular-nums">
            · 🍺{mugs}
          </span>
        </div>
      </div>
    );
  };

  const activeBackdropSrc =
    isPs1 && currentRoom.ps1Backdrop ? currentRoom.ps1Backdrop : currentRoom.backdrop;

  return (
    <div
      className={`relative w-full overflow-hidden border shadow-2xl bg-stone-950 select-none flex flex-col ${
        isPs1
          ? 'rounded-lg sm:rounded-xl border-stone-700/80'
          : 'rounded-2xl sm:rounded-3xl border-amber-900/50'
      }`}
    >
      {/* =========================================================================
          MULTI-LAYER 2.5D PARALLAX EXPLORATION VIEWPORT (Zero top button clutter!)
         ========================================================================= */}
      <div
        ref={viewportRef}
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        onPointerLeave={handlePointerUpOrCancel}
        onWheel={handleWheel}
        onClick={() => {
          if (!hasDraggedRef.current) {
            setActiveInteractiveCharacter(null);
            setActivePatronId(null);
            setRumorBubble(null);
            setPumpkinEggBubble(null);
          }
        }}
        className={`relative w-full h-[475px] sm:h-[635px] overflow-hidden bg-stone-950 ${
          isGrabbing ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Smooth Doorway Transition Curtain */}
        <div
          className={`absolute inset-0 z-50 bg-stone-950 pointer-events-none transition-opacity duration-200 ${
            isRoomTransitioning ? 'opacity-90' : 'opacity-0'
          }`}
        />

        {/* Compact Top-Left Room Badge + 1-Click PS1/Original Toggle + Quick Brightness Boost */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center gap-1.5 pointer-events-none">
          <div
            className={`px-2 sm:px-2.5 py-1 bg-stone-950/80 backdrop-blur-sm border text-[11px] sm:text-xs font-semibold text-amber-200/95 truncate max-w-[46vw] sm:max-w-none ${
              isPs1 ? 'rounded-sm border-stone-600/80 font-mono' : 'rounded-lg border-amber-900/40'
            }`}
          >
            🎃 {currentRoom.name[language]}
          </div>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              sound.playCoin();
              onToggleArtStyle();
            }}
            title={
              language === 'zh'
                ? '点击一键切换：PS1复古低模画风 ⇄ 经典原版画风'
                : 'Click to switch between PS1 Retro 3D and Original Art Style'
            }
            className={`pointer-events-auto px-2 sm:px-2.5 py-1 text-[11px] font-bold border transition-colors whitespace-nowrap shadow-lg shrink-0 ${
              isPs1
                ? 'rounded-sm bg-stone-900/90 hover:bg-amber-600 text-amber-300 hover:text-stone-950 border-amber-500/70 font-mono'
                : 'rounded-lg bg-stone-950/85 hover:bg-stone-800 text-stone-200 hover:text-amber-200 border-stone-700'
            }`}
          >
            {isPs1
              ? language === 'zh'
                ? isMobile
                  ? 'PS1 ⇄ 原版'
                  : '画风: PS1低模 (点此退回原版)'
                : isMobile
                  ? 'PS1 ⇄ Classic'
                  : 'Style: PS1 3D (Revert)'
              : language === 'zh'
                ? isMobile
                  ? '原版 ⇄ PS1'
                  : '画风: 经典原版 (切到PS1)'
                : isMobile
                  ? 'Classic ⇄ PS1'
                  : 'Style: Original (Try PS1)'}
          </button>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              sound.playCoin();
              const steps = [125, 145, 170, 195];
              const next = steps.find((s) => s > brightnessLevel + 4) ?? 125;
              onBrightnessChange(next);
            }}
            title={
              language === 'zh'
                ? `点击循环提亮场景（当前 ${brightnessLevel}%）`
                : `Tap to boost tavern brightness (${brightnessLevel}%)`
            }
            className="pointer-events-auto px-2 py-1 rounded-lg bg-amber-950/85 hover:bg-amber-600 text-amber-200 hover:text-stone-950 border border-amber-500/60 text-[11px] font-mono font-bold flex items-center gap-1 shadow-lg shrink-0 transition-colors"
          >
            <Sun className="w-3 h-3 shrink-0" />
            <span>{brightnessLevel}%</span>
          </button>
        </div>

        {/* Floating Left & Right Pan Buttons */}
        {scrollX > 20 && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setScrollX((prev) => clampScroll(prev - (isMobile ? 290 : 460)));
            }}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-950/80 hover:bg-amber-600 text-amber-200 hover:text-stone-950 border border-amber-500/60 shadow-2xl flex items-center justify-center transition-colors"
            title={language === 'zh' ? '向左探索' : 'Pan Left'}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {scrollX < maxScroll - 20 && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setScrollX((prev) => clampScroll(prev + (isMobile ? 290 : 460)));
            }}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-stone-950/80 hover:bg-amber-600 text-amber-200 hover:text-stone-950 border border-amber-500/60 shadow-2xl flex items-center justify-center transition-colors"
            title={language === 'zh' ? '向右探索' : 'Pan Right'}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* =====================================================================
            PLANE 1 (DEEP BACKGROUND, ~0.72x PARALLAX):
            Brightly Lit PS1 3D / Hand-Painted Room Art + 12 Clickable Background Meme Crowds!
           ===================================================================== */}
        <div
          className={`absolute top-0 bottom-0 left-0 z-0 will-change-transform ${
            isGrabbing ? '' : 'transition-transform duration-150 ease-out'
          }`}
          style={{
            width: `${bgLayerWidth}px`,
            transform: `translate3d(${-bgOffset}px, 0, 0)`
          }}
        >
          <img
            src={activeBackdropSrc}
            alt={currentRoom.name[language]}
            referrerPolicy="no-referrer"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
            style={{
              imageRendering: isPs1 ? 'pixelated' : undefined,
              filter: isPs1
                ? `brightness(${Math.round(brightnessLevel * 1.24)}%) contrast(105%) saturate(112%)`
                : `brightness(${Math.round(brightnessLevel * 1.06)}%) contrast(105%) saturate(114%)`
            }}
          />

          {/* Warm Torchlight Glaze (Zero heavy black shadow crush!) */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              isPs1
                ? 'bg-gradient-to-t from-stone-950/30 via-amber-500/5 to-transparent'
                : 'bg-gradient-to-t from-stone-950/40 via-transparent to-stone-950/15'
            }`}
          />

          {/* CLICKABLE BACKGROUND MEME CROWD SPOTS */}
          {roomBgCrowds.map((spot) => {
            const isDrinking = Boolean(drinkingPatronIds[spot.id]);
            const bubbleText = patronToastBubble[spot.id];
            const isSelected = activePatronId === spot.id;
            const mugs = patronMugsCount[spot.id] || 6;
            const isHighBalcony = spot.bottomPct > 60;
            const spotW = Math.round(spot.widthPx * mobileScale);
            const spotH = Math.round(spot.heightPx * mobileScale);

            return (
              <div
                key={spot.id}
                style={{
                  left: `${spot.leftPct}%`,
                  bottom: `${spot.bottomPct}%`,
                  width: `${spotW}px`,
                  height: `${spotH}px`
                }}
                onClick={(e) => handleToastBackgroundCrowd(spot, e)}
                className="absolute -translate-x-1/2 translate-y-1/2 z-10 cursor-pointer group flex flex-col items-center justify-end"
                title={
                  language === 'zh'
                    ? `点击与背景【${spot.name.zh}】一起干杯欢呼！`
                    : `Click to clink mugs with ${spot.name.en}!`
                }
              >
                <div
                  className={`absolute inset-0 rounded-3xl border transition-all duration-200 ${
                    isDrinking
                      ? 'bg-amber-400/20 border-amber-300 shadow-[0_0_36px_rgba(251,191,36,0.55)] scale-105'
                      : 'bg-transparent border-amber-400/0 group-hover:bg-amber-400/10 group-hover:border-amber-300/65 group-hover:shadow-[0_0_28px_rgba(251,191,36,0.35)]'
                  }`}
                />

                {(isSelected || isDrinking) && bubbleText && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 z-40 w-56 sm:w-68 bg-stone-950/95 border border-amber-400 rounded-2xl p-2.5 text-xs text-amber-100 leading-relaxed shadow-2xl pointer-events-none ${
                      isHighBalcony ? 'top-full mt-2' : 'bottom-full mb-2'
                    }`}
                  >
                    <p>{bubbleText}</p>
                  </div>
                )}

                {isDrinking && (
                  <div className="absolute top-1/3 z-30 text-xs sm:text-sm font-bold text-amber-200 bg-stone-950/85 px-2.5 py-0.5 rounded-lg border border-amber-400 animate-bounce pointer-events-none whitespace-nowrap">
                    {language === 'zh' ? '🍻 全桌欢呼 +3 🍺!' : '🍻 Table Roars +3 🍺!'}
                  </div>
                )}

                <div className="relative z-20 mb-1 px-2 py-0.5 rounded-md bg-stone-950/80 group-hover:bg-amber-600 text-amber-200/95 group-hover:text-stone-950 border border-amber-500/45 group-hover:border-amber-300 text-[10px] sm:text-[11px] font-semibold transition-colors shadow-lg whitespace-nowrap">
                  <span>🍻 {spot.name[language]}</span>
                  <span className="ml-1 font-mono tabular-nums opacity-90">· {mugs}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================================
            PLANE 2 (VOLUMETRIC LIGHT RAYS & WARM HAZE, ~0.78x PARALLAX)
           ===================================================================== */}
        <div
          className={`absolute top-0 bottom-0 left-0 z-10 pointer-events-none will-change-transform ${
            isGrabbing ? '' : 'transition-transform duration-150 ease-out'
          }`}
          style={{
            width: `${midLayerWidth}px`,
            transform: `translate3d(${-atmOffset}px, 0, 0)`
          }}
        >
          {[420, 1180, 1980, 2780, 3480].map((beamX, idx) => (
            <div
              key={idx}
              style={{
                left: `${beamX}px`,
                background:
                  currentRoomId === 'alchemy_vault'
                    ? 'linear-gradient(180deg, rgba(192,132,252,0.22) 0%, rgba(52,211,153,0.08) 58%, transparent 100%)'
                    : 'linear-gradient(180deg, rgba(251,191,36,0.24) 0%, rgba(249,115,22,0.09) 62%, transparent 100%)',
                transform: 'skewX(-12deg)'
              }}
              className="absolute top-0 w-52 h-[410px] sm:h-[490px] blur-2xl"
            />
          ))}
        </div>

        {/* =====================================================================
            PLANE 4 (UNIFIED 1.0x GROUNDED FLOOR WORLD: PHANTOM, GHOST + CAULDRON,
            FULL-LEG HALLOWEEN MEME TABLES, SOLO MEMES, WEIRD PUMPKIN TOTEMS & DOORS)
           ===================================================================== */}
        <div
          className={`absolute top-0 bottom-0 left-0 z-20 pointer-events-none will-change-transform ${
            isGrabbing ? '' : 'transition-transform duration-150 ease-out'
          }`}
          style={{
            width: `${currentRoom.worldWidth}px`,
            transform: `translate3d(${-scrollX}px, 0, 0)`
          }}
        >
          {/* 1. INTERACTIVE DOORS */}
          {currentRoom.doors.map((door) => {
            const isPortal = door.style === 'rune_portal';
            return (
              <div
                key={door.id}
                style={{
                  left: `${door.x}px`,
                  bottom: `${Math.round(door.bottom * mobileScale)}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnterDoor(door);
                }}
                className="absolute -translate-x-1/2 z-20 pointer-events-auto cursor-pointer group flex flex-col items-center"
              >
                <div
                  className={`w-28 h-44 sm:w-36 sm:h-60 rounded-t-full border-2 flex flex-col items-center justify-center p-2.5 sm:p-3 transition-all duration-200 group-hover:scale-105 ${
                    isPortal
                      ? 'bg-purple-950/75 border-purple-400/90 shadow-[0_0_35px_rgba(168,85,247,0.65)] group-hover:bg-purple-900/80'
                      : 'bg-amber-950/75 border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.5)] group-hover:bg-amber-900/80'
                  }`}
                >
                  <DoorOpen
                    className={`w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2 transition-transform duration-200 group-hover:translate-x-1 ${
                      isPortal ? 'text-purple-300' : 'text-amber-300'
                    }`}
                  />
                  <span className="text-[11px] sm:text-xs font-bold text-amber-100 text-center leading-tight">
                    {door.label[language]}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-stone-300 text-center mt-1 leading-tight">
                    {door.sublabel[language]}
                  </span>
                </div>
              </div>
            );
          })}

          {/* 1B. INTERACTIVE WEIRD 3-STACKED MUTANT PUMPKIN TOTEM EASTER EGG (IN EVERY ROOM!) */}
          <div
            style={{
              left: `${pumpkinSpot.x}px`,
              bottom: `${Math.round(pumpkinSpot.bottom * mobileScale)}px`
            }}
            onClick={handleTriggerPumpkinEasterEgg}
            className="absolute -translate-x-1/2 z-20 pointer-events-auto cursor-pointer group flex flex-col items-center"
            title={
              language === 'zh'
                ? '🎃 点击万圣三层变异怪南瓜图腾触发彩蛋！'
                : '🎃 Tap the Weird Mutant Pumpkin Totem for a Halloween Easter Egg!'
            }
          >
            {pumpkinEggBubble && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-40 w-[min(256px,82vw)] sm:w-68 bg-stone-950/95 border border-orange-400 rounded-2xl p-2.5 text-xs text-orange-100 leading-relaxed shadow-2xl pointer-events-none">
                {pumpkinEggBubble}
              </div>
            )}

            <div className="absolute bottom-5 w-32 sm:w-44 h-5 sm:h-6 rounded-full bg-black/75 blur-md pointer-events-none" />

            <div
              style={{ height: `${Math.round(234 * mobileScale)}px` }}
              className={`relative flex items-end justify-center transition-transform duration-200 ${
                pumpkinEggBounce
                  ? 'scale-110 -rotate-3'
                  : 'group-hover:scale-105 group-hover:-translate-y-1'
              }`}
            >
              <CutoutImage
                src={WEIRD_PUMPKIN_TOTEM_SRC}
                alt={language === 'zh' ? '三层变异怪南瓜彩蛋' : 'Weird Mutant Pumpkin Totem'}
                ps1Retro={isPs1}
                ps1MaxDim={168}
                className="max-h-full w-auto object-contain drop-shadow-[0_12px_20px_rgba(249,115,22,0.45)] select-none pointer-events-none"
              />
            </div>

            <div
              className={`mt-1 px-2.5 py-0.5 bg-orange-950/90 group-hover:bg-orange-900 border text-center transition-colors shadow-md ${
                isPs1
                  ? 'rounded-sm border-orange-500/80 font-mono'
                  : 'rounded-md border-orange-400/80'
              }`}
            >
              <span className="text-[11px] sm:text-xs font-bold text-orange-200 whitespace-nowrap">
                {language === 'zh' ? '🎃 怪南瓜彩蛋 · 点我掉宝' : '🎃 Weird Pumpkin Egg · Tap!'}
              </span>
            </div>
          </div>

          {/* 2. MAIN HALL HEROES IN SPACIOUS FOREGROUND CLEARINGS */}
          {currentRoomId === 'main_hall' && (
            <>
              {/* --- PHANTOM ON OPEN OAK PLANKS (x = 760px) --- */}
              <div
                style={{ left: '760px', bottom: isMobile ? '14px' : '18px' }}
                className="absolute -translate-x-1/2 z-25 pointer-events-auto flex flex-col items-center"
              >
                {activeInteractiveCharacter === 'phantom' && (
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-[74%] sm:bottom-full sm:mb-2 left-1/2 -translate-x-1/2 z-40 bg-stone-950/95 border border-amber-400 rounded-2xl p-3 sm:p-3.5 shadow-2xl w-[min(276px,86vw)] sm:w-72"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-amber-900/50 mb-2">
                      <span className="text-xs sm:text-sm font-bold text-amber-300 font-cinzel">
                        {CHARACTER_DATA.phantom.name[language]} · {language === 'zh' ? '幽灵调酒师' : 'Bartender'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveInteractiveCharacter(null)}
                        className="text-stone-400 hover:text-white text-xs px-1.5 py-0.5"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed mb-2.5 line-clamp-2">
                      "{CHARACTER_DATA.phantom.greeting[language]}"
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCharacter('phantom');
                          setActiveInteractiveCharacter(null);
                          scrollToChatSection();
                        }}
                        className="flex-1 min-h-[38px] py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{language === 'zh' ? '对话/联网问答' : 'Live Chat'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveInteractiveCharacter(null);
                          onOpenBrewing();
                        }}
                        className="flex-1 min-h-[38px] py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Beer className="w-3.5 h-3.5" />
                        <span>{language === 'zh' ? '无限混调啤酒' : 'Mixology'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div
                  onClick={(e) => handleCharacterClick('phantom', e)}
                  className="cursor-pointer relative group flex flex-col items-center transition-transform duration-200 hover:scale-105"
                >
                  <div className="absolute bottom-3 w-36 sm:w-52 h-7 sm:h-9 rounded-full bg-black/75 blur-md pointer-events-none" />
                  <CutoutImage
                    src={CHARACTER_DATA.phantom.cutout}
                    alt="Phantom the Spectral Bartender"
                    draggable={false}
                    ps1Retro={isPs1}
                    ps1MaxDim={168}
                    className="relative h-[225px] sm:h-[340px] w-auto object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.94)] select-none"
                  />
                  <div
                    className={`mt-1 px-3 py-1 bg-stone-950/90 border shadow-lg transition-colors ${
                      isPs1
                        ? 'rounded-sm border-stone-600 group-hover:border-amber-400 font-mono'
                        : 'rounded-lg border-amber-500/70 group-hover:border-amber-300'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-cinzel font-bold text-amber-200 whitespace-nowrap">
                      {language === 'zh' ? 'Phantom · 点击对话/调酒' : 'Phantom · Click to Chat / Brew'}
                    </span>
                  </div>
                </div>
              </div>

              {/* --- HEARTH RUMOR WOODEN SIGNPOST HIGH ON STONE CHIMNEY (x = 1665px) --- */}
              <div
                style={{ left: '1665px', bottom: isMobile ? '245px' : '315px' }}
                onClick={handleInspectRumorBoard}
                className="absolute -translate-x-1/2 z-20 pointer-events-auto cursor-pointer group flex flex-col items-center"
              >
                {rumorBubble && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-40 w-[min(256px,82vw)] sm:w-72 bg-stone-950/95 border border-amber-400 rounded-xl p-2.5 sm:p-3 text-xs text-amber-100 leading-relaxed shadow-2xl pointer-events-none">
                    {rumorBubble}
                  </div>
                )}
                <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-950/90 hover:bg-stone-900 border border-amber-500/70 group-hover:border-amber-300 shadow-xl transition-transform duration-200 group-hover:scale-105 text-center">
                  <div className="text-base sm:text-lg">📜🔥</div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-amber-200 whitespace-nowrap">
                    {language === 'zh' ? '幽灵传闻牌' : 'Rumors'}
                  </div>
                </div>
              </div>

              {/* --- GHOST + RESTORED ORIGINAL SKULL CAULDRON (x = 2280px) --- */}
              <div
                style={{ left: '2280px', bottom: isMobile ? '14px' : '18px' }}
                className="absolute -translate-x-1/2 z-25 pointer-events-auto flex items-end gap-4 sm:gap-8"
              >
                <div className="relative flex flex-col items-center">
                  {activeInteractiveCharacter === 'ghost' && (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-[74%] sm:bottom-full sm:mb-2 left-1/2 -translate-x-1/2 z-40 bg-stone-950/95 border border-purple-400 rounded-2xl p-3 sm:p-3.5 shadow-2xl w-[min(276px,86vw)] sm:w-72"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-purple-900/50 mb-2">
                        <span className="text-xs sm:text-sm font-bold text-purple-300 font-cinzel">
                          {CHARACTER_DATA.ghost.name[language]} · {language === 'zh' ? '幽灵主厨' : 'Head Chef'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveInteractiveCharacter(null)}
                          className="text-stone-400 hover:text-white text-xs px-1.5 py-0.5"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-stone-200 leading-relaxed mb-2.5 line-clamp-2">
                        "{CHARACTER_DATA.ghost.greeting[language]}"
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCharacter('ghost');
                            setActiveInteractiveCharacter(null);
                            scrollToChatSection();
                          }}
                          className="flex-1 min-h-[38px] py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{language === 'zh' ? '对话/联网问答' : 'Live Chat'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveInteractiveCharacter(null);
                            onOpenKitchen();
                          }}
                          className="flex-1 min-h-[38px] py-2 bg-stone-800 hover:bg-stone-700 text-purple-300 font-bold text-xs rounded-lg border border-purple-500/50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>{language === 'zh' ? '无限坩埚熬汤' : 'Cook Stew'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    onClick={(e) => handleCharacterClick('ghost', e)}
                    className="cursor-pointer relative group flex flex-col items-center transition-transform duration-200 hover:scale-105"
                  >
                    <div className="absolute bottom-3 w-36 sm:w-52 h-7 sm:h-9 rounded-full bg-black/75 blur-md pointer-events-none" />
                    <CutoutImage
                      src={CHARACTER_DATA.ghost.cutout}
                      alt="Ghost the Spectral Head Chef"
                      draggable={false}
                      ps1Retro={isPs1}
                      ps1MaxDim={168}
                      className="relative h-[230px] sm:h-[345px] w-auto object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.94)] select-none"
                    />
                    <div
                      className={`mt-1 px-3 py-1 bg-stone-950/90 border shadow-lg transition-colors ${
                        isPs1
                          ? 'rounded-sm border-stone-600 group-hover:border-purple-300 font-mono'
                          : 'rounded-lg border-purple-500/70 group-hover:border-purple-300'
                      }`}
                    >
                      <span className="text-[11px] sm:text-xs font-cinzel font-bold text-purple-200 whitespace-nowrap">
                        {language === 'zh' ? 'Ghost · 点击对话/熬汤' : 'Ghost · Click to Chat / Cook'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Restored Original High-Detail Skull Rune Cauldron */}
                <div className="pb-1">
                  <DynamicCauldron
                    language={language}
                    onOpenKitchen={onOpenKitchen}
                    size="large"
                    ps1Retro={isPs1}
                  />
                </div>
              </div>
            </>
          )}

          {/* 3. VIP CELLAR EXPLORATION PROPS */}
          {currentRoomId === 'vip_cellar' && (
            <>
              <div
                style={{ left: '420px', bottom: `${Math.round(96 * mobileScale)}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasDraggedRef.current) return;
                  sound.playDiceRoll();
                  setIsDiceOpen(true);
                }}
                className="absolute -translate-x-1/2 z-20 pointer-events-auto cursor-pointer group flex flex-col items-center"
              >
                <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-emerald-950/90 hover:bg-emerald-900 border-2 border-emerald-400/80 shadow-[0_0_28px_rgba(16,185,129,0.45)] transition-transform duration-200 group-hover:scale-105 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-xs mb-0.5">
                    <Dices className="w-4 h-4" />
                    <span>{language === 'zh' ? '秘窖大小骰子赌桌' : 'Cellar High-Low Dice'}</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-stone-200 whitespace-nowrap">
                    {language === 'zh' ? '点击下注赢 2至4倍 $PHANTOM 与稀有食材' : 'Click to Roll for 2x–4x $PHANTOM & Loot'}
                  </div>
                </div>
              </div>

              <div
                style={{ left: '2590px', bottom: `${Math.round(295 * mobileScale)}px` }}
                onClick={handleSearchCellarBarrels}
                className="absolute -translate-x-1/2 z-20 pointer-events-auto cursor-pointer group flex flex-col items-center"
              >
                <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-stone-950/90 hover:bg-stone-900 border border-amber-500/70 shadow-xl transition-transform duration-200 group-hover:scale-105 text-center">
                  <div className="text-lg sm:text-xl mb-0.5">🛢️🎃</div>
                  <div className="text-[11px] sm:text-xs font-bold text-amber-200 whitespace-nowrap">
                    {getRemainingSeconds('cellar_barrels') > 0
                      ? language === 'zh'
                        ? `酒桶酿造冷却（${getRemainingSeconds('cellar_barrels')}秒）`
                        : `Casks Refilling (${getRemainingSeconds('cellar_barrels')}s)`
                      : language === 'zh'
                        ? '搜寻百年橡木酒桶（免费领食材）'
                        : 'Search Vintage Casks (Free Loot)'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 4. CRYSTAL ALCHEMY PUB EXPLORATION PROPS */}
          {currentRoomId === 'alchemy_vault' && (
            <>
              <div
                style={{ left: '380px', bottom: `${Math.round(190 * mobileScale)}px` }}
                onClick={handleUseDistiller}
                className="absolute -translate-x-1/2 z-20 pointer-events-auto cursor-pointer group flex flex-col items-center"
              >
                <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-stone-950/90 hover:bg-stone-900 border border-emerald-500/70 shadow-xl transition-transform duration-200 group-hover:scale-105 text-center">
                  <div className="text-lg sm:text-xl mb-0.5">🧪💨</div>
                  <div className="text-[11px] sm:text-xs font-bold text-emerald-300 whitespace-nowrap">
                    {getRemainingSeconds('distiller') > 0
                      ? language === 'zh'
                        ? `蒸馏凝结中（${getRemainingSeconds('distiller')}秒）`
                        : `Condensing (${getRemainingSeconds('distiller')}s)`
                      : language === 'zh'
                        ? '提纯魔药坩埚（免费领食材）'
                        : 'Distill Potion (Free Ingredient)'}
                  </div>
                </div>
              </div>

              <div
                style={{ left: '1410px', bottom: `${Math.round(175 * mobileScale)}px` }}
                onClick={handleOpenGoldenChest}
                className="absolute -translate-x-1/2 z-20 pointer-events-auto cursor-pointer group flex flex-col items-center"
              >
                <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-amber-950/90 hover:bg-amber-900 border-2 border-amber-400 shadow-[0_0_32px_rgba(251,191,36,0.5)] transition-transform duration-200 group-hover:scale-105 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-xs mb-0.5">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {getRemainingSeconds('golden_chest') > 0
                        ? language === 'zh'
                          ? `秘箱符文充能（${getRemainingSeconds('golden_chest')}秒）`
                          : `Chest Recharging (${getRemainingSeconds('golden_chest')}s)`
                        : language === 'zh'
                          ? '开启远古黄金秘宝箱！'
                          : 'Open Ancient Golden Chest!'}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-amber-100/90 whitespace-nowrap">
                    {language === 'zh'
                      ? '掉落大量 $PHANTOM · 稀有食材 · 奇遇烂苹果'
                      : 'Drops $PHANTOM · Rare Ingredients · APPL Chance'}
                  </div>
                </div>
              </div>

              <div
                style={{ left: '2560px', bottom: `${Math.round(96 * mobileScale)}px` }}
                onClick={handleForageCrystalHerbs}
                className="absolute -translate-x-1/2 z-20 pointer-events-auto cursor-pointer group flex flex-col items-center"
              >
                <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-purple-950/90 hover:bg-purple-900 border border-purple-400/75 shadow-xl transition-transform duration-200 group-hover:scale-105 text-center">
                  <div className="text-lg sm:text-xl mb-0.5">🍄💎</div>
                  <div className="text-[11px] sm:text-xs font-bold text-purple-200 whitespace-nowrap">
                    {getRemainingSeconds('crystal_herbs') > 0
                      ? language === 'zh'
                        ? `魔晶再生中（${getRemainingSeconds('crystal_herbs')}秒）`
                        : `Regrowing (${getRemainingSeconds('crystal_herbs')}s)`
                      : language === 'zh'
                        ? '采集荧光紫晶丛（免费领食材）'
                        : 'Forage Crystal Herbs (Free)'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 5. ALL GROUNDED HALLOWEEN MEME TABLES & REGULARS ON FLOOR PLANE */}
          {roomPatrons.map((p) => (
            <div key={p.id} className="pointer-events-auto">
              {renderPatronSprite(p)}
            </div>
          ))}
        </div>

        {/* =====================================================================
            PLANE 5 (NEAR-CAMERA HALLOWEEN JACK-O'-LANTERN RAFTERS & LIGHT PS1 DITHER)
           ===================================================================== */}
        <div
          className={`absolute top-0 bottom-0 left-0 z-25 pointer-events-none will-change-transform ${
            isGrabbing ? '' : 'transition-transform duration-150 ease-out'
          }`}
          style={{
            width: `${fgCeilingWidth}px`,
            transform: `translate3d(${-fgCeilingOffset}px, 0, 0)`
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-3.5 bg-gradient-to-b from-stone-950/60 to-transparent" />

          {[320, 920, 1520, 2120, 2720, 3320, 3920].map((lx, idx) => (
            <div
              key={idx}
              style={{ left: `${lx}px` }}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
            >
              <div className="w-1 h-3.5 sm:h-4 bg-stone-900" />
              {idx % 2 === 0 ? (
                <div className="text-base sm:text-xl leading-none drop-shadow-[0_4px_18px_rgba(249,115,22,0.85)]">
                  🎃
                </div>
              ) : (
                <div
                  className={`w-6 h-7 sm:w-7 sm:h-8 border flex items-center justify-center ${
                    isPs1
                      ? 'rounded-none bg-amber-950/85 border-amber-500/70 shadow-[0_6px_22px_rgba(251,191,36,0.65)]'
                      : 'rounded-b-xl bg-amber-500/30 border-amber-400/65 shadow-[0_6px_26px_rgba(245,158,11,0.65)]'
                  }`}
                >
                  <div
                    className={
                      isPs1
                        ? 'w-2.5 h-2.5 bg-amber-300'
                        : 'w-2.5 h-2.5 rounded-full bg-amber-200 blur-[0.5px]'
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Crisp, Bright 90s PlayStation Subtle Scanline & Dither Pass (Zero dark crush!) */}
        {isPs1 && (
          <div
            className="absolute inset-0 z-25 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px),
                repeating-linear-gradient(90deg, rgba(255,240,210,0.025) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 4px),
                radial-gradient(circle at 50% 50%, transparent 74%, rgba(0,0,0,0.14) 100%)
              `
            }}
          />
        )}

        {/* =====================================================================
            VIP CELLAR HIGH-LOW DICE MINI-GAME OVERLAY MODAL
           ===================================================================== */}
        {isDiceOpen && currentRoomId === 'vip_cellar' && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-40 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          >
            <div className="bg-stone-900 border-2 border-emerald-500/80 rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Dices className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm sm:text-base font-cinzel font-bold text-amber-200">
                    {language === 'zh' ? '地下贵宾秘窖 · 幽灵大小骰子局' : 'VIP Cellar · High-Low Meme Dice'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDiceOpen(false)}
                  className="text-stone-400 hover:text-white text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-300 font-mono tabular-nums">
                <span>
                  {language === 'zh' ? `当前筹码: ${cocoBalance} $PHANTOM` : `Balance: ${cocoBalance} $PHANTOM`}
                </span>
                <div className="flex items-center gap-1.5">
                  <span>{language === 'zh' ? '单局押注:' : 'Wager:'}</span>
                  {([50, 150] as const).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDiceBet(amt)}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                        diceBet === amt
                          ? 'bg-emerald-500 text-stone-950'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-4 bg-emerald-950/50 border border-emerald-800/50 rounded-xl flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-6">
                  {diceValues.map((val, idx) => (
                    <div
                      key={idx}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 text-stone-950 border-2 border-amber-500 shadow-xl flex items-center justify-center text-2xl sm:text-3xl font-mono font-black tabular-nums ${
                        diceRolling ? 'animate-spin' : ''
                      }`}
                    >
                      {val}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-mono text-emerald-300 tabular-nums mt-1">
                  {diceRolling
                    ? language === 'zh'
                      ? '🎲 恰德骑士正在摇晃骨骰盅...'
                      : '🎲 GigaChad is shaking the bone cup...'
                    : language === 'zh'
                      ? `当前点数合计: ${diceValues[0] + diceValues[1]} 点`
                      : `Total Pips: ${diceValues[0] + diceValues[1]}`}
                </span>
              </div>

              {diceResultMsg && (
                <div className="text-xs text-center font-semibold text-amber-200 bg-stone-950/90 border border-amber-700/40 rounded-lg py-2 px-3">
                  {diceResultMsg}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={diceRolling || cocoBalance < diceBet}
                  onClick={() => handlePlayDice('small')}
                  className="py-2.5 px-2 bg-stone-800 hover:bg-emerald-700 disabled:opacity-40 text-amber-100 rounded-xl border border-stone-700 transition-colors text-center"
                >
                  <div className="text-xs sm:text-sm font-bold">{language === 'zh' ? '押小 (2–6)' : 'SMALL (2–6)'}</div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-emerald-400">
                    {language === 'zh' ? '2倍赔率' : '2x Payout'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={diceRolling || cocoBalance < diceBet}
                  onClick={() => handlePlayDice('seven')}
                  className="py-2.5 px-2 bg-amber-950/80 hover:bg-amber-700 disabled:opacity-40 text-amber-200 rounded-xl border border-amber-500/60 transition-colors text-center"
                >
                  <div className="text-xs sm:text-sm font-bold">{language === 'zh' ? '幸运七 (7)' : 'LUCKY 7'}</div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-amber-300">
                    {language === 'zh' ? '4倍赔率+彩头' : '4x + Loot!'}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={diceRolling || cocoBalance < diceBet}
                  onClick={() => handlePlayDice('big')}
                  className="py-2.5 px-2 bg-stone-800 hover:bg-emerald-700 disabled:opacity-40 text-amber-100 rounded-xl border border-stone-700 transition-colors text-center"
                >
                  <div className="text-xs sm:text-sm font-bold">{language === 'zh' ? '押大 (8–12)' : 'BIG (8–12)'}</div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-emerald-400">
                    {language === 'zh' ? '2倍赔率' : '2x Payout'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          TOUCH-DRAGGABLE CAMERA SCRUBBER STRIP (Swipe or Tap anywhere to pan instantly)
         ========================================================================= */}
      <div className="relative z-30 px-3 py-1.5 bg-stone-950 border-t border-amber-950/40 flex items-center gap-2.5">
        <div
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => {
            scrubberDraggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            panSmoothTo(ratio * currentRoom.worldWidth);
          }}
          onPointerMove={(e) => {
            if (!scrubberDraggingRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            panSmoothTo(ratio * currentRoom.worldWidth);
          }}
          onPointerUp={() => {
            scrubberDraggingRef.current = false;
          }}
          onPointerCancel={() => {
            scrubberDraggingRef.current = false;
          }}
          className="relative flex-1 h-7 sm:h-6 bg-stone-900 rounded-md border border-stone-800 cursor-pointer overflow-hidden"
        >
          <div
            className="absolute top-0 bottom-0 bg-amber-500/25 border-x-2 border-amber-400 pointer-events-none transition-all duration-75"
            style={{
              left: `${(scrollX / currentRoom.worldWidth) * 100}%`,
              width: `${Math.min(100, (viewportWidth / currentRoom.worldWidth) * 100)}%`
            }}
          />

          {currentRoom.doors.map((d) => (
            <div
              key={d.id}
              style={{ left: `${(d.x / currentRoom.worldWidth) * 100}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[11px] pointer-events-none"
            >
              🚪
            </div>
          ))}

          <div
            style={{ left: `${(pumpkinSpot.x / currentRoom.worldWidth) * 100}%` }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[11px] pointer-events-none"
          >
            🎃
          </div>

          {currentRoomId === 'main_hall' && (
            <>
              <div
                style={{ left: `${(760 / currentRoom.worldWidth) * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-300 pointer-events-none whitespace-nowrap"
              >
                🍺Phantom
              </div>
              <div
                style={{ left: `${(2280 / currentRoom.worldWidth) * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[10px] font-bold text-purple-300 pointer-events-none whitespace-nowrap"
              >
                🍲Ghost
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
