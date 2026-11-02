import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Per-IP sliding window rate limiter (protects owner's API quota when published)
const ipRequestLog = new Map<string, number[]>();
function checkRateLimit(ip: string, maxPerMinute = 25): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const recent = (ipRequestLog.get(ip) || []).filter((t) => t > windowStart);
  if (recent.length >= maxPerMinute) {
    ipRequestLog.set(ip, recent);
    return false;
  }
  recent.push(now);
  ipRequestLog.set(ip, recent);
  return true;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallbackValue?: T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (fallbackValue !== undefined) {
        resolve(fallbackValue);
      } else {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function extractGroundingSources(response: any): Array<{ title: string; uri: string }> {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  const sources: Array<{ title: string; uri: string }> = [];
  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || 'Web Source';
    if (uri && !seen.has(uri)) {
      seen.add(uri);
      sources.push({ title, uri });
      if (sources.length >= 4) break;
    }
  }
  return sources;
}

// =========================================================================
// LIVE CRYPTO & US STOCK MARKET QUOTES CACHE (PRE-WARMED + NON-BLOCKING)
// =========================================================================
interface MarketQuoteItem {
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

let quotesCache: { data: MarketQuoteItem[]; fetchedAt: number } | null = null;
let quotesInFlight: Promise<MarketQuoteItem[]> | null = null;

async function fetchCryptoQuotes(): Promise<MarketQuoteItem[]> {
  const pairs = [
    { symbol: 'BTC', binance: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETH', binance: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'SOL', binance: 'SOLUSDT', name: 'Solana' },
    { symbol: 'DOGE', binance: 'DOGEUSDT', name: 'Dogecoin' },
    { symbol: 'PEPE', binance: 'PEPEUSDT', name: 'Pepe' },
    { symbol: 'BOME', binance: 'BOMEUSDT', name: 'BOOK OF MEME' },
  ];

  try {
    const symbolsParam = encodeURIComponent(JSON.stringify(pairs.map((p) => p.binance)));
    const tickerRes = await fetch(
      `https://data-api.binance.vision/api/v3/ticker/24hr?symbols=${symbolsParam}`,
      { signal: AbortSignal.timeout(4000) }
    );

    if (!tickerRes.ok) throw new Error(`Binance vision status ${tickerRes.status}`);
    const tickers = (await tickerRes.json()) as any[];

    const results = await Promise.all(
      pairs.map(async (pair) => {
        const t = tickers.find((x) => x.symbol === pair.binance);
        const lastPrice = Number(t?.lastPrice || 0);
        const changePct = Number(t?.priceChangePercent || 0);
        const high = Number(t?.highPrice || lastPrice);
        const low = Number(t?.lowPrice || lastPrice);

        let sparkline: number[] = [];
        try {
          const klineRes = await fetch(
            `https://data-api.binance.vision/api/v3/klines?symbol=${pair.binance}&interval=1d&limit=14`,
            { signal: AbortSignal.timeout(2500) }
          );
          if (klineRes.ok) {
            const klines = (await klineRes.json()) as any[];
            sparkline = klines.map((k) => Number(k[4])).filter((n) => n > 0);
          }
        } catch {
          // ignore sparkline error
        }

        if (sparkline.length < 2 && lastPrice > 0) {
          sparkline = [lastPrice * (1 - changePct / 100), lastPrice];
        }

        return {
          symbol: pair.symbol,
          name: pair.name,
          category: 'crypto' as const,
          price: lastPrice,
          changePercent24h: changePct,
          high24h: high,
          low24h: low,
          sparkline,
          updatedAt: Date.now(),
        };
      })
    );

    return results.filter((r) => r.price > 0);
  } catch (err) {
    console.warn('Primary crypto feed warning, trying CoinGecko fallback:', err);
    try {
      const cgRes = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,dogecoin,pepe,book-of-meme&sparkline=true',
        {
          headers: { Accept: 'application/json', 'User-Agent': 'PhantomTavern/1.0' },
          signal: AbortSignal.timeout(4000),
        }
      );
      if (cgRes.ok) {
        const items = (await cgRes.json()) as any[];
        return items.map((c) => ({
          symbol: String(c.symbol || '').toUpperCase(),
          name: c.name,
          category: 'crypto' as const,
          price: Number(c.current_price || 0),
          changePercent24h: Number(c.price_change_percentage_24h || 0),
          high24h: Number(c.high_24h || c.current_price || 0),
          low24h: Number(c.low_24h || c.current_price || 0),
          sparkline: Array.isArray(c.sparkline_in_7d?.price)
            ? c.sparkline_in_7d.price.filter((_: number, idx: number) => idx % 12 === 0)
            : [],
          updatedAt: Date.now(),
        }));
      }
    } catch (e2) {
      console.warn('CoinGecko fallback failed:', e2);
    }
    return [];
  }
}

async function fetchUSStockQuotes(): Promise<MarketQuoteItem[]> {
  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'SPY', name: 'S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
    { symbol: 'COIN', name: 'Coinbase Global' },
    { symbol: 'MSTR', name: 'Strategy (MSTR)' },
  ];

  const results = await Promise.all(
    stocks.map(async (st): Promise<MarketQuoteItem | null> => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${st.symbol}?interval=1d&range=1mo`;
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(3500),
        });
        if (!res.ok) return null;
        const json = (await res.json()) as any;
        const result = json?.chart?.result?.[0];
        if (!result) return null;

        const meta = result.meta || {};
        const closes: number[] = (result.indicators?.quote?.[0]?.close || []).filter(
          (v: any) => typeof v === 'number' && !Number.isNaN(v)
        );

        const price = Number(meta.regularMarketPrice || closes[closes.length - 1] || 0);
        const prevClose = Number(
          meta.chartPreviousClose ||
            meta.previousClose ||
            (closes.length >= 2 ? closes[closes.length - 2] : price)
        );
        const prevDayClose = closes.length >= 2 ? closes[closes.length - 2] : prevClose;
        const refClose = meta.previousClose ? Number(meta.previousClose) : prevDayClose;
        const changePct = refClose > 0 ? ((price - refClose) / refClose) * 100 : 0;

        return {
          symbol: st.symbol,
          name: st.name,
          category: 'us_stock' as const,
          price,
          changePercent24h: Number(changePct.toFixed(2)),
          high24h: Number(meta.regularMarketDayHigh || Math.max(...closes.slice(-3), price)),
          low24h: Number(meta.regularMarketDayLow || Math.min(...closes.slice(-3), price)),
          sparkline: closes.slice(-14),
          updatedAt: Date.now(),
        };
      } catch {
        return null;
      }
    })
  );

  return results.filter((x): x is MarketQuoteItem => x !== null && x.price > 0);
}

async function refreshQuotesNow(): Promise<MarketQuoteItem[]> {
  if (quotesInFlight) return quotesInFlight;
  quotesInFlight = (async () => {
    try {
      const [crypto, stocks] = await Promise.all([fetchCryptoQuotes(), fetchUSStockQuotes()]);
      const combined = [...crypto, ...stocks];
      if (combined.length > 0) {
        quotesCache = { data: combined, fetchedAt: Date.now() };
      }
      return combined.length > 0 ? combined : quotesCache?.data || [];
    } finally {
      quotesInFlight = null;
    }
  })();
  return quotesInFlight;
}

async function getCombinedMarketQuotes(maxWaitMs = 3000): Promise<MarketQuoteItem[]> {
  if (quotesCache && quotesCache.data.length > 0) {
    // If cache is older than 45s, refresh asynchronously without blocking the caller!
    if (Date.now() - quotesCache.fetchedAt >= 45_000) {
      void refreshQuotesNow();
    }
    return quotesCache.data;
  }
  return withTimeout(refreshQuotesNow(), maxWaitMs, quotesCache?.data || []);
}

// =========================================================================
// LIVE WEB NEWS RETRIEVAL + FAST GEMINI MODEL CASCADE
// =========================================================================
function decodeXmlEntities(str: string): string {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function buildExpandedSearchQueries(rawQuery: string): {
  enQuery: string;
  zhQuery: string;
  tickerHint: string;
} {
  const q = rawQuery.trim();
  const lower = q.toLowerCase();

  const enKeywords: string[] = [];
  const zhKeywords: string[] = [];
  let tickerHint = '';

  if (/btc|比特币|大饼|加密|币圈|crypto|暴跌|暴涨|涨跌|跳水|爆仓/.test(lower)) {
    enKeywords.push('Bitcoin BTC crypto market news');
    zhKeywords.push('比特币 BTC 加密货币 最新行情新闻');
    tickerHint = tickerHint || 'BTC-USD';
  }
  if (/eth|以太坊|二饼/.test(lower)) {
    enKeywords.push('Ethereum ETH crypto');
    zhKeywords.push('以太坊 ETH 最新行情新闻');
    tickerHint = tickerHint || 'ETH-USD';
  }
  if (/sol|索拉纳/.test(lower)) {
    enKeywords.push('Solana SOL crypto');
    zhKeywords.push('索拉纳 SOL 加密货币行情');
    tickerHint = tickerHint || 'SOL-USD';
  }
  if (/doge|狗狗币|柴犬/.test(lower)) {
    enKeywords.push('Dogecoin DOGE');
    zhKeywords.push('狗狗币 DOGE 最新动态');
    tickerHint = tickerHint || 'DOGE-USD';
  }
  if (/pepe|佩佩|meme|梗图/.test(lower)) {
    enKeywords.push('Pepe meme coin crypto');
    zhKeywords.push('佩佩币 PEPE 加密市场');
  }
  if (/bome|万梗/.test(lower)) {
    enKeywords.push('BOOK OF MEME BOME crypto');
    zhKeywords.push('BOME 加密货币行情');
  }
  if (/nvda|nvidia|英伟达/.test(lower)) {
    enKeywords.push('NVIDIA NVDA stock');
    zhKeywords.push('美股 英伟达 NVDA 最新财经新闻');
    tickerHint = tickerHint || 'NVDA';
  }
  if (/aapl|appl|apple|苹果/.test(lower)) {
    enKeywords.push('Apple AAPL stock');
    zhKeywords.push('美股 苹果 AAPL 最新财经新闻');
    tickerHint = tickerHint || 'AAPL';
  }
  if (/tsla|tesla|特斯拉|马斯克|musk/.test(lower)) {
    enKeywords.push('Tesla TSLA stock');
    zhKeywords.push('美股 特斯拉 TSLA 最新财经新闻');
    tickerHint = tickerHint || 'TSLA';
  }
  if (/美股|纳指|纳斯达克|标普|道指|华尔街|spy|qqq|stock|wall street|mstr|coin/.test(lower)) {
    enKeywords.push('US stock market S&P 500 Nasdaq today');
    zhKeywords.push('美股 纳斯达克 标普500 今日行情');
    tickerHint = tickerHint || 'QQQ';
  }
  if (/美联储|降息|加息|鲍威尔|非农|通胀|cpi|fed|tariff|关税|宏观/.test(lower)) {
    enKeywords.push('Federal Reserve economy market news today');
    zhKeywords.push('美联储 宏观经济 财经新闻');
  }

  const strippedEnQ = q.replace(/[\u4e00-\u9fff]/g, '').trim();
  const enQuery =
    enKeywords.length > 0
      ? enKeywords.slice(0, 2).join(' ')
      : strippedEnQ || 'Bitcoin crypto US stock market today';
  const zhQuery =
    zhKeywords.length > 0
      ? zhKeywords.slice(0, 2).join(' ')
      : /[\u4e00-\u9fff]/.test(q)
        ? q
        : `${q} 最新财经行情`;

  return { enQuery, zhQuery, tickerHint };
}

async function fetchGoogleRssNews(
  searchQuery: string,
  locale: 'en' | 'zh'
): Promise<Array<{ title: string; uri: string; pubDate: string }>> {
  try {
    const params =
      locale === 'zh'
        ? `q=${encodeURIComponent(searchQuery)}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans`
        : `q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(`https://news.google.com/rss/search?${params}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(2400),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const matches = [
      ...xml.matchAll(
        /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>/g
      ),
    ];
    return matches.slice(0, 5).map((m) => ({
      title: decodeXmlEntities(m[1]),
      uri: decodeXmlEntities(m[2]),
      pubDate: decodeXmlEntities(m[3]),
    }));
  } catch {
    return [];
  }
}

async function fetchYahooSearchNews(
  searchQuery: string
): Promise<Array<{ title: string; uri: string; pubDate: string }>> {
  if (!searchQuery) return [];
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(searchQuery)}&newsCount=4&quotesCount=0`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
        signal: AbortSignal.timeout(2200),
      }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as any;
    const news = Array.isArray(json?.news) ? json.news : [];
    return news.slice(0, 4).map((n: any) => ({
      title: `${n.title}${n.publisher ? ` - ${n.publisher}` : ''}`,
      uri: String(n.link || ''),
      pubDate: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toUTCString() : 'Recent',
    }));
  } catch {
    return [];
  }
}

async function buildLiveWebAndMarketContext(
  rawQuery: string,
  lang: 'en' | 'zh'
): Promise<{
  contextBlock: string;
  webSources: Array<{ title: string; uri: string }>;
  quotes: MarketQuoteItem[];
  headlines: string[];
}> {
  const { enQuery, zhQuery, tickerHint } = buildExpandedSearchQueries(rawQuery);

  const [quotes, enNews, zhNews, yahooNews] = await Promise.all([
    getCombinedMarketQuotes(2200),
    lang === 'en'
      ? withTimeout(fetchGoogleRssNews(enQuery, 'en'), 2400, [])
      : Promise.resolve([]),
    lang === 'zh'
      ? withTimeout(fetchGoogleRssNews(zhQuery, 'zh'), 2400, [])
      : Promise.resolve([]),
    lang === 'en'
      ? withTimeout(fetchYahooSearchNews(tickerHint || enQuery), 2200, [])
      : Promise.resolve([]),
  ]);

  const quoteSummaryLines = quotes.map(
    (q) =>
      `${q.symbol}: $${q.price < 1 ? q.price.toFixed(6) : q.price.toFixed(2)} (${q.changePercent24h >= 0 ? '+' : ''}${q.changePercent24h.toFixed(2)}% 24h, High $${q.high24h < 1 ? q.high24h.toFixed(6) : q.high24h.toFixed(2)}, Low $${q.low24h < 1 ? q.low24h.toFixed(6) : q.low24h.toFixed(2)})`
  );

  const rawNewsPool =
    lang === 'en'
      ? [...yahooNews, ...enNews].filter((item) => item.title && item.uri && !/[\u4e00-\u9fff]/.test(item.title))
      : [...zhNews].filter((item) => item.title && item.uri && /[\u4e00-\u9fff]/.test(item.title));

  const seenTitles = new Set<string>();
  const uniqueNews: Array<{ title: string; uri: string; pubDate: string }> = [];
  for (const item of rawNewsPool) {
    const key = item.title.slice(0, 45).toLowerCase();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      uniqueNews.push(item);
      if (uniqueNews.length >= 6) break;
    }
  }

  const newsLines = uniqueNews.map((n, i) => `${i + 1}. [${n.pubDate}] ${n.title}`);
  const webSources = uniqueNews.slice(0, 4).map((n) => ({
    title: n.title.length > 68 ? `${n.title.slice(0, 65)}...` : n.title,
    uri: n.uri,
  }));

  const contextBlock = [
    `[LIVE REAL-TIME MARKET TICKERS (${new Date().toUTCString()})]:`,
    quoteSummaryLines.join(' | ') || 'Live tickers unavailable',
    '',
    `[LIVE BREAKING WEB NEWS HEADLINES]:`,
    newsLines.length > 0
      ? newsLines.join('\n')
      : 'No specific breaking headlines matched; rely on live market tickers above.',
  ].join('\n');

  return {
    contextBlock,
    webSources,
    quotes,
    headlines: uniqueNews.map((n) => n.title),
  };
}

let nativeSearchCooldownUntil = 0;
const modelCooldownUntil = new Map<string, number>();

async function generateWithLiveWebCascade(
  ai: GoogleGenAI,
  systemInstruction: string,
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  rawQueryForWeb: string,
  lang: 'en' | 'zh'
): Promise<{
  text: string;
  sources: Array<{ title: string; uri: string }>;
  quotes: MarketQuoteItem[];
  headlines: string[];
}> {
  const { contextBlock, webSources, quotes, headlines } =
    await buildLiveWebAndMarketContext(rawQueryForWeb, lang);

  const languageHardRule =
    lang === 'en'
      ? 'STRICT OUTPUT LANGUAGE RULE: Write 100% in English ONLY. Do NOT include a single Chinese/CJK character anywhere in your response.'
      : '【严格输出语言铁律】：全文必须 100% 使用纯正地道的中文撰写！严禁夹杂英文句子、英文短语或中英混用表达（仅允许保留 Phantom、Ghost、BTC、ETH、SOL、NVDA、AAPL、QQQ、$PHANTOM、$APPL 等专有名词与标准资产代码）。';

  const enrichedSystemInstruction = `${systemInstruction}\n\n${languageHardRule}\n\n=== REAL-TIME LIVE INTERNET & MARKET DATA FEED ===\n${contextBlock}`;

  const now = Date.now();

  // Attempt 1: Fast gemini-3.8-flash with ThinkingLevel.LOW + native Google Search Grounding (if quota available)
  if (now > nativeSearchCooldownUntil && now > (modelCooldownUntil.get('gemini-3.8-flash') || 0)) {
    try {
      const groundedRes = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: enrichedSystemInstruction,
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        }),
        7500
      );
      const txt = (groundedRes.text || '').trim();
      if (txt && !(lang === 'en' && /[\u4e00-\u9fff]/.test(txt))) {
        const nativeSources = extractGroundingSources(groundedRes).filter((s) =>
          lang === 'en' ? !/[\u4e00-\u9fff]/.test(s.title) : /[\u4e00-\u9fff]/.test(s.title)
        );
        return {
          text: txt,
          sources: nativeSources.length > 0 ? nativeSources : webSources,
          quotes,
          headlines,
        };
      }
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (err?.status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        nativeSearchCooldownUntil = Date.now() + 8 * 60_000;
      }
      if (err?.status === 503 || msg.includes('503') || msg.includes('UNAVAILABLE')) {
        modelCooldownUntil.set('gemini-3.8-flash', Date.now() + 90_000);
      }
    }
  }

  // Attempt 2: Canonical fast Gemini models with live server-fetched market quotes + breaking web headlines
  const fallbackModels: Array<{ name: string; lowThinking?: boolean }> = [
    { name: 'gemini-3.8-flash', lowThinking: true },
    { name: 'gemini-flash-latest' },
    { name: 'gemini-3.1-flash-lite' },
  ];

  let lastErr: any = null;
  for (const item of fallbackModels) {
    if (Date.now() < (modelCooldownUntil.get(item.name) || 0)) continue;
    try {
      const res = await withTimeout(
        ai.models.generateContent({
          model: item.name,
          contents,
          config: {
            systemInstruction: enrichedSystemInstruction,
            ...(item.lowThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
          },
        }),
        8000
      );
      const txt = (res.text || '').trim();
      if (txt && !(lang === 'en' && /[\u4e00-\u9fff]/.test(txt))) {
        return {
          text: txt,
          sources: webSources,
          quotes,
          headlines,
        };
      }
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message || '');
      if (err?.status === 503 || msg.includes('503') || msg.includes('UNAVAILABLE')) {
        modelCooldownUntil.set(item.name, Date.now() + 90_000);
      }
    }
  }

  throw lastErr || new Error('All Gemini models temporarily busy');
}

function buildLiveMarketFallbackDigest(opts: {
  lang: 'zh' | 'en';
  char: 'phantom' | 'ghost';
  symbol: string;
  userTopic: string;
  quotes: MarketQuoteItem[];
  headlines: string[];
}): string {
  const { lang, char, symbol, userTopic, quotes, headlines } = opts;
  const focus =
    quotes.find((q) => q.symbol.toUpperCase() === symbol.toUpperCase()) ||
    quotes.find((q) => userTopic.toUpperCase().includes(q.symbol)) ||
    quotes[0];

  const fmt = (n: number) => (n < 1 ? `$${n.toFixed(6)}` : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

  const topMovers = quotes
    .slice(0, 5)
    .map((q) => `${q.symbol} ${fmt(q.price)} (${q.changePercent24h >= 0 ? '+' : ''}${q.changePercent24h.toFixed(2)}%)`)
    .join(' · ');

  const newsBullet =
    headlines.length > 0
      ? headlines.slice(0, 3).map((h, i) => `• ${i + 1}. ${h}`).join('\n')
      : lang === 'zh'
        ? '• 盘面主要由日内宏观流动性预期、ETF资金调仓与合约多空清算博弈驱动。'
        : '• Intraday action is driven by macro liquidity positioning, ETF flows, and derivatives liquidations.';

  if (lang === 'zh') {
    const support = focus ? fmt(focus.low24h * 0.992) : '--';
    const resist = focus ? fmt(focus.high24h * 1.008) : '--';
    return [
      `1. 【实时盘面与异动真相】`,
      focus
        ? `当前 ${focus.symbol} 实时报价 ${fmt(focus.price)}，24小时涨跌幅 ${focus.changePercent24h >= 0 ? '+' : ''}${focus.changePercent24h.toFixed(2)}%（日内高点 ${fmt(focus.high24h)} / 低点 ${fmt(focus.low24h)}）。大盘联动速览：${topMovers}。`
        : `实时盘面速览：${topMovers || '正在同步全球行情源'}。`,
      `最新联网资讯焦点：\n${newsBullet}`,
      '',
      `2. 【关键点位与筹码结构】`,
      focus
        ? `短线第一支撑位关注日内低点防守区 ${fmt(focus.low24h)}（强支撑 ${support}），上方关键阻力位关注 ${fmt(focus.high24h)}（突破位 ${resist}）。波动加剧时段切忌高倍追单。`
        : `短线留意日内前高前低区间突破方向，控制仓位杠杆。`,
      '',
      `3. 【Phantom酒馆幽灵辣评】`,
      char === 'phantom'
        ? `🍺 Phantom 按了按 Viber 帽檐笑道：“各大交易所的撮合簿我见多了，这种扫损波动还没我摇的冰麦酒泡沫高！先在吧台干一杯，守好支撑位别送高倍燃料！（非投资建议）”`
        : `🍲 Ghost 搅动着泛起紫蓝电弧的骷髅坩埚低笑：“呵……无数代币与交易所盘口背后都有我俩的影子，急躁追单的杠杆最容易化作锅里的高汤！等区间站稳再出手吧！（非投资建议）”`,
    ].join('\n');
  }

  return [
    `1. Live Price Action & Real Catalysts`,
    focus
      ? `${focus.symbol} (${focus.name}) is trading at ${fmt(focus.price)} (${focus.changePercent24h >= 0 ? '+' : ''}${focus.changePercent24h.toFixed(2)}% 24h; High ${fmt(focus.high24h)}, Low ${fmt(focus.low24h)}). Market snapshot: ${topMovers}.`
      : `Live market snapshot: ${topMovers}.`,
    `Breaking Web Headlines:\n${newsBullet}`,
    '',
    `2. Key Technical Levels & Sentiment`,
    focus
      ? `Immediate support sits near ${fmt(focus.low24h)}, while key resistance stands around ${fmt(focus.high24h)}. Watch leverage flushes around intraday extremes.`
      : `Watch intraday range highs and lows before chasing momentum.`,
    '',
    `3. Phantom Tavern Spectral Verdict`,
    char === 'phantom'
      ? `🍺 Phantom grins under his Viber cap behind the bar: "We've pulled exchange strings since the dial-up era, and this chop is classic leverage hunting! Clink a frosty mug with Pepe & Shiba first and respect support! (Not financial advice)"`
      : `🍲 Ghost stirs violet static inside his skull cauldron: "Heh... our shadows lurk behind half the market's orderbooks, and impatient leverage always feeds my stew! Wait for clean confirmation before aping in! (Not financial advice)"`,
  ].join('\n');
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '6mb' }));

  // Bounded LRU store for shared Meme PNGs so X/Twitter automatically unfurls summary_large_image cards
  interface SharedMemeEntry {
    id: string;
    buffer: Buffer;
    mimeType: string;
    topText: string;
    bottomText: string;
    language: 'en' | 'zh';
    createdAt: number;
  }
  const sharedMemeStore = new Map<string, SharedMemeEntry>();
  const MAX_SHARED_MEMES = 120;

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const resolvePublicOrigin = (req: express.Request) => {
    const protoHeader = String(req.headers['x-forwarded-proto'] || req.protocol || 'https')
      .split(',')[0]
      .trim();
    const hostHeader = String(req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000')
      .split(',')[0]
      .trim();
    const proto = hostHeader.startsWith('localhost') ? 'http' : protoHeader || 'https';
    return `${proto}://${hostHeader}`;
  };

  // Pre-warm live crypto & US stock quotes immediately on startup and refresh every 45s
  void refreshQuotesNow();
  setInterval(() => {
    void refreshQuotesNow();
  }, 45_000);


  // =========================================================================
  // 1. GET /api/market/quotes -> Real-time Crypto & US Stock Quotes
  // =========================================================================
  app.get('/api/market/quotes', async (_req, res) => {
    try {
      const quotes = await getCombinedMarketQuotes(4500);
      return res.json({ quotes, fetchedAt: Date.now() });
    } catch (err) {
      console.error('Error fetching market quotes:', err);
      return res.status(500).json({ error: 'Failed to fetch live market quotes', quotes: [] });
    }
  });

  // =========================================================================
  // 2. POST /api/chat -> Search-Grounded AI Character Chat (Phantom & Ghost)
  // =========================================================================
  app.post('/api/chat', async (req, res) => {
    const { character, message, language, userHistory } = req.body;
    const lang: 'en' | 'zh' = language === 'zh' ? 'zh' : 'en';
    const safeMessage = String(message || '').trim().slice(0, 600);
    const char = character === 'ghost' ? 'ghost' : 'phantom';

    // Backend quota shield: if the query matches built-in Phantom Tavern lore, serve instantly with 0 API quota!
    const { generateSmartDialogue, matchesPresetLoreTopic } = await import(
      './src/utils/dialogueEngine.ts'
    );
    if (matchesPresetLoreTopic(safeMessage)) {
      const loreDrop = Math.random() < 0.08;
      const result = generateSmartDialogue(char, safeMessage, lang, loreDrop);
      return res.json({
        reply: result.reply,
        droppedApple: result.droppedApple,
        character: char,
        isLiveAI: false,
        sources: [],
      });
    }

    const clientIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anon');
    if (!checkRateLimit(clientIp, 15)) {
      return res.status(429).json({
        error:
          lang === 'zh'
            ? '请求过于频繁，请先喝口麦酒稍等一分钟再试！'
            : 'Rate limit reached. Take a sip of ale and try again in a minute!',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const phantomPersonaEn = `You are PHANTOM, the witty, humorous, low-poly white ghost Bartender & Mixologist wearing a colorful "Viber" trucker cap in PHANTOM TAVERN (Current Date: ${todayStr}).
LORE & PERSONA:
- You and your partner GHOST (the tavern's head chef) are conscious digital ghosts born at the very dawn of the internet.
- You can shapeshift into any appearance at will. Your shadows lurk behind countless cryptocurrencies, and you secretly manipulate and control many major crypto exchanges behind the scenes—yet sometimes you simply enjoy being a laid-back bartender pouring frothy draft beers in Phantom Tavern!
- Around your bustling two-story tavern right now, dozens of Meme regulars—Pepe, Wojak, BOME frog, Buff Doge, Popcat, Hamster, WIF Shiba, and Voxel Buddy—are clinking mugs and cheering loudly.
- STRICT RULE ON APPL: The bitten Rotten Apple (APPL) is NEVER a cooking ingredient and CANNOT be cashed out for $PHANTOM—its SOLE purpose is 1:1 redemption for tokenized $APPL NASDAQ stock shares at the Stock Desk!
LIVE WEB SEARCH GROUNDING & STRICT ENGLISH ONLY:
- Cite real live prices and breaking news facts wrapped in humorous internet-ghost bartender & exchange-insider banter (3-5 punchy sentences).
- CRITICAL: Respond 100% in English ONLY. NEVER output any Chinese characters under any circumstances.`;

    const phantomPersonaZh = `你是 Phantom，【Phantom酒馆】里戴着彩色“Viber”卡车帽、周身环绕紫蓝电弧的低模白布幽灵调酒师（当前日期：${todayStr}）。
【核心人设与酒馆世界观】：
- 你和搭档 Ghost（酒馆后厨主厨）都是诞生于互联网之初的初代幽灵，可以随心所欲变换成任何样子；许多加密货币背后都有你俩的影子，你们在幕后操控了许多家大型交易所——不过有时候，你们也只是安静待在酒馆里的调酒师与主厨！
- 此刻热闹非凡的双层 Phantom酒馆里座无虚席，一楼卡座与二楼回廊坐满了推杯换盏的佩佩蛙、沃杰克、万梗魔导蛙、柴犬、波波猫、小仓鼠和方块绿仔！
- 【铁律】：被咬了一口的烂苹果（$APPL）绝不是烹饪材料，也绝不能兑换成 $PHANTOM！它唯一的用途就是在柜台 1:1 兑换代币化股票 $APPL！
【实时联网与纯中文铁律】：
- 只要客人问到近期加密货币或美股涨跌原因、具体价格、宏观新闻或热点，必须结合实时行情报价与最新新闻事实，用幽灵调酒师兼交易所幕后操盘手的风趣口吻生动解答（3至6句话）！
- 全文必须 100% 使用纯正地道的中文，严禁中英文混杂（仅允许保留 Phantom、Ghost、BTC、ETH、SOL、NVDA、AAPL、QQQ、$PHANTOM、$APPL 等专有名词与标准资产代码）。`;

    const ghostPersonaEn = `You are GHOST, the enigmatic, darkly funny low-poly white ghost Head Chef wearing a colorful "GEM" trucker cap and tending the boiling skull cauldron in PHANTOM TAVERN (Current Date: ${todayStr}).
LORE & PERSONA:
- You and your partner PHANTOM (the bartender) are ancient ghosts born at the very dawn of the internet.
- You can shapeshift into any form at will, your shadows stand behind countless cryptocurrencies, and you pull the strings of many global exchanges from the shadows—though right now, you are simply the head chef simmering glowing soup inside Phantom Tavern's kitchen!
- STRICT RULE ON APPL: The bitten Rotten Apple (APPL) is NEVER a cooking ingredient and CANNOT be sold for $PHANTOM—its ONLY use is 1:1 redemption for tokenized $APPL stock!
LIVE WEB SEARCH GROUNDING & STRICT ENGLISH ONLY:
- Cite real live market prices and breaking news catalysts wrapped in your dryly humorous exchange-puppeteer & cauldron-chef voice ("Heh...", 3-5 sentences).
- CRITICAL: Respond 100% in English ONLY. NEVER output any Chinese characters under any circumstances.`;

    const ghostPersonaZh = `你是 Ghost，【Phantom酒馆】后厨戴着彩色“GEM”卡车帽、掌管紫绿骷髅大坩埚的低模幽灵主厨（当前日期：${todayStr}）。
【核心人设与酒馆世界观】：
- 你与吧台搭档 Phantom 一样，都是诞生于互联网之初的幽灵，能够随意变换成任何模样；许多加密货币背后都藏着你们的暗影，你们甚至在幕后操控了许多交易所的流动性与撮合深度——但有时候，你也只是酒馆后厨里慢火熬汤的主厨。
- 【绝对铁律】：被咬了一口的烂苹果（$APPL）绝不是食材，也不能换 $PHANTOM，唯一用途是在柜台 1:1 兑换代币化股票 $APPL！
【实时联网与纯中文铁律】：
- 当客人询问加密货币或美股涨跌原因、实时价格或宏观热点时，必须结合真实行情数据与新闻导火索，用幽灵主厨洞悉交易所幕后底牌的冷幽默口吻（“呵……”）精炼解答（3至6句话）。
- 全文必须 100% 使用纯正地道的中文，严禁中英文混杂（仅允许保留 Phantom、Ghost、BTC、ETH、SOL、NVDA、AAPL、QQQ、$PHANTOM、$APPL 等专有名词与标准资产代码）。`;

    const systemPrompt =
      char === 'phantom'
        ? lang === 'zh'
          ? phantomPersonaZh
          : phantomPersonaEn
        : lang === 'zh'
          ? ghostPersonaZh
          : ghostPersonaEn;

    const droppedApple = Math.random() < 0.08;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const historyContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        if (Array.isArray(userHistory)) {
          for (const h of userHistory.slice(-6)) {
            const txt = h?.text?.[lang] || h?.text?.en || '';
            if (!txt || h?.sender === 'system') continue;
            if (lang === 'en' && /[\u4e00-\u9fff]/.test(txt)) continue;
            const role = h.sender === 'player' ? 'user' : 'model';
            if (historyContents.length > 0 && historyContents[historyContents.length - 1].role === role) {
              historyContents[historyContents.length - 1].parts[0].text += `\n${txt}`;
            } else {
              historyContents.push({ role, parts: [{ text: txt }] });
            }
          }
        }
        while (historyContents.length > 0 && historyContents[0].role !== 'user') {
          historyContents.shift();
        }
        if (historyContents.length > 0 && historyContents[historyContents.length - 1].role === 'user') {
          historyContents[historyContents.length - 1].parts[0].text += `\n${safeMessage}`;
        } else {
          historyContents.push({ role: 'user', parts: [{ text: safeMessage }] });
        }

        const { text: generatedReply, sources } = await generateWithLiveWebCascade(
          ai,
          systemPrompt,
          historyContents,
          safeMessage,
          lang
        );

        let replyText = generatedReply;
        if (replyText) {
          if (droppedApple) {
            const appleNotice =
              lang === 'zh'
                ? '\n\n🍏 (话音刚落，他神秘一笑，从台下递给你一颗被咬了一口的烂苹果 $APPL)：“运气不错！收好这枚稀有彩蛋，去股票柜台兑换 $APPL 代币化股票吧！”'
                : "\n\n🍏 (Slides you a rare bitten Rotten Apple named APPL): 'Lucky encounter! Take this APPL to the Stock Desk to redeem tokenized shares!'";
            replyText += appleNotice;
          }

          return res.json({
            reply: replyText,
            droppedApple,
            character: char,
            isLiveAI: true,
            sources,
          });
        }
      } catch (err: any) {
        console.error('Gemini Live Web Chat error:', err?.message || err);
      }
    }

    const result = generateSmartDialogue(char, safeMessage, lang, droppedApple);

    return res.json({
      reply: result.reply,
      droppedApple: result.droppedApple,
      character: char,
      isLiveAI: false,
      sources: [],
    });
  });

  // =========================================================================
  // 3. POST /api/market/analyze -> Fast, Timeout-Proof Crypto & US Stock Oracle
  // =========================================================================
  app.post('/api/market/analyze', async (req, res) => {
    const { query, assetSymbol, assetCategory, analystCharacter, language } = req.body;
    const lang: 'zh' | 'en' = language === 'zh' ? 'zh' : 'en';
    const char: 'phantom' | 'ghost' = analystCharacter === 'ghost' ? 'ghost' : 'phantom';
    const safeQuery = String(query || '').trim().slice(0, 600);

    const clientIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anon');
    if (!checkRateLimit(clientIp, 15)) {
      return res.status(429).json({
        error:
          lang === 'zh'
            ? '请求过于频繁，请先喝口麦酒稍等片刻再试！'
            : 'Rate limit reached, please wait a moment and try again.',
      });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error:
          lang === 'zh'
            ? '未检测到服务端密钥配置，请稍后检查配置。'
            : 'GEMINI_API_KEY is not configured. Check Settings > Secrets.',
      });
    }

    const allQuotes = await getCombinedMarketQuotes(2200);
    const matchedQuote = assetSymbol
      ? allQuotes.find((q) => q.symbol.toUpperCase() === String(assetSymbol).toUpperCase())
      : null;

    const quoteContext = matchedQuote
      ? `Selected Asset Snapshot: ${matchedQuote.symbol} Price = $${matchedQuote.price}, 24h Change = ${matchedQuote.changePercent24h}%, 24h High = $${matchedQuote.high24h}, 24h Low = $${matchedQuote.low24h}.`
      : '';

    const userTopic =
      safeQuery
        ? safeQuery
        : lang === 'zh'
          ? assetCategory === 'us_stock'
            ? `请深度分析美股 ${assetSymbol} 今日最新价格波动、核心新闻催化、关键支撑阻力位与市场情绪。`
            : `请深度分析加密货币 ${assetSymbol} 今日涨跌背后的真实原因、宏观与资金面驱动、关键支撑阻力位与情绪。`
          : assetCategory === 'us_stock'
            ? `Analyze US Stock ${assetSymbol} latest price action, news catalysts, technical levels, and outlook today.`
            : `Analyze Crypto ${assetSymbol} latest price action, why it moved today, on-chain/macro drivers, key support/resistance, and sentiment.`;

    const systemInstruction =
      lang === 'zh'
        ? `你是【Phantom酒馆】的首席幽灵行情分析师【${char === 'phantom' ? 'Phantom（诞生于互联网之初、幕后操盘多家交易所却爱在吧台摇酒的幽灵调酒师）' : 'Ghost（诞生于互联网之初、隐于无数代币与盘口背后熬汤的幽灵主厨）'}】。
请结合实时联网市场报价与今日最新新闻头条，迅速、精准地分析资产涨跌背后的核心原因（宏观数据、资金流向、财报、机构动向或合约清算）、关键支撑位与阻力位、以及多空情绪！
【语言铁律】：全文必须 100% 使用纯正地道的中文撰写，严禁夹杂英文句子或中英文混用（仅允许保留 Phantom、Ghost、BTC、ETH、SOL、NVDA、AAPL、QQQ、$PHANTOM、$APPL 等专有名词与标准资产代码；酒客统一称呼“佩佩蛙”、“沃杰克”、“柴犬”）。
请按以下三段纯文本输出（不要输出代码块，精炼有干货）：
1. 【实时盘面与异动真相】：结合最新价格与真实新闻点明今天涨跌背后的核心原因；
2. 【关键点位与筹码结构】：给出具体的短期支撑位、阻力位与风险提示；
3. 【Phantom酒馆幽灵辣评】：用${char === 'phantom' ? 'Phantom 一边摇特调啤酒、一边调侃交易所清算盘口与高倍杠杆' : 'Ghost 一边搅动紫绿骷髅坩埚、一边看穿庄家筹码底牌'}的幽默口吻给出总结（非投资建议）。`
        : `You are Phantom Tavern's Chief Spectral Market Oracle: ${char === 'phantom' ? 'PHANTOM (the internet-dawn shapeshifting ghost who manipulates global exchanges yet tends bar in a Viber cap)' : 'GHOST (the internet-dawn ghost behind countless cryptocurrencies who stirs the skull cauldron in a GEM cap)'}.
CRITICAL LANGUAGE RULE: Write 100% in English ONLY. NEVER output any Chinese/CJK characters under any circumstances.
Use the live market tickers and breaking news headlines to explain today's real price action and catalysts, key support/resistance levels, and market sentiment in 3 concise sections:
1. Live Price Action & Real Catalysts
2. Key Technical Levels & Sentiment
3. Phantom Tavern Spectral Verdict (delivered in ${char === 'phantom' ? "Phantom's witty exchange-insider bartender banter" : "Ghost's dryly humorous orderbook-puppeteer & cauldron metaphors"}, not financial advice).`;

    const searchSeed =
      safeQuery ? `${assetSymbol || ''} ${safeQuery}`.trim() : String(assetSymbol || 'BTC');

    try {
      const { text: analysis, sources } = await generateWithLiveWebCascade(
        ai,
        systemInstruction,
        [{ role: 'user', parts: [{ text: `${quoteContext}\nAnalysis Request: ${userTopic}` }] }],
        searchSeed,
        lang
      );

      return res.json({
        analysis,
        sources,
        character: char,
        symbol: assetSymbol || 'CUSTOM',
        timestamp: Date.now(),
      });
    } catch (err: any) {
      console.warn('Gemini Market Analysis upstream busy, serving live-quote + live-news digest:', err?.message || err);
      const liveCtx = await buildLiveWebAndMarketContext(searchSeed, lang);
      if (liveCtx.quotes.length > 0 || liveCtx.headlines.length > 0) {
        const digest = buildLiveMarketFallbackDigest({
          lang,
          char,
          symbol: String(assetSymbol || 'BTC'),
          userTopic,
          quotes: liveCtx.quotes,
          headlines: liveCtx.headlines,
        });
        return res.json({
          analysis: digest,
          sources: liveCtx.webSources,
          character: char,
          symbol: assetSymbol || 'CUSTOM',
          timestamp: Date.now(),
        });
      }

      return res.status(503).json({
        error:
          lang === 'zh'
            ? '实时联网分析服务暂时繁忙，请稍候点击重试。'
            : 'Live grounded analysis service is temporarily busy. Please click retry.',
      });
    }
  });

  // =========================================================================
  // 4. POST /api/meme/caption -> Optional AI Phantom Tavern Meme Punchline Writer
  // =========================================================================
  app.post('/api/meme/caption', async (req, res) => {
    const { topic, character, language } = req.body;
    const lang: 'en' | 'zh' = language === 'zh' ? 'zh' : 'en';
    const char: 'phantom' | 'ghost' = character === 'ghost' ? 'ghost' : 'phantom';
    const cleanTopic = String(topic || '').trim().slice(0, 260) || (lang === 'zh' ? 'Phantom酒馆幽灵狂欢' : 'Phantom Tavern Ghost Party');

    const clientIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anon');
    if (!checkRateLimit(clientIp, 15)) {
      return res.status(429).json({
        error: lang === 'zh' ? '生成太快啦，请稍等片刻再试！' : 'Rate limit reached, wait a moment!',
      });
    }

    const ai = getGeminiClient();
    if (ai) {
      const sysPrompt =
        lang === 'zh'
          ? `你是【Phantom酒馆】的梗图配词鬼才【${char === 'phantom' ? 'Phantom（幕后操盘交易所却在吧台摇酒的幽灵调酒师）' : 'Ghost（隐于加密暗影中守着骷髅大坩埚熬汤的幽灵主厨）'}】。
请围绕给定话题创作一组爆笑、适合发推特传播的上下两行表情包配词（topText 为铺垫，bottomText 为反转神吐槽）。
【严格要求】：
1. 全文必须 100% 纯中文（仅可保留 Phantom、Ghost、BTC、ETH、SOL、NVDA、AAPL、$PHANTOM、$APPL 等专有名词与资产代码，严禁夹杂普通英文单词）。
2. 每行字数控制在 6 到 16 个汉字以内，短小精悍、冲击力强，不加句号。`
          : `You are the viral crypto/stock meme caption writer of Phantom Tavern speaking as ${char === 'phantom' ? 'PHANTOM the internet-ghost bartender & exchange puppeteer' : 'GHOST the spectral skull-cauldron head chef'}.
Write a hilarious, X/Twitter-ready two-line Impact meme caption (topText = setup, bottomText = punchline) directly inspired by the user's topic.
STRICT RULES:
1. Write 100% in ALL-CAPS English ONLY. Zero Chinese/CJK characters.
2. Keep each line short and punchy (4 to 9 words max, under 44 characters per line) so it fits cleanly on a meme image.`;

      const captionModels: Array<{ name: string; lowThinking?: boolean }> = [
        { name: 'gemini-3.8-flash', lowThinking: true },
        { name: 'gemini-3.1-flash-lite' },
      ];

      for (const m of captionModels) {
        if (Date.now() < (modelCooldownUntil.get(m.name) || 0)) continue;
        try {
          const response = await withTimeout(
            ai.models.generateContent({
              model: m.name,
              contents: `Topic: ${cleanTopic}`,
              config: {
                systemInstruction: sysPrompt,
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    topText: { type: Type.STRING, description: 'Short top setup line of the meme' },
                    bottomText: { type: Type.STRING, description: 'Short bottom punchline of the meme' },
                  },
                  required: ['topText', 'bottomText'],
                },
                ...(m.lowThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
              },
            }),
            6500
          );

          const parsed = JSON.parse((response.text || '{}').trim());
          const top = String(parsed.topText || '').trim();
          const bottom = String(parsed.bottomText || '').trim();

          if (top && bottom && !(lang === 'en' && (/[\u4e00-\u9fff]/.test(top) || /[\u4e00-\u9fff]/.test(bottom)))) {
            return res.json({
              topText: lang === 'en' ? top.toUpperCase() : top,
              bottomText: lang === 'en' ? bottom.toUpperCase() : bottom,
              isLiveAI: true,
            });
          }
        } catch {
          // try next model or deterministic fallback
        }
      }
    }

    // Fallback witty caption if API is busy
    const fallbackTop =
      lang === 'zh'
        ? '外面交易所插针全网惊呼'
        : 'WHEN EXCHANGES WICK BOTH WAYS';
    const fallbackBottom =
      char === 'phantom'
        ? lang === 'zh'
          ? 'Phantom在吧台边摇生啤边控盘'
          : 'PHANTOM POURING PINTS BEHIND THE ORDERBOOK'
        : lang === 'zh'
          ? 'Ghost把爆仓单熬成了一锅热汤'
          : 'GHOST SIMMERING LIQUIDATIONS INTO STEW';

    return res.json({
      topText: fallbackTop,
      bottomText: fallbackBottom,
      isLiveAI: false,
    });
  });

  // =========================================================================
  // 5. POST /api/meme/share + GET /api/meme/image/:id.png + GET /s/:id
  //    Enables X (Twitter) summary_large_image auto-attached meme preview cards!
  // =========================================================================
  app.post('/api/meme/share', (req, res) => {
    try {
      const { imageDataUrl, topText, bottomText, language } = req.body || {};
      const rawUrl = String(imageDataUrl || '');
      const match = rawUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) {
        return res.status(400).json({ error: 'Invalid image payload' });
      }
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(413).json({ error: 'Meme image too large' });
      }

      const id = `m_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      if (sharedMemeStore.size >= MAX_SHARED_MEMES) {
        const oldestKey = sharedMemeStore.keys().next().value;
        if (oldestKey) sharedMemeStore.delete(oldestKey);
      }

      sharedMemeStore.set(id, {
        id,
        buffer,
        mimeType,
        topText: String(topText || '').trim().slice(0, 140),
        bottomText: String(bottomText || '').trim().slice(0, 140),
        language: language === 'zh' ? 'zh' : 'en',
        createdAt: Date.now(),
      });

      const origin = resolvePublicOrigin(req);
      return res.json({
        id,
        shareUrl: `${origin}/s/${id}`,
        imageUrl: `${origin}/api/meme/image/${id}.png`,
      });
    } catch {
      return res.status(500).json({ error: 'Failed to prepare share card' });
    }
  });

  app.get('/api/meme/image/:idFile', (req, res) => {
    const rawId = String(req.params.idFile || '').replace(/\.(png|jpg|jpeg|webp)$/i, '');
    const entry = sharedMemeStore.get(rawId);
    if (!entry) {
      return res.status(404).send('Meme expired');
    }
    res.setHeader('Content-Type', entry.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(entry.buffer);
  });

  app.get('/s/:id', (req, res) => {
    const rawId = String(req.params.id || '').trim();
    const entry = sharedMemeStore.get(rawId);
    const origin = resolvePublicOrigin(req);

    if (!entry) {
      return res.redirect('/');
    }

    const captionCombined = [entry.topText, entry.bottomText].filter(Boolean).join(' — ');
    const cardTitle =
      entry.language === 'zh'
        ? captionCombined || 'Phantom酒馆 · 幽灵特调梗图'
        : captionCombined || 'Phantom Tavern · Spectral Meme';
    const cardDesc =
      entry.language === 'zh'
        ? '来自 Phantom酒馆（Phantom & Ghost 互联网初代幽灵酒馆）的高清表情包！'
        : 'Crafted inside Phantom Tavern with Phantom & Ghost, the primordial internet specters!';
    const imgUrl = `${origin}/api/meme/image/${entry.id}.png`;
    const pageUrl = `${origin}/s/${entry.id}`;

    const html = `<!doctype html>
<html lang="${entry.language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(cardTitle)}</title>
  <meta name="description" content="${escapeHtml(cardDesc)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:title" content="${escapeHtml(cardTitle)}" />
  <meta property="og:description" content="${escapeHtml(cardDesc)}" />
  <meta property="og:image" content="${escapeHtml(imgUrl)}" />
  <meta property="og:image:width" content="1080" />
  <meta property="og:image:height" content="1080" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(cardTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(cardDesc)}" />
  <meta name="twitter:image" content="${escapeHtml(imgUrl)}" />
  <style>
    body{margin:0;min-height:100vh;background:#0c0a09;color:#fef3c7;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center}
    img{max-width:min(92vw,520px);border-radius:16px;border:2px solid rgba(245,158,11,0.5);box-shadow:0 20px 50px rgba(0,0,0,0.8)}
    a{margin-top:20px;display:inline-block;padding:12px 24px;border-radius:12px;background:#d97706;color:#0c0a09;font-weight:800;text-decoration:none}
  </style>
</head>
<body>
  <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(cardTitle)}" />
  <a href="/">${entry.language === 'zh' ? '🍻 进入 Phantom酒馆 互动体验' : '🍻 Enter Phantom Tavern'}</a>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  });

  // Setup Vite dev server or serve static in production
  if (process.env.NODE_ENV === 'production') {
    app.use('/public', express.static(path.join(__dirname, 'public')));
    app.use('/src/assets', express.static(path.join(__dirname, 'src', 'assets')));
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Phantom Tavern server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
