export type Language = 'en' | 'zh';

export type CharacterId = 'phantom' | 'ghost';

export type TavernView = 'tavern' | 'meme' | 'analysis' | 'market' | 'appl' | 'stories';

export type TavernRoomId = 'main_hall' | 'vip_cellar' | 'alchemy_vault';

export type TavernArtStyle = 'ps1' | 'classic';

export interface TavernSceneCommand {
  type: 'switch_room' | 'focus_char' | 'toast_hall';
  roomId?: TavernRoomId;
  char?: CharacterId;
  nonce: number;
}

export interface MemeDraftConfig {
  topText: string;
  bottomText: string;
  primaryCharId: string;
  secondaryCharId: string | null;
  backdropId: string;
  stickers?: Array<{ emoji: string; xPct: number; yPct: number; size: number }>;
  contextTopic?: string;
  character?: CharacterId;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Ingredient {
  id: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  price: number; // in $PHANTOM
  image: string;
  category: 'meme' | 'spooky' | 'crypto';
  rarity: 'common' | 'rare' | 'legendary';
}

export interface CraftedItem {
  id: string;
  name: { en: string; zh: string };
  type: 'drink' | 'soup';
  description: { en: string; zh: string };
  effect: { en: string; zh: string };
  ingredients: string[];
  rarity: 'normal' | 'rare' | 'legendary' | 'mythic';
  rewardCoco: number;
  appleDropChance: number; // 0.0 - 1.0
  icon: string;
}

export interface ChatMessage {
  id: string;
  sender: 'player' | 'phantom' | 'ghost' | 'system';
  character?: CharacterId;
  text: { en: string; zh: string };
  timestamp: number;
  hasAppleDrop?: boolean;
  isLiveAI?: boolean;
  sources?: GroundingSource[];
}

export interface TavernStory {
  id: string;
  title: { en: string; zh: string };
  character: CharacterId;
  summary: { en: string; zh: string };
  content: { en: string; zh: string };
  isHalloween?: boolean;
  unlocked: boolean;
}

export interface StockHolding {
  shares: number;
  redeemedDate?: string;
  avgCost: number;
}

export interface TavernPatron {
  id: string;
  roomId: TavernRoomId;
  depthPlane?: 'midground' | 'foreground';
  x: number; // Horizontal center coordinate (px) in its parallax layer
  bottom: number; // Distance from floor bottom (px)
  heightPx: number; // Rendered character height (px)
  flipX?: boolean;
  name: { en: string; zh: string };
  role: { en: string; zh: string };
  sprite: string;
  fallbackAvatar: string;
  favoriteDrink: { en: string; zh: string };
  toasts: { en: string[]; zh: string[] };
  idleLines: { en: string[]; zh: string[] };
}

export interface BackgroundCrowdSpot {
  id: string;
  roomId: TavernRoomId;
  leftPct: number; // % across the deep background layer (pixel-locked to painted booths/balconies!)
  bottomPct: number; // % from bottom of deep background layer
  widthPx: number;
  heightPx: number;
  name: { en: string; zh: string };
  members: { en: string; zh: string };
  toasts: { en: string[]; zh: string[] };
  grantsFreeIngredient?: boolean;
}

export interface TavernDoor {
  id: string;
  targetRoomId: TavernRoomId;
  targetSpawnX: number;
  x: number;
  bottom: number;
  label: { en: string; zh: string };
  sublabel: { en: string; zh: string };
  style: 'wood_arch' | 'rune_portal' | 'iron_cellar';
}

export interface TavernRoomData {
  id: TavernRoomId;
  name: { en: string; zh: string };
  subtitle: { en: string; zh: string };
  backdrop: string;
  ps1Backdrop?: string;
  worldWidth: number;
  bgWorldWidth: number;
  midWorldWidth: number;
  defaultScrollX: number;
  doors: TavernDoor[];
}

export interface MarketQuote {
  symbol: string;
  name: string;
  category: 'crypto' | 'us_stock';
  price: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
  updatedAt: number;
}
