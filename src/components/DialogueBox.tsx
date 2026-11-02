import React, { useState, useRef, useEffect } from 'react';
import { CharacterId, ChatMessage, Language } from '../types/tavern';
import { CHARACTER_DATA } from '../data/tavernData';
import { Send, Coffee, Flame, RefreshCw, Globe, ExternalLink, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface DialogueBoxProps {
  language: Language;
  currentCharacter: CharacterId;
  onSelectCharacter: (char: CharacterId) => void;
  messages: ChatMessage[];
  onSendMessage: (
    text: string,
    character: CharacterId,
    options?: { forcePresetLore?: boolean }
  ) => Promise<boolean>;
  onGenerateMemeFromChat: (params: {
    character: CharacterId;
    userPrompt?: string;
    replyText: string;
  }) => void;
  onOpenBrewing: () => void;
  onOpenKitchen: () => void;
  isLoading?: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  language,
  currentCharacter,
  onSelectCharacter,
  messages,
  onSendMessage,
  onGenerateMemeFromChat,
  onOpenBrewing,
  onOpenKitchen,
  isLoading = false
}) => {
  const [inputText, setInputText] = useState('');
  const [showAppleAlert, setShowAppleAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentCharacter]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const query = inputText.trim();
    setInputText('');
    sound.playCoin();

    const appleDropped = await onSendMessage(query, currentCharacter);
    if (appleDropped) {
      triggerAppleCelebration();
    }
  };

  const triggerAppleCelebration = () => {
    sound.playAppleBite();
    setShowAppleAlert(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#ef4444', '#eab308', '#a855f7']
    });
    setTimeout(() => {
      setShowAppleAlert(false);
    }, 4500);
  };

  // Pure Phantom & Ghost Lore Stories ONLY (Instant 0ms reply, 0 API quota consumed!)
  const presetTopics =
    currentCharacter === 'phantom'
      ? [
          {
            en: 'How were Phantom & Ghost born at the dawn of the internet?',
            zh: '你们真是诞生于互联网之初、能变换成任何样子的幽灵吗？'
          },
          {
            en: 'Which cryptocurrencies & exchanges have your shadows behind them?',
            zh: '讲讲你们在加密货币背后留下的影子与操控交易所的秘闻！'
          },
          {
            en: 'Why are two exchange puppeteers working as bartender and chef?',
            zh: '操控各大交易所的幽灵，为什么会来酒馆当调酒师和主厨？'
          },
          {
            en: 'What is the sole purpose of the bitten Rotten Apple APPL?',
            zh: '被咬了一口的烂苹果 $APPL 有什么唯一用途？'
          }
        ]
      : [
          {
            en: 'How do Phantom & Ghost manipulate exchanges from the shadows?',
            zh: '你们是怎么在幕后操控那么多交易所与加密货币盘口的？'
          },
          {
            en: 'Tell me about your shapeshifting forms since the dawn of the internet!',
            zh: '讲讲你们从互联网诞生之初千变万化的幽灵身世！'
          },
          {
            en: 'Why do you enjoy being a quiet head chef tending this cauldron?',
            zh: '为什么你有时候只想在 Phantom酒馆安安静静当个熬汤主厨？'
          },
          {
            en: 'Why must Rotten Apples never be cooked in your cauldron?',
            zh: '为什么咬口烂苹果绝不能丢进你的大坩埚里煮汤？'
          }
        ];

  return (
    <div className="bg-stone-900/95 border border-amber-900/40 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[470px] sm:h-[540px]">
      {/* Top Header: Character Switcher */}
      <div className="bg-stone-950 px-4 py-3 border-b border-amber-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectCharacter('phantom')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
              currentCharacter === 'phantom'
                ? 'bg-amber-600 text-stone-950 font-bold'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <span>🍺 {CHARACTER_DATA.phantom.name[language]}</span>
            <span className="text-[10px] opacity-80 hidden sm:inline">
              {language === 'zh' ? '(调酒师)' : '(Bartender)'}
            </span>
          </button>

          <button
            onClick={() => onSelectCharacter('ghost')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
              currentCharacter === 'ghost'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <span>🍲 {CHARACTER_DATA.ghost.name[language]}</span>
            <span className="text-[10px] opacity-80 hidden sm:inline">
              {language === 'zh' ? '(主厨)' : '(Head Chef)'}
            </span>
          </button>

          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono pl-2">
            <Globe className="w-3 h-3" />
            <span>{language === 'zh' ? '幽灵秘闻秒回 · 自由提问可联网' : 'Instant Lore + Live Web Chat'}</span>
          </span>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          {currentCharacter === 'phantom' ? (
            <button
              onClick={onOpenBrewing}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '无限酿啤酒' : 'Unlimited Brew'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenKitchen}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '无限熬奇汤' : 'Unlimited Stew'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Rare APPL Drop Notification Banner */}
      {showAppleAlert && (
        <div className="bg-emerald-950 border-b border-emerald-500/50 px-4 py-2 text-xs flex items-center justify-between text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍏</span>
            <span className="font-bold">
              {language === 'zh'
                ? '奇遇掉落！获得被咬了一口的烂苹果 ($APPL) 1 颗！可前往股票柜台 1:1 兑换代币化股票！'
                : 'RARE DROP! Obtained Rotten Apple (APPL) x1! Redeem 1:1 at the $APPL Stock Desk!'}
            </span>
          </div>
          <button onClick={() => setShowAppleAlert(false)} className="text-stone-400 hover:text-white px-2">
            ✕
          </button>
        </div>
      )}

      {/* Dialogue Message History Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-950/60">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'player';
          const isSys = msg.sender === 'system';
          const msgChar = msg.character ? CHARACTER_DATA[msg.character] : null;

          if (isSys) {
            return (
              <div
                key={msg.id}
                className="bg-amber-950/30 border border-amber-900/40 rounded-lg p-3 text-xs text-amber-300/90 leading-relaxed font-mono"
              >
                {msg.text[language]}
              </div>
            );
          }

          // Find closest preceding player prompt for contextual meme generation
          let prevPlayerPrompt = '';
          if (!isUser) {
            for (let j = idx - 1; j >= 0; j--) {
              if (messages[j].sender === 'player') {
                prevPlayerPrompt = messages[j].text[language] || '';
                break;
              }
            }
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isUser && msgChar && (
                <img
                  src={msgChar.avatar}
                  alt={msgChar.name[language]}
                  className="w-10 h-10 rounded-full border border-amber-600/60 object-cover shrink-0 bg-stone-950"
                  referrerPolicy="no-referrer"
                />
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-600 text-stone-950 font-medium rounded-tr-none'
                    : msg.character === 'ghost'
                      ? 'bg-purple-950/75 border border-purple-800/60 text-purple-100 rounded-tl-none'
                      : 'bg-stone-800/90 border border-stone-700/60 text-stone-100 rounded-tl-none'
                }`}
              >
                {!isUser && msgChar && (
                  <div className="text-[11px] font-bold text-amber-400 mb-1 flex items-center justify-between gap-2 font-cinzel">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{msgChar.name[language]}</span>
                      <span className="text-stone-400 text-[10px] font-normal">
                        · {msgChar.title[language]}
                      </span>
                      {msg.isLiveAI && (
                        <span className="text-[10px] text-emerald-400 font-mono font-normal">
                          · {language === 'zh' ? '实时联网' : 'Live Web'}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <p className="whitespace-pre-line">{msg.text[language]}</p>

                {/* Clickable Grounding Web Sources if returned by Google Search */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-stone-700/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {language === 'zh' ? '新闻来源:' : 'Sources:'}
                    </span>
                    {msg.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] bg-stone-950/70 hover:bg-stone-950 text-emerald-300 border border-stone-700 rounded px-1.5 py-0.5 max-w-[180px] truncate"
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                )}

                {msg.hasAppleDrop && (
                  <div className="mt-2 pt-2 border-t border-emerald-500/30 flex items-center gap-1.5 text-emerald-300 text-xs font-semibold">
                    <span>🍏</span>
                    <span>
                      {language === 'zh'
                        ? '奇遇获得: 烂苹果 ($APPL) 1 颗（专用于兑换代币化股票）'
                        : 'Rare Drop: Rotten Apple (APPL) x1 (For Tokenized Stock)'}
                    </span>
                  </div>
                )}

                {/* Contextual Meme Generator Action on Coco / Dark Replies */}
                {!isUser && msg.character && (
                  <div className="mt-2.5 pt-2 border-t border-stone-700/50 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        onGenerateMemeFromChat({
                          character: msg.character!,
                          userPrompt: prevPlayerPrompt,
                          replyText: msg.text[language]
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-950/80 hover:bg-amber-600 text-amber-300 hover:text-stone-950 border border-amber-500/40 transition-colors whitespace-nowrap"
                    >
                      <Palette className="w-3 h-3" />
                      <span>{language === 'zh' ? '按此对话生成梗图' : 'Generate Meme'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-400/90 italic pl-12">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>
              {currentCharacter === 'phantom'
                ? language === 'zh'
                  ? 'Phantom 正一边摇冰镇啤酒一边检索全球交易所与实时资讯……'
                  : 'Phantom is shaking a cold pint and scanning live exchange & web intel...'
                : language === 'zh'
                  ? 'Ghost 正搅动骷髅大坩埚，感应链上暗影与实时全网讯息……'
                  : 'Ghost is stirring the skull cauldron and reading live web signals...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Instant Zero-Quota Lore Quick Ask */}
      <div className="bg-stone-950/80 border-t border-stone-800/80 px-3 py-2 overflow-x-auto whitespace-nowrap flex items-center gap-2">
        <span className="text-[11px] text-amber-400/90 font-mono shrink-0">
          {language === 'zh' ? '快捷秘闻:' : 'Quick Lore:'}
        </span>
        {presetTopics.map((topic, i) => (
          <button
            key={i}
            type="button"
            onClick={async () => {
              sound.playCoin();
              const appleDropped = await onSendMessage(topic[language], currentCharacter, {
                forcePresetLore: true
              });
              if (appleDropped) triggerAppleCelebration();
            }}
            className="text-xs bg-stone-900 hover:bg-stone-800 text-amber-300/90 hover:text-amber-200 border border-amber-900/40 rounded-lg px-2.5 py-1 transition-colors shrink-0"
          >
            {topic[language]}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="bg-stone-950 p-3 border-t border-stone-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentCharacter === 'phantom'
              ? language === 'zh'
                ? '和 Phantom 聊聊初代互联网幽灵身世、交易所幕后操盘或今日实时行情……'
                : 'Chat with Phantom about internet-ghost lore, exchange secrets, or live markets...'
              : language === 'zh'
                ? '和 Ghost 聊聊加密货币暗影、骷髅坩埚浓汤或今日实时行情……'
                : 'Chat with Ghost about crypto shadows, cauldron stew, or live markets...'
          }
          className="flex-1 min-w-0 bg-stone-900 border border-stone-700 focus:border-amber-500 rounded-lg px-3.5 py-2 text-base sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <span>{language === 'zh' ? '发送' : 'Send'}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
