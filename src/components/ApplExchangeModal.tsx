import React, { useState, useEffect } from 'react';
import { Language, MarketQuote } from '../types/tavern';
import { ROTTEN_APPLE_IMAGE_SRC } from '../data/tavernData';
import { Award, TrendingUp, ShieldCheck, Sparkles, Lock, RefreshCw } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ApplExchangeModalProps {
  language: Language;
  appleBalance: number;
  stockShares: number;
  onRedeemStock: (appleCount: number) => void;
  onBackToTavern: () => void;
}

export const ApplExchangeModal: React.FC<ApplExchangeModalProps> = ({
  language,
  appleBalance,
  stockShares,
  onRedeemStock,
  onBackToTavern
}) => {
  const [redeemCount, setRedeemCount] = useState(1);
  const [showCertificate, setShowCertificate] = useState(false);
  const [liveAapl, setLiveAapl] = useState<MarketQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  const loadLiveAaplQuote = async () => {
    setLoadingQuote(true);
    try {
      const res = await fetch('/api/market/quotes');
      if (res.ok) {
        const data = await res.json();
        const found = (data.quotes || []).find((q: MarketQuote) => q.symbol === 'AAPL');
        if (found) setLiveAapl(found);
      }
    } catch {
      // ignore
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    loadLiveAaplQuote();
  }, []);

  const handleRedeem = () => {
    if (appleBalance < redeemCount || redeemCount <= 0) return;
    sound.playAppleBite();
    onRedeemStock(redeemCount);
    setShowCertificate(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const sparkline = liveAapl?.sparkline && liveAapl.sparkline.length > 2
    ? liveAapl.sparkline
    : [224, 226, 225, 228, 227, 230, 232, 231, 234, 233, 236, 235];
  const minVal = Math.min(...sparkline);
  const maxVal = Math.max(...sparkline);
  const range = Math.max(0.01, maxVal - minVal);

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-stone-900 border border-emerald-600/40 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={ROTTEN_APPLE_IMAGE_SRC}
            alt="Rotten Apple APPL"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-lg shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                {language === 'zh'
                  ? '纳斯达克：$APPL · 代币化股权金库'
                  : 'NASDAQ: $APPL · Tokenized Equity Vault'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-cinzel font-bold text-amber-200">
              {language === 'zh'
                ? '咬了一口的烂苹果 ($APPL) 代币化股票登记处'
                : 'Bitten Rotten Apple ($APPL) Tokenized Stock Registry'}
            </h2>
            <p className="text-xs md:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              {language === 'zh'
                ? '铁律：烂苹果绝不可作为烹饪材料，也不可兑换为 $PHANTOM。它唯一的神圣用途，便是在此 1:1 铸造并登记为纳斯达克 $APPL 代币化股票凭证！'
                : 'Iron Decree: Rotten Apples are NEVER cooking ingredients and CANNOT be sold for $PHANTOM. Their sole purpose is 1:1 minting into certified $APPL Tokenized Equity Shares!'}
            </p>
          </div>
        </div>

        <button
          onClick={onBackToTavern}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs md:text-sm font-semibold rounded-xl border border-stone-700 transition-colors whitespace-nowrap shrink-0"
        >
          {language === 'zh' ? '返回Phantom酒馆' : 'Back to Tavern'}
        </button>
      </div>

      {/* Main Split Grid: Live NASDAQ AAPL Reference + Exclusive 1:1 Redemption Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Cols: Live NASDAQ AAPL Oracle Feed & Chart */}
        <div className="lg:col-span-7 bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
              <div>
                <div className="text-xs text-stone-400 font-mono flex items-center gap-2">
                  <span>
                    {language === 'zh' ? '锚定美股标的：AAPL' : 'ORACLE UNDERLYING: NASDAQ: AAPL'}
                  </span>
                  <button
                    onClick={loadLiveAaplQuote}
                    className="text-stone-400 hover:text-emerald-300 transition-colors"
                    title={language === 'zh' ? '刷新实时股价' : 'Refresh Live Price'}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingQuote ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl md:text-3xl font-mono font-bold text-stone-100 tabular-nums">
                    {liveAapl
                      ? `$${liveAapl.price.toFixed(2)}`
                      : loadingQuote
                        ? language === 'zh'
                          ? '加载中...'
                          : 'Loading...'
                        : '$233.40'}
                  </span>
                  {liveAapl && (
                    <span
                      className={`text-xs md:text-sm font-mono font-bold tabular-nums ${
                        liveAapl.changePercent24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {liveAapl.changePercent24h >= 0 ? '+' : ''}
                      {liveAapl.changePercent24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2">
                  <span className="text-[11px] text-stone-400 font-mono block">
                    {language === 'zh' ? '待兑换烂苹果' : 'Unredeemed Apples'}
                  </span>
                  <span className="text-lg font-mono font-bold text-amber-300 tabular-nums">
                    {appleBalance} 🍏
                  </span>
                </div>

                <div className="bg-stone-950 border border-emerald-700/50 rounded-xl px-3.5 py-2">
                  <span className="text-[11px] text-stone-400 font-mono block">
                    {language === 'zh' ? '已登记 $APPL 股份' : 'Registered $APPL'}
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-300 tabular-nums">
                    {language === 'zh' ? `${stockShares} 股` : `${stockShares} SH`}
                  </span>
                </div>
              </div>
            </div>

            {/* 14-Day Real Underlying Price Sparkline Bars */}
            <div className="py-5">
              <div className="h-40 w-full flex items-end justify-between gap-1.5 px-3 pt-6 pb-2 bg-stone-950/70 rounded-xl border border-stone-800">
                {sparkline.map((val, idx) => {
                  const pctHeight = 25 + ((val - minVal) / range) * 70;
                  return (
                    <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-t transition-opacity group-hover:opacity-90"
                        style={{ height: `${pctHeight}%` }}
                      />
                      <span className="absolute -top-6 text-[10px] bg-stone-900 border border-stone-700 text-stone-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono tabular-nums pointer-events-none whitespace-nowrap z-10">
                        ${val.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px] text-stone-400 font-mono mt-2 px-1">
                <span>
                  {language === 'zh' ? '近14个交易日 AAPL 走势映射' : '14-Session NASDAQ AAPL Price Curve'}
                </span>
                <span className="tabular-nums">
                  {liveAapl
                    ? language === 'zh'
                      ? `持仓映射估值: $${(stockShares * liveAapl.price).toFixed(2)}`
                      : `Mapped Equity Value: $${(stockShares * liveAapl.price).toFixed(2)} USD`
                    : language === 'zh'
                      ? '1 🍏 = 1 股 $APPL'
                      : '1 🍏 = 1 $APPL Share'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {language === 'zh'
                  ? '获取途径：与 Phantom / Ghost 聊天、随机酿啤酒熬奇汤、或与酒馆里的梗图酒客碰杯奇遇掉落。'
                  : 'How to earn: Chat with Phantom/Ghost, brew beers, cook cauldron soups, or clink mugs with meme patrons!'}
              </span>
            </div>
            {stockShares > 0 && (
              <button
                onClick={() => setShowCertificate(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold whitespace-nowrap ml-3 underline"
              >
                {language === 'zh' ? '查看股东证书' : 'View Deed'}
              </button>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Sole Purpose 1:1 Tokenized Stock Minting */}
        <div className="lg:col-span-5 bg-stone-900/90 border border-emerald-600/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <Award className="w-5 h-5" />
              <span>
                {language === 'zh' ? '1:1 铸造 $APPL 代币化股票' : '1:1 Mint $APPL Tokenized Stock'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {language === 'zh'
                ? '每一颗被咬了一口的烂苹果，都是互联网车库年代遗落的远古股权密钥。提交烂苹果即可通过 Phantom 与 Ghost 掌控的清算金库永久铸造为链上 $APPL 代币化股票。'
                : 'Every bitten Rotten Apple is an early-internet Cupertino equity cipher bridged through Phantom & Ghost’s exchange vaults into certified $APPL Tokenized Stock Shares.'}
            </p>

            <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>{language === 'zh' ? '固定兑换比例' : 'Exchange Ratio'}</span>
                <span className="text-emerald-300 font-bold">
                  {language === 'zh' ? '1 🍏 = 1 股 $APPL' : '1 🍏 = 1 $APPL Share'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>{language === 'zh' ? '资产属性' : 'Asset Class'}</span>
                <span className="text-amber-200 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>
                    {language === 'zh' ? '专属代币化股票（不可作食材·不可换币）' : 'Exclusive Tokenized Equity'}
                  </span>
                </span>
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
                <span className="text-xs text-stone-300 font-medium">
                  {language === 'zh' ? '兑换数量:' : 'Redeem Quantity:'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRedeemCount(Math.max(1, redeemCount - 1))}
                    className="w-8 h-8 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-sm font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-bold text-amber-200 w-10 text-center tabular-nums">
                    {redeemCount}
                  </span>
                  <button
                    onClick={() => setRedeemCount(Math.min(Math.max(1, appleBalance), redeemCount + 1))}
                    className="w-8 h-8 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-sm font-bold transition-colors"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setRedeemCount(Math.max(1, appleBalance))}
                    className="px-2 py-1 text-xs bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 rounded font-mono"
                  >
                    {language === 'zh' ? '全部' : 'MAX'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-2.5">
            <button
              onClick={handleRedeem}
              disabled={appleBalance < redeemCount || appleBalance === 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-stone-950 font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {appleBalance >= redeemCount && appleBalance > 0
                  ? language === 'zh'
                    ? `立即兑换 ${redeemCount} 股 $APPL 代币化股票`
                    : `Redeem ${redeemCount} $APPL Tokenized Shares`
                  : language === 'zh'
                    ? '暂无烂苹果 · 去酒馆互动偶遇掉落'
                    : 'No Rotten Apples · Interact in Tavern to Find'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Stock Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border-2 border-amber-500 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              ✕
            </button>

            <div className="text-center space-y-3">
              <div className="text-3xl">🍏📜</div>
              <h3 className="text-lg md:text-xl font-cinzel font-black text-amber-200 tracking-wide">
                {language === 'zh'
                  ? '$APPL 纳斯达克代币化股票持有人凭证'
                  : 'CERTIFICATE OF $APPL TOKENIZED EQUITY'}
              </h3>
              <div className="w-24 h-px bg-amber-500/60 mx-auto" />
              <p className="text-xs text-stone-300 leading-relaxed">
                {language === 'zh'
                  ? '兹证明持有人已呈交 Phantom酒馆奇遇掉落之咬口烂苹果，正式登记为链上 $APPL 代币化股票合法股东。'
                  : 'This certifies that the bearer has redeemed genuine Bitten Rotten Apples into registered $APPL Tokenized Equity Shares.'}
              </p>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 my-4 font-mono text-left text-xs space-y-2 tabular-nums">
                <div className="flex justify-between">
                  <span className="text-stone-400">
                    {language === 'zh' ? '股票代码:' : 'ASSET TICKER:'}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {language === 'zh' ? '$APPL（代币化股权）' : 'NASDAQ: $APPL (Tokenized)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">
                    {language === 'zh' ? '登记股数:' : 'REGISTERED SHARES:'}
                  </span>
                  <span className="text-amber-200 font-bold">
                    {language === 'zh' ? `${stockShares} 股` : `${stockShares} Shares`}
                  </span>
                </div>
                {liveAapl && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">
                      {language === 'zh' ? '参考公允估值:' : 'ORACLE REFERENCE VALUE:'}
                    </span>
                    <span className="text-emerald-300 font-bold">
                      ${(stockShares * liveAapl.price).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-400">
                    {language === 'zh' ? '签发登记机构:' : 'REGISTRAR:'}
                  </span>
                  <span className="text-purple-300">
                    {language === 'zh' ? 'Phantom与Ghost幽灵金库' : 'Phantom & Ghost Spectral Vault'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCertificate(false)}
                className="w-full mt-2 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition-colors"
              >
                {language === 'zh' ? '收好股权凭证' : 'Close Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
