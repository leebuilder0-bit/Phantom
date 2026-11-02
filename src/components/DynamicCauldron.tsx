import React, { useState } from 'react';
import { Language } from '../types/tavern';
import { CAULDRON_IMAGE_SRC } from '../data/tavernData';
import { CutoutImage } from '../utils/cutout';
import { sound } from '../utils/audio';

interface DynamicCauldronProps {
  language: Language;
  onOpenKitchen: () => void;
  size?: 'normal' | 'large';
  ps1Retro?: boolean;
}

export const DynamicCauldron: React.FC<DynamicCauldronProps> = ({
  language,
  onOpenKitchen,
  size = 'large',
  ps1Retro = false
}) => {
  const [clickedEffect, setClickedEffect] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playCauldronBoil();
    setClickedEffect(true);
    setTimeout(() => setClickedEffect(false), 1200);
    onOpenKitchen();
  };

  const sizeClasses =
    size === 'large'
      ? 'w-32 h-32 sm:w-48 sm:h-48 md:w-52 md:h-52'
      : 'w-28 h-28 sm:w-36 sm:h-36';

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer relative flex flex-col items-center select-none group transition-transform duration-200 hover:scale-105 active:scale-95"
      title={
        language === 'zh'
          ? '点击紫绿骷髅大坩埚，不限数量投入食材随机熬汤！'
          : 'Click the Skull Rune Cauldron to cook soup with unlimited ingredients!'
      }
    >
      {/* Click splash feedback */}
      {clickedEffect && (
        <div className="absolute -top-12 z-50 text-xs font-mono font-bold text-emerald-300 bg-purple-950/95 border border-emerald-400 px-3 py-1.5 rounded-lg animate-bounce shadow-2xl whitespace-nowrap">
          {language === 'zh' ? '🍲 咕嘟咕嘟！开锅熬汤！' : '🍲 Bubbling & Simmering!'}
        </div>
      )}

      {/* Magical Purple-Green Aura Behind the Original Cauldron Artwork */}
      <div className={`relative ${sizeClasses} flex items-center justify-center`}>
        <div
          className={`absolute inset-1 rounded-full blur-xl group-hover:blur-2xl group-hover:scale-110 transition-all duration-300 pointer-events-none ${
            ps1Retro
              ? 'bg-gradient-to-tr from-amber-700/40 via-purple-900/45 to-emerald-700/35'
              : 'bg-gradient-to-tr from-purple-600/55 via-emerald-500/45 to-fuchsia-600/55'
          }`}
        />

        {/* Original High-Detail Rune Skull Cauldron Image */}
        <div
          className={`relative w-full h-full rounded-full overflow-hidden border-2 transition-colors bg-stone-950 ${
            ps1Retro
              ? 'border-stone-600 group-hover:border-amber-400 shadow-[0_14px_28px_rgba(0,0,0,0.95)]'
              : 'border-purple-400/75 group-hover:border-emerald-400 shadow-[0_12px_32px_rgba(0,0,0,0.9),0_0_28px_rgba(168,85,247,0.75)]'
          }`}
        >
          {ps1Retro ? (
            <CutoutImage
              src={CAULDRON_IMAGE_SRC}
              alt="Ghost's Skull Cauldron"
              draggable={false}
              ps1Retro
              ps1MaxDim={136}
              className="w-full h-full object-cover scale-[1.08] group-hover:scale-[1.14] transition-transform duration-300 select-none"
            />
          ) : (
            <img
              src={CAULDRON_IMAGE_SRC}
              alt="Ghost's Skull Cauldron"
              referrerPolicy="no-referrer"
              draggable={false}
              className="w-full h-full object-cover scale-[1.08] group-hover:scale-[1.14] transition-transform duration-300 select-none"
            />
          )}
          <div className="absolute inset-0 rounded-full ring-inset ring-8 ring-stone-950/55 pointer-events-none" />
        </div>
      </div>

      {/* Subtle Floating Floor Caption */}
      <div
        className={`mt-2 px-3 py-1 bg-stone-950/90 border shadow-lg transition-colors ${
          ps1Retro
            ? 'rounded-sm border-stone-600 group-hover:border-amber-400 font-mono'
            : 'rounded-lg border-purple-500/40 group-hover:border-emerald-400/80'
        }`}
      >
        <span className="text-xs font-bold text-purple-200 group-hover:text-emerald-200 whitespace-nowrap">
          {language === 'zh' ? 'Ghost骷髅坩埚 (点击熬汤)' : "Ghost's Skull Cauldron"}
        </span>
      </div>
    </div>
  );
};
