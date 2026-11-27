import { useEffect, useState } from "react";
import { fetchCryptoHistory, getCryptoRange, makeDemoHistory, sampleCryptoChart, type CryptoTimeframe, type PricePoint } from "../../services/crypto";
import CryptoChart from "./CryptoChart";

const TIMEFRAME_KEY = "cryptoTimeframe";
const REFRESH_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10000;
const TIMEFRAMES = ["24h", "7d"] as const;
const priceFormat = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
});

type CryptoSnapshot = { history: PricePoint[]; status: "current" | "stale" | "demo" };

function readTimeframe(): CryptoTimeframe {
    try {
        return localStorage.getItem(TIMEFRAME_KEY) === "7d" ? "7d" : "24h";
    } catch {
        return "24h";
    }
}

export default function CryptoWidget() {
    const [timeframe, setTimeframe] = useState(readTimeframe);
    const [snapshot, setSnapshot] = useState<CryptoSnapshot | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [retrying, setRetrying] = useState(false);

    useEffect(() => {
        let stopped = false;
        let refreshTimer: number | undefined;
        let request: AbortController | undefined;
        let requestTimer: number | undefined;

        async function refresh() {
            const controller = new AbortController();
            request = controller;
            requestTimer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            try {
                const history = await fetchCryptoHistory(controller.signal);
                if (!stopped) setSnapshot({ history, status: "current" });
            } catch {
                if (!stopped) {
                    setSnapshot((previous) => previous
                        ? { ...previous, status: previous.status === "demo" ? "demo" : "stale" }
                        : { history: makeDemoHistory(Date.now()), status: "demo" });
                }
            } finally {
                window.clearTimeout(requestTimer);
                if (!stopped) {
                    setRetrying(false);
                    refreshTimer = window.setTimeout(refresh, REFRESH_MS);
                }
            }
        }

        void refresh();
        return () => {
            stopped = true;
            window.clearTimeout(refreshTimer);
            window.clearTimeout(requestTimer);
            request?.abort();
        };
    }, [attempt]);

    function selectTimeframe(selected: CryptoTimeframe) {
        setTimeframe(selected);
        try {
            localStorage.setItem(TIMEFRAME_KEY, selected);
        } catch {
            // The selected timeframe still applies while the widget is open.
        }
    }

    const range = snapshot ? getCryptoRange(snapshot.history, timeframe) : [];
    const latest = snapshot?.history.at(-1);
    const change = latest && range.length >= 2 ? 100 * (latest.price / range[0].price - 1) : null;
    const isDemo = snapshot?.status === "demo";

    return (
        <div id="cryptoWidget" className="crypto-widget">
            <div className="crypto-header">
                <span className="crypto-icon" aria-hidden="true">₿</span>
                <div className="crypto-header-text">
                    <p id="cryptoName">{isDemo ? "Bitcoin (Demo)" : "Bitcoin (BTC)"}</p>
                    {latest && <p id="cryptoPrice">{priceFormat.format(latest.price)}</p>}
                </div>
            </div>

            {snapshot === null && <p role="status">Loading Bitcoin prices…</p>}
            {snapshot && range.length < 2 && <p>{timeframe.toUpperCase()} history unavailable.</p>}
            {range.length >= 2 && <CryptoChart points={sampleCryptoChart(range)} />}

            <div className="crypto-divider" aria-hidden="true" />
            <div id="cryptoChange">
                {change !== null && <span className={change < 0 ? "trend-down" : "trend-up"}>
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                </span>}
                <div className="crypto-timeframe" role="group" aria-label="Price timeframe">
                    {TIMEFRAMES.map((option) => (
                        <button key={option} type="button" className={`tf-btn${option === timeframe ? " active" : ""}`}
                            aria-pressed={option === timeframe} onClick={() => selectTimeframe(option)}>
                            {option.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {snapshot && snapshot.status !== "current" && (
                <div className="crypto-status">
                    <p role="status">{isDemo ? "Prices unavailable. Showing sample data." : "Refresh failed. Showing the last update."}</p>
                    <button type="button" disabled={retrying} onClick={() => {
                        setRetrying(true);
                        setAttempt(attempt + 1);
                    }}>{retrying ? "Retrying…" : "Try again"}</button>
                </div>
            )}
        </div>
    );
}
