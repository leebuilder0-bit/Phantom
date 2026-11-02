import React, { useState, useEffect } from 'react';
import { CharacterId, GroundingSource, Language, MarketQuote } from '../types/tavern';
import { CHARACTER_DATA } from '../data/tavernData';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  ExternalLink,
  BarChart3,
  Globe,
  Palette
} from 'lucide-react';
import { sound } from '../utils/audio';

interface MarketAnalysisViewProps {
  language: Language;
  onGenerateMarketMeme: (params: {
    character: CharacterId;
    symbol: string;
    changePercent24h?: number;
    userPrompt?: string;
    replyText?: string;
  }) => void;
  onBackToTavern: () => void;
}

const ASSET_NAME_ZH: Record<string, string> = {
  BTC: '比特币',
  ETH: '以太坊',
  SOL: '索拉纳',
  DOGE: '狗狗币',
  PEPE: '佩佩币',
  BOME: '万梗魔典',
  AAPL: '苹果公司',
  NVDA: '英伟达',
  TSLA: '特斯拉',
  SPY: '标普500指数',
  QQQ: '纳指100指数',
  COIN: '合规加密股',
  MSTR: '微策投资'
};

export const MarketAnalysisView: React.FC<MarketAnalysisViewProps> = ({
  language,
  onGenerateMarketMeme,
  onBackToTavern
}) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'us_stock'>('crypto');
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  const [analyst, setAnalyst] = useState<CharacterId>('phantom');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [customQuery, setCustomQuery] = useState('');
  const [lastRequestOpts, setLastRequestOpts] = useState<{
    symbol?: string;
    category?: 'crypto' | 'us_stock';
    queryText?: string;
  }>({ symbol: 'BTC', category: 'crypto' });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    text: string;
    sources: GroundingSource[];
    symbol: string;
    character: CharacterId;
    error?: string;
  } | null>(null);

  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    try {
      const res = await fetch('/api/market/quotes');
      if (res.ok) {
        const raw = await res.text();
        const data = JSON.parse(raw);
        setQuotes(Array.isArray(data.quotes) ? data.quotes : []);
      }
    } catch {
      // ignore quote poll hiccup
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Clear previous language analysis output immediately if user switches language
  useEffect(() => {
    setAnalysisResult(null);
  }, [language]);

  const triggerAnalysis = async (opts: {
    symbol?: string;
    category?: 'crypto' | 'us_stock';
    queryText?: string;
  }) => {
    sound.playCoin();
    setIsAnalyzing(true);
    setLastRequestOpts(opts);
    if (opts.symbol) setSelectedSymbol(opts.symbol);

    const payload = {
      assetSymbol: opts.symbol || selectedSymbol,
      assetCategory: opts.category || activeTab,
      query: opts.queryText || '',
      analystCharacter: analyst,
      language
    };

    const attemptRequest = async () => {
      const res = await fetch('/api/market/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const rawText = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        throw new Error(`Invalid response (${res.status})`);
      }
      return { ok: res.ok, status: res.status, data: parsed };
    };

    try {
      let result: { ok: boolean; status: number; data: any };
      try {
        result = await attemptRequest();
      } catch {
        // Automatic 1x quick retry on transient gateway or cold-start network hiccup
        await new Promise((r) => setTimeout(r, 650));
        result = await attemptRequest();
      }

      if (result.ok && result.data?.analysis) {
        const rawSources: GroundingSource[] = Array.isArray(result.data.sources)
          ? result.data.sources
          : [];
        const filteredSources = rawSources.filter((s) =>
          language === 'en' ? !/[\u4e00-\u9fff]/.test(s.title) : true
        );
        setAnalysisResult({
          text: result.data.analysis,
          sources: filteredSources,
          symbol: opts.queryText
            ? language === 'zh'
              ? '专题深度研判'
              : 'Custom Query'
            : opts.symbol || selectedSymbol,
          character: analyst
        });
      } else {
        setAnalysisResult({
          text: '',
          sources: [],
          symbol: opts.symbol || selectedSymbol,
          character: analyst,
          error:
            result.data?.error ||
            (language === 'zh' ? '行情分析请求暂时繁忙，请点击重试' : 'Analysis busy, please retry')
        });
      }
    } catch {
      setAnalysisResult({
        text: '',
        sources: [],
        symbol: opts.symbol || selectedSymbol,
        character: analyst,
        error: language === 'zh' ? '网络连接波动，请点击下方按钮重试' : 'Connection hiccup, click below to retry'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim() || isAnalyzing) return;
    triggerAnalysis({ queryText: customQuery.trim() });
  };

  const filteredQuotes = quotes.filter((q) => q.category === activeTab);

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    if (p >= 0.001) return `$${p.toFixed(5)}`;
    return `$${p.toFixed(8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-amber-900/40 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>{language === 'zh' ? '加密货币与美股实时联网投研台' : 'Live Crypto & US Equities Grounded Oracle'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-cinzel font-bold text-amber-200">
            {language === 'zh' ? 'Phantom酒馆行情分析室' : 'Phantom Tavern Market Analysis Desk'}
          </h2>
          <p className="text-xs md:text-sm text-stone-300 mt-1 max-w-2xl">
            {language === 'zh'
              ? '实时拉取主流加密货币（BTC、ETH、SOL、DOGE、PEPE、BOME）与美股（AAPL、NVDA、TSLA、QQQ）盘面数据，由曾操控无数交易所的互联网初代幽灵 Phantom 或 Ghost 联网检索全球最新财经资讯深度解读涨跌真相。'
              : 'Live crypto & US stock market feeds paired with real-time web news analysis from Phantom and Ghost—the primordial internet specters behind global exchange orderbooks.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchQuotes}
            disabled={loadingQuotes}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loadingQuotes ? 'animate-spin' : ''}`} />
            <span>{language === 'zh' ? '刷新实时报价' : 'Refresh Quotes'}</span>
          </button>

          <button
            onClick={onBackToTavern}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs md:text-sm font-semibold rounded-xl border border-stone-700 transition-colors whitespace-nowrap shrink-0"
          >
            {language === 'zh' ? '返回酒馆' : 'Back to Tavern'}
          </button>
        </div>
      </div>

      {/* Main 12-Col Split: Live Market Quotes Table (Left 7) + AI Live Search Analysis Panel (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Segmented Crypto / US Stock Quotes */}
        <div className="lg:col-span-7 bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab('crypto');
                  setSelectedSymbol('BTC');
                }}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'crypto'
                    ? 'bg-amber-600 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {language === 'zh' ? '加密货币' : 'Crypto Assets'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('us_stock');
                  setSelectedSymbol('NVDA');
                }}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'us_stock'
                    ? 'bg-emerald-600 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {language === 'zh' ? '美股核心标的' : 'US Equities'}
              </button>
            </div>

            <span className="text-xs text-stone-400 font-mono">
              {language === 'zh' ? '点击任意标的即刻联网深度剖析' : 'Click any asset for live AI breakdown'}
            </span>
          </div>

          {loadingQuotes && filteredQuotes.length === 0 ? (
            <div className="space-y-2.5 py-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-14 bg-stone-950/70 border border-stone-800/70 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400 space-y-3">
              <p>
                {language === 'zh'
                  ? '实时报价源正在重连，你依然可以在右侧直接输入任意币种或美股代码进行实时联网分析！'
                  : 'Quote feed reconnecting—use the AI Oracle on the right to search live prices & news for any ticker!'}
              </p>
              <button
                onClick={fetchQuotes}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg font-medium whitespace-nowrap"
              >
                {language === 'zh' ? '重试加载报价' : 'Retry Quotes'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-800/80">
              {filteredQuotes.map((q) => {
                const isUp = q.changePercent24h >= 0;
                const spark = q.sparkline && q.sparkline.length > 1 ? q.sparkline : [q.low24h, q.price];
                const minS = Math.min(...spark);
                const maxS = Math.max(...spark);
                const rangeS = Math.max(0.0000001, maxS - minS);

                return (
                  <div
                    key={q.symbol}
                    onClick={() => triggerAnalysis({ symbol: q.symbol, category: q.category })}
                    className={`py-3 px-3 flex items-center justify-between gap-3 cursor-pointer rounded-xl transition-colors ${
                      selectedSymbol === q.symbol ? 'bg-stone-800/70' : 'hover:bg-stone-950/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-stone-100">{q.symbol}</span>
                        <span className="text-xs text-stone-400 truncate">
                          {language === 'zh' ? ASSET_NAME_ZH[q.symbol] || q.symbol : q.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono tabular-nums mt-0.5">
                        {language === 'zh'
                          ? `高: ${formatPrice(q.high24h)} · 低: ${formatPrice(q.low24h)}`
                          : `H: ${formatPrice(q.high24h)} · L: ${formatPrice(q.low24h)}`}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-end gap-0.5 h-8 w-24 shrink-0">
                      {spark.slice(-12).map((val, idx) => {
                        const hPct = 20 + ((val - minS) / rangeS) * 80;
                        return (
                          <div
                            key={idx}
                            className={`flex-1 rounded-t ${isUp ? 'bg-emerald-500/70' : 'bg-red-500/70'}`}
                            style={{ height: `${hPct}%` }}
                          />
                        );
                      })}
                    </div>

                    <div className="text-right font-mono tabular-nums shrink-0">
                      <div className="text-sm font-bold text-stone-100">{formatPrice(q.price)}</div>
                      <div
                        className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                          isUp ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>
                          {isUp ? '+' : ''}
                          {q.changePercent24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerAnalysis({ symbol: q.symbol, category: q.category });
                      }}
                      className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600 hover:text-stone-950 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                    >
                      {language === 'zh' ? '深度解盘' : 'Analyze'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Search-Grounded Dark Chef Analyst */}
        <div className="lg:col-span-5 bg-stone-900/90 border border-amber-800/50 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{language === 'zh' ? '实时联网深度解盘' : 'Live Search Market Oracle'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const activeTicker =
                    analysisResult && !analysisResult.error && analysisResult.symbol !== 'Custom Query' && analysisResult.symbol !== '专题深度研判'
                      ? analysisResult.symbol
                      : selectedSymbol;
                  const matchedQuote = quotes.find(
                    (q) => q.symbol.toUpperCase() === activeTicker.toUpperCase()
                  );
                  onGenerateMarketMeme({
                    character: analysisResult ? analysisResult.character : analyst,
                    symbol: matchedQuote?.symbol || selectedSymbol,
                    changePercent24h: matchedQuote?.changePercent24h,
                    userPrompt: lastRequestOpts.queryText || customQuery,
                    replyText: analysisResult?.text || ''
                  });
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{language === 'zh' ? '生成行情梗图' : 'Meme'}</span>
              </button>

              <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 p-1 rounded-lg">
                <button
                  onClick={() => setAnalyst('phantom')}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap shrink-0 ${
                    analyst === 'phantom' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {language === 'zh' ? '🍺 Phantom解盘' : '🍺 Phantom'}
                </button>
                <button
                  onClick={() => setAnalyst('ghost')}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap shrink-0 ${
                    analyst === 'ghost' ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {language === 'zh' ? '🍲 Ghost炼盘' : '🍲 Ghost'}
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder={
                language === 'zh'
                  ? '输入任意问题：如 为什么今天BTC暴跌？/ 分析英伟达财报…'
                  : 'Ask anything: Why did BTC drop today? / Analyze NVDA & QQQ...'
              }
              className="flex-1 min-w-0 bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-base sm:text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customQuery.trim() || isAnalyzing}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '联网分析' : 'Search'}</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5">
            {[
              {
                zh: '为什么今天 BTC / 币圈涨跌？',
                en: 'Why is BTC moving today?'
              },
              {
                zh: '美股纳指 QQQ 与英伟达 NVDA 最新动向',
                en: 'Latest US Tech QQQ & NVDA drivers'
              },
              {
                zh: 'SOL 与梗图板块（PEPE/BOME/DOGE）情绪',
                en: 'SOL & Meme sector sentiment today'
              }
            ].map((q, i) => (
              <button
                key={i}
                disabled={isAnalyzing}
                onClick={() => triggerAnalysis({ queryText: q[language] })}
                className="text-[11px] bg-stone-950 hover:bg-stone-800 text-amber-300/90 border border-stone-800 rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap"
              >
                {q[language]}
              </button>
            ))}
          </div>

          <div className="bg-stone-950/90 border border-stone-800 rounded-xl p-4 min-h-[280px] max-h-[460px] overflow-y-auto">
            {isAnalyzing ? (
              <div className="h-56 flex flex-col items-center justify-center text-center space-y-3 text-xs text-amber-300">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <p>
                  {analyst === 'phantom'
                    ? language === 'zh'
                      ? 'Phantom 正一边擦拭冰镇啤酒杯，一边调取全球交易所与华尔街实时快讯……'
                      : 'Phantom is wiping a frosty mug while scanning live global exchange & Wall Street feeds...'
                    : language === 'zh'
                      ? 'Ghost 正凝视紫绿骷髅坩埚，实时抓取全网最新盘面深度与宏观数据……'
                      : 'Ghost is peering into the skull cauldron, pulling live orderbook & macro market data...'}
                </p>
              </div>
            ) : analysisResult ? (
              analysisResult.error ? (
                <div className="text-xs text-red-300 bg-red-950/40 border border-red-800/50 rounded-lg p-4 space-y-3">
                  <p>{analysisResult.error}</p>
                  <button
                    type="button"
                    onClick={() => triggerAnalysis(lastRequestOpts)}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    {language === 'zh' ? '立即重试联网分析' : 'Retry Analysis Now'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={CHARACTER_DATA[analysisResult.character].avatar}
                        alt={CHARACTER_DATA[analysisResult.character].name[language]}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-amber-500/60 bg-stone-900"
                      />
                      <div>
                        <div className="text-xs font-bold text-amber-200">
                          {CHARACTER_DATA[analysisResult.character].name[language]} · {analysisResult.symbol}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          {language === 'zh' ? '实时联网行情与全球财经资讯核验' : 'Grounded via Live Tickers & Web News'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const matchedQuote = quotes.find(
                          (q) =>
                            q.symbol.toUpperCase() === analysisResult.symbol.toUpperCase() ||
                            q.symbol.toUpperCase() === selectedSymbol.toUpperCase()
                        );
                        onGenerateMarketMeme({
                          character: analysisResult.character,
                          symbol: matchedQuote?.symbol || selectedSymbol,
                          changePercent24h: matchedQuote?.changePercent24h,
                          userPrompt: lastRequestOpts.queryText || '',
                          replyText: analysisResult.text
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '按此分析生成梗图' : 'Generate Market Meme'}</span>
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-stone-200 whitespace-pre-line leading-relaxed">
                    {analysisResult.text}
                  </div>

                  {analysisResult.sources.length > 0 && (
                    <div className="pt-3 border-t border-stone-800 space-y-1.5">
                      <div className="text-[11px] text-stone-400 font-mono">
                        {language === 'zh' ? '实时参考新闻源:' : 'Live Web Sources:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] bg-stone-900 hover:bg-stone-800 text-emerald-300 border border-stone-700 rounded-md px-2 py-1 max-w-full truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[180px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center space-y-3 px-4">
                <p className="text-xs text-stone-400 leading-relaxed">
                  {language === 'zh'
                    ? '点击左侧任意加密货币（BTC、ETH、SOL、PEPE、BOME）或美股（AAPL、NVDA、TSLA、QQQ），或在上方输入问题，让互联网初代幽灵 Phantom 与 Ghost 为你联网解析今日实时行情！'
                    : 'Select any Crypto or US Stock on the left, or enter a question above to run a live web-grounded Phantom Tavern market analysis!'}
                </p>
                <button
                  onClick={() => triggerAnalysis({ symbol: 'BTC', category: 'crypto' })}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
                >
                  {language === 'zh' ? '立即联网分析 BTC 今日行情' : 'Run Live BTC Analysis Now'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
