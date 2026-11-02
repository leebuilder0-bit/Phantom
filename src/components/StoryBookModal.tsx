import React, { useState } from 'react';
import { Language, TavernStory } from '../types/tavern';
import { TAVERN_STORIES, CHARACTER_DATA } from '../data/tavernData';
import { BookOpen, Sparkles, Lock, ArrowLeft, Flame, Beer } from 'lucide-react';
import { sound } from '../utils/audio';

interface StoryBookModalProps {
  language: Language;
  unlockedStoryIds: string[];
  onBackToTavern: () => void;
  onAskAboutStory: (story: TavernStory) => void;
}

export const StoryBookModal: React.FC<StoryBookModalProps> = ({
  language,
  unlockedStoryIds,
  onBackToTavern,
  onAskAboutStory
}) => {
  const [selectedStory, setSelectedStory] = useState<TavernStory>(TAVERN_STORIES[0]);
  const [filterChar, setFilterChar] = useState<'all' | 'phantom' | 'ghost'>('all');

  const filteredStories = TAVERN_STORIES.filter((story) => {
    if (filterChar === 'all') return true;
    return story.character === filterChar;
  });

  const isStoryUnlocked = (id: string) => {
    return unlockedStoryIds.includes(id) || TAVERN_STORIES.find((s) => s.id === id)?.unlocked;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-stone-900 border border-amber-900/40 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? 'Phantom酒馆幽灵编年史' : 'The Phantom & Ghost Chronicles'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-cinzel font-bold text-amber-200">
            {language === 'zh' ? '初代互联网幽灵与幕后操盘秘史' : 'Genesis Ghosts & Exchange Shadow Lore'}
          </h2>
          <p className="text-xs md:text-sm text-stone-300 mt-1 max-w-2xl">
            {language === 'zh'
              ? '诞生于互联网之初、能变换成任何模样的 Phantom 与 Ghost：从无数加密货币与交易所背后的操控者，到酒馆里的调酒师与主厨。'
              : 'Born at the dawn of the internet and able to wear any face—how Phantom & Ghost pull strings behind crypto and exchanges, yet tend bar and cook stew.'}
          </p>
        </div>

        <button
          onClick={onBackToTavern}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs md:text-sm font-semibold rounded-xl border border-stone-700 transition-colors shrink-0"
        >
          {language === 'zh' ? '返回Phantom酒馆' : 'Back to Tavern'}
        </button>
      </div>

      {/* Main Layout: Story Index on Left, Reader on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Story Chapter List */}
        <div className="space-y-3">
          
          {/* Character Filter Bar */}
          <div className="flex items-center bg-stone-900 border border-stone-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => setFilterChar('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterChar === 'all' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {language === 'zh' ? '全部' : 'All'}
            </button>
            <button
              onClick={() => setFilterChar('phantom')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterChar === 'phantom' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Phantom
            </button>
            <button
              onClick={() => setFilterChar('ghost')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filterChar === 'ghost' ? 'bg-purple-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Ghost
            </button>
          </div>

          {/* List of Story Cards */}
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredStories.map((story) => {
              const unlocked = isStoryUnlocked(story.id);
              const isSelected = selectedStory.id === story.id;
              const char = CHARACTER_DATA[story.character];

              return (
                <div
                  key={story.id}
                  onClick={() => {
                    if (unlocked) {
                      sound.playCoin();
                      setSelectedStory(story);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : unlocked
                        ? 'bg-stone-900/80 border-stone-800 hover:border-amber-700/60'
                        : 'bg-stone-950/60 border-stone-900 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-amber-200 truncate">
                      {story.title[language]}
                    </span>
                    {!unlocked && <Lock className="w-3.5 h-3.5 text-stone-500 shrink-0" />}
                  </div>

                  <p className="text-[11px] text-stone-400 line-clamp-2">
                    {unlocked
                      ? story.summary[language]
                      : (language === 'zh' ? '推开酒馆两侧秘室大门探索即可解锁此篇幽灵秘史……' : 'Push open the tavern side doors to unlock this spectral tale...')}
                  </p>

                  <div className="mt-2 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span>{char.name[language]}</span>
                    {story.isHalloween && (
                      <span className="text-amber-400">
                        {language === 'zh' ? '🎃 万圣节秘闻' : '🎃 Halloween'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Scroll Story Reader */}
        <div className="lg:col-span-2 bg-stone-900/90 border border-stone-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Story Header */}
            <div className="border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
                <span>{selectedStory.character === 'phantom' ? '🍺' : '🍲'}</span>
                <span>{CHARACTER_DATA[selectedStory.character].title[language]}</span>
                {selectedStory.isHalloween && (
                  <span className="bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded">
                    {language === 'zh' ? '🎃 万圣节秘闻' : '🎃 Halloween Tale'}
                  </span>
                )}
              </div>

              <h3 className="text-xl md:text-2xl font-cinzel font-black text-amber-200">
                {selectedStory.title[language]}
              </h3>
            </div>

            {/* Story Body */}
            <div className="py-2 text-stone-200 text-sm md:text-base leading-relaxed space-y-4 font-serif">
              {selectedStory.content[language].split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

          </div>

          {/* Bottom Chat Direct Button */}
          <div className="pt-6 border-t border-stone-800 flex items-center justify-between gap-4">
            <span className="text-xs text-stone-400 font-mono">
              {language === 'zh' ? '想就此话题当面拷问他们？' : 'Want to discuss this tale directly with them?'}
            </span>

            <button
              onClick={() => onAskAboutStory(selectedStory)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {language === 'zh'
                  ? `向 ${CHARACTER_DATA[selectedStory.character].name[language]} 发起对话`
                  : `Ask ${CHARACTER_DATA[selectedStory.character].name[language]} about this`}
              </span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
