import { useEffect, useRef, useState } from "react";
import { describeLatency, measureHttpLatency } from "../../services/connection";

import "../../../css/widgets.css";

const REFRESH_MS = 4000;
const TIMEOUT_MS = 4000;

type ConnectionResult =
    | { status: "checking" | "offline" | "unavailable" }
    | { status: "connected"; latency: number };

const statusLabels = {
    checking: "Checking connection…",
    offline: "Offline",
    unavailable: "CDN check failed",
};

export default function ConnectionWidget() {
    const [result, setResult] = useState<ConnectionResult>({ status: "checking" });
    const [isChecking, setIsChecking] = useState(false);
    const refresh = useRef<(() => void) | null>(null);

    useEffect(() => {
        let refreshTimer: number | undefined;
        let pending: { controller: AbortController; timeout: number } | undefined;

        function cancelCheck() {
            window.clearTimeout(refreshTimer);
            const current = pending;
            pending = undefined;
            if (current) {
                window.clearTimeout(current.timeout);
                current.controller.abort();
            }
        }

        function goOffline() {
            cancelCheck();
            setResult({ status: "offline" });
            setIsChecking(false);
        }

        async function checkConnection() {
            if (!navigator.onLine) {
                goOffline();
                return;
            }
            if (pending) return;
            window.clearTimeout(refreshTimer);

            const controller = new AbortController();
            const current = { controller, timeout: window.setTimeout(() => controller.abort(), TIMEOUT_MS) };
            pending = current;
            setIsChecking(true);
            setResult((previous) => previous.status === "offline" ? { status: "checking" } : previous);

            try {
                const latency = await measureHttpLatency(controller.signal);
                if (pending === current) setResult({ status: "connected", latency });
            } catch {
                if (pending === current) setResult({ status: navigator.onLine ? "unavailable" : "offline" });
            } finally {
                window.clearTimeout(current.timeout);
                if (pending === current) {
                    pending = undefined;
                    setIsChecking(false);
                    if (navigator.onLine) refreshTimer = window.setTimeout(checkConnection, REFRESH_MS);
                }
            }
        }

        refresh.current = checkConnection;
        window.addEventListener("online", checkConnection);
        window.addEventListener("offline", goOffline);
        void checkConnection();

        return () => {
            refresh.current = null;
            window.removeEventListener("online", checkConnection);
            window.removeEventListener("offline", goOffline);
            cancelCheck();
        };
    }, []);

    const status = result.status === "connected" ? describeLatency(result.latency) : statusLabels[result.status];

    return (
        <div id="pingWidget" className="connection-widget">
            <p className="ping-title" title="Browser HTTP request timing. ICMP ping uses network-layer echo requests.">
                HTTP latency to jsDelivr
            </p>
            <div className="ping-divider" aria-hidden="true" />
            <div className="ping-row">
                <span className="ping-icon" aria-hidden="true">{result.status === "connected" ? "✓" : "–"}</span>
                <div className="ping-info">
                    <div id="pingValue">{result.status === "connected" ? `${result.latency} ms` : "— ms"}</div>
                    <div id="pingStatus" role="status">{status}</div>
                </div>
            </div>
            <button type="button" className="connection-refresh" aria-disabled={isChecking || result.status === "offline"}
                onClick={() => refresh.current?.()}>Check connection</button>
        </div>
    );
}
