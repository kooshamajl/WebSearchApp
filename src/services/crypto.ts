export type PricePoint = { timestamp: number; price: number };
export type CryptoTimeframe = "24h" | "7d";

type MarketChartResponse = { prices?: unknown };

const HOUR_MS = 60 * 60 * 1000;
const CHART_POINTS = 45;
const MARKET_URL = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7";

export async function fetchCryptoHistory(signal: AbortSignal): Promise<PricePoint[]> {
    const response = await fetch(MARKET_URL, { signal });
    if (!response.ok) throw new Error(`Bitcoin price request failed (${response.status})`);

    const data = await response.json() as MarketChartResponse | null;
    const prices = new Map<number, number>();
    if (Array.isArray(data?.prices)) {
        for (const row of data.prices as unknown[]) {
            if (!Array.isArray(row)) continue;
            const [timestamp, price] = row as unknown[];
            if (typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0 &&
                typeof price === "number" && Number.isFinite(price) && price > 0) {
                prices.set(timestamp, price);
            }
        }
    }

    if (prices.size < 2) throw new Error("Bitcoin price history is incomplete");
    return Array.from(prices, ([timestamp, price]) => ({ timestamp, price }))
        .sort((a, b) => a.timestamp - b.timestamp);
}

export function makeDemoHistory(now: number): PricePoint[] {
    const hours = 7 * 24;
    return Array.from({ length: hours + 1 }, (_, index) => ({
        timestamp: now - (hours - index) * HOUR_MS,
        price: 45000 + Math.sin(index / 8) * 800,
    }));
}

export function getCryptoRange(history: readonly PricePoint[], timeframe: CryptoTimeframe): readonly PricePoint[] {
    if (timeframe === "7d" || history.length === 0) return history;

    const cutoff = history[history.length - 1].timestamp - 24 * HOUR_MS;
    return history.filter(({ timestamp }) => timestamp >= cutoff);
}

export function sampleCryptoChart(points: readonly PricePoint[]): readonly PricePoint[] {
    if (points.length <= CHART_POINTS) return points;

    const step = (points.length - 1) / (CHART_POINTS - 1);
    return Array.from({ length: CHART_POINTS }, (_, index) => points[Math.round(index * step)]);
}
