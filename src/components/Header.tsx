import React, { useEffect, useState, useRef } from 'react';
import { CharacterId, Language, TavernArtStyle, TavernRoomId, TavernView } from '../types/tavern';
import {
  Settings,
  Volume2,
  VolumeX,
  Music,
  Sun,
  Users,
  Beer,
  X,
  Compass,
  Monitor
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  cocoBalance: number;
  appleBalance: number;
  stockShares: number;
  activeView: TavernView;
  onNavigate: (view: TavernView) => void;
  onOpenFaucet: () => void;
  currentRoomId: TavernRoomId;
  onSelectRoom: (roomId: TavernRoomId) => void;
  onFocusCharacter: (char: CharacterId) => void;
  onToastHall: () => void;
  brightnessLevel: number;
  onBrightnessChange: (val: number) => void;
  artStyle: TavernArtStyle;
  onArtStyleChange: (style: TavernArtStyle) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  cocoBalance,
  appleBalance,
  stockShares,
  activeView,
  onNavigate,
  onOpenFaucet,
  currentRoomId,
  onSelectRoom,
  onFocusCharacter,
  onToastHall,
  brightnessLevel,
  onBrightnessChange,
  artStyle,
  onArtStyleChange
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(sound.enabled);
  const [ambienceEnabled, setAmbienceEnabled] = useState(sound.ambientEnabled);
  const [ambienceVol, setAmbienceVol] = useState(Math.round(sound.ambientVolume * 100));
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return sound.subscribe(() => {
      setSfxEnabled(sound.enabled);
      setAmbienceEnabled(sound.ambientEnabled);
      setAmbienceVol(Math.round(sound.ambientVolume * 100));
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navItems: Array<{ id: TavernView; labelZh: string; labelEn: string }> = [
    { id: 'tavern', labelZh: 'Phantom酒馆', labelEn: 'Tavern' },
    { id: 'meme', labelZh: '梗图工坊', labelEn: 'Meme Forge' },
    { id: 'analysis', labelZh: '行情分析', labelEn: 'Markets' },
    { id: 'market', labelZh: '食材集市', labelEn: 'Ingredients' },
    { id: 'appl', labelZh: 'APPL股票', labelEn: 'APPL Stock' },
    { id: 'stories', labelZh: '幽灵秘史', labelEn: 'Chronicles' }
  ];

  const roomItems: Array<{ id: TavernRoomId; labelZh: string; labelEn: string }> = [
    { id: 'main_hall', labelZh: '🍻 双层主大厅', labelEn: '🍻 2F Grand Hall' },
    { id: 'vip_cellar', labelZh: '🎲 深拱秘窖赌坊', labelEn: '🎲 VIP Cellar' },
    { id: 'alchemy_vault', labelZh: '🔮 魔晶温室酒廊', labelEn: '🔮 Crystal Pub' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur-md border-b border-amber-900/30 px-3 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Single-Line Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            onNavigate('tavern');
            setMenuOpen(false);
          }}
          className="font-cinzel text-sm sm:text-base md:text-lg font-black tracking-wider text-amber-200 hover:text-amber-300 transition-colors whitespace-nowrap truncate"
        >
          {language === 'zh' ? 'Phantom酒馆' : 'PHANTOM TAVERN'}
        </button>

        {/* Zone 2: Clean Single-Line Nav Links (Desktop only — zero extra row on mobile!) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-amber-200 ${
                activeView === item.id
                  ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                  : 'text-stone-300'
              }`}
            >
              {language === 'zh' ? item.labelZh : item.labelEn}
              {item.id === 'appl' && (appleBalance > 0 || stockShares > 0) ? (
                <span className="ml-1.5 text-xs font-mono text-emerald-400 tabular-nums">
                  {language === 'zh'
                    ? `(${appleBalance}🍏/${stockShares}股)`
                    : `(${appleBalance}🍏/${stockShares}sh)`}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Zone 3: Minimal Right Controls ($PHANTOM Faucet + Single Unified Settings/Menu Button) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenFaucet}
            title={language === 'zh' ? '点击免费领取 +250 $PHANTOM' : 'Click to claim +250 $PHANTOM Faucet'}
            className="min-h-[38px] px-2.5 sm:px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-mono font-bold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 tabular-nums flex items-center gap-1"
          >
            <span>🪙 {cocoBalance.toLocaleString()}</span>
            <span className="hidden sm:inline">$PHANTOM</span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label={language === 'zh' ? '打开菜单与设置' : 'Open Menu & Settings'}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              menuOpen
                ? 'bg-amber-600 text-stone-950 border-amber-500 font-bold'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-200 border-stone-700'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="lg:hidden">{language === 'zh' ? '菜单/设置' : 'Menu'}</span>
            <span className="hidden lg:inline">{language === 'zh' ? '设置' : 'Settings'}</span>
          </button>
        </div>
      </div>

      {/* Unified Top-Right Settings & Quick Menu Drawer/Popover */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-12 sm:top-14 z-40 bg-black/60 backdrop-blur-[2px]"
          />

          <div
            ref={panelRef}
            className="fixed top-13 sm:top-16 right-2 left-2 sm:left-auto sm:right-6 z-50 sm:w-[400px] max-h-[82vh] overflow-y-auto bg-stone-950 border border-amber-700/60 rounded-2xl shadow-2xl p-4 space-y-4 text-stone-100"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-cinzel font-bold text-amber-200">
                  {language === 'zh' ? 'Phantom酒馆菜单与设置' : 'Phantom Tavern Menu & Settings'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                aria-label={language === 'zh' ? '关闭' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Page Switcher (Essential on Mobile/Tablet, convenient on Desktop) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'zh' ? '切换页面' : 'Navigate Pages'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      setMenuOpen(false);
                    }}
                    className={`min-h-[40px] px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors text-center truncate ${
                      activeView === item.id
                        ? 'bg-amber-600 text-stone-950 font-bold shadow'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800'
                    }`}
                  >
                    {language === 'zh' ? item.labelZh : item.labelEn}
                    {item.id === 'appl' && (appleBalance > 0 || stockShares > 0)
                      ? ` (${appleBalance}🍏)`
                      : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Tavern Room Teleport & Hero Quick Actions */}
            <div className="space-y-2.5 pt-3 border-t border-stone-800/90">
              <div className="text-xs font-semibold text-stone-400">
                {language === 'zh' ? '酒馆秘室与快捷定位' : 'Tavern Rooms & Quick Actions'}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {roomItems.map((rm) => (
                  <button
                    key={rm.id}
                    type="button"
                    onClick={() => {
                      onNavigate('tavern');
                      onSelectRoom(rm.id);
                      setMenuOpen(false);
                    }}
                    className={`min-h-[40px] px-2 py-2 rounded-xl text-xs font-semibold transition-colors truncate ${
                      activeView === 'tavern' && currentRoomId === rm.id
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400 font-bold'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
                    }`}
                  >
                    {language === 'zh' ? rm.labelZh : rm.labelEn}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('tavern');
                    onFocusCharacter('phantom');
                    setMenuOpen(false);
                  }}
                  className="min-h-[40px] px-2 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-800/50 rounded-xl text-xs font-semibold transition-colors truncate"
                >
                  {language === 'zh' ? '🍺 找Phantom' : '🍺 Find Phantom'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('tavern');
                    onFocusCharacter('ghost');
                    setMenuOpen(false);
                  }}
                  className="min-h-[40px] px-2 py-2 bg-stone-900 hover:bg-stone-800 text-purple-300 border border-purple-800/50 rounded-xl text-xs font-semibold transition-colors truncate"
                >
                  {language === 'zh' ? '🍲 找Ghost' : '🍲 Find Ghost'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('tavern');
                    onToastHall();
                    setMenuOpen(false);
                  }}
                  className="min-h-[40px] px-2 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors truncate"
                >
                  <Beer className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{language === 'zh' ? '全堂干杯' : 'Toast Hall'}</span>
                </button>
              </div>
            </div>

            {/* Section 3: Language, Audio & Brightness Controls */}
            <div className="space-y-3 pt-3 border-t border-stone-800/90">
              {/* Language Switcher */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-stone-300">
                  {language === 'zh' ? '界面与对话语言' : 'Language'}
                </span>
                <div className="flex items-center p-0.5 bg-stone-900 border border-stone-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => onLanguageChange('en')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                      language === 'en'
                        ? 'bg-amber-600 text-stone-950'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange('zh')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                      language === 'zh'
                        ? 'bg-amber-600 text-stone-950'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    中文
                  </button>
                </div>
              </div>

              {/* Tavern Environment Art Style Switcher (PS1 Low-Poly vs Preserved Classic) */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'zh' ? '酒馆环境画风' : 'Tavern Art Style'}</span>
                </span>
                <div className="flex items-center p-0.5 bg-stone-900 border border-stone-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => onArtStyleChange('ps1')}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                      artStyle === 'ps1'
                        ? 'bg-amber-600 text-stone-950'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {language === 'zh' ? 'PS1复古低模' : 'PS1 Retro 3D'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onArtStyleChange('classic')}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                      artStyle === 'classic'
                        ? 'bg-amber-600 text-stone-950'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {language === 'zh' ? '经典原版' : 'Original'}
                  </button>
                </div>
              </div>

              {/* Audio Toggles */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => sound.toggleAmbience()}
                  className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    ambienceEnabled
                      ? 'bg-emerald-950/75 text-emerald-300 border-emerald-600/50'
                      : 'bg-stone-900 text-stone-400 border-stone-800'
                  }`}
                >
                  {ambienceEnabled ? (
                    <Music className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate">
                    {language === 'zh'
                      ? ambienceEnabled
                        ? '酒馆环境音: 开'
                        : '酒馆环境音: 关'
                      : ambienceEnabled
                        ? 'Crowd Audio: On'
                        : 'Crowd Audio: Off'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => sound.toggleSfx()}
                  className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                    sfxEnabled
                      ? 'bg-stone-900 text-amber-300 border-amber-600/40'
                      : 'bg-stone-900 text-stone-400 border-stone-800'
                  }`}
                >
                  {sfxEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate">
                    {language === 'zh'
                      ? sfxEnabled
                        ? '交互音效: 开'
                        : '交互音效: 关'
                      : sfxEnabled
                        ? 'Sound FX: On'
                        : 'Sound FX: Off'}
                  </span>
                </button>
              </div>

              {/* Crowd Volume Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-200">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'zh' ? '酒馆热闹音量' : 'Crowd & Clinks Vol'}</span>
                  </span>
                  <span className="font-mono text-emerald-300 tabular-nums">{ambienceVol}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={ambienceVol}
                  onChange={(e) => sound.setAmbientVolume(Number(e.target.value) / 100)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Scene Brightness Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-amber-200">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'zh' ? '场景画面亮度' : 'Scene Brightness'}</span>
                  </span>
                  <span className="font-mono text-amber-300 tabular-nums">{brightnessLevel}%</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="200"
                  value={brightnessLevel}
                  onChange={(e) => onBrightnessChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
