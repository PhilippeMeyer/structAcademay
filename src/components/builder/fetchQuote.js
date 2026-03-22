export async function fetchQuote(symbol) {
  const encoded = encodeURIComponent(symbol);
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=5d`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`;
  try {
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("proxy error");
    const outer = await res.json();
    const data = JSON.parse(outer.contents);
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error("no meta");
    return {
      symbol,
      price: meta.regularMarketPrice ?? meta.chartPreviousClose,
      prev: meta.chartPreviousClose,
      currency: meta.currency,
      exchange: meta.exchangeName,
      high52: meta.fiftyTwoWeekHigh,
      low52: meta.fiftyTwoWeekLow,
      ok: true,
    };
  } catch {
    return { symbol, ok: false };
  }
}

