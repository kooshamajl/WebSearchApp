import { useEffect, useRef, useState } from "react";
import Icon from "../common/Icon";
import { describeLatency, measureHttpLatency } from "../../services/connection";

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
    const [measurement, setMeasurement] = useState(0);
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
            setMeasurement((count) => count + 1);
            setIsChecking(false);
        }

        async function checkConnection() {
            if (document.hidden) return;
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
                    setMeasurement((count) => count + 1);
                    if (navigator.onLine && !document.hidden) {
                        refreshTimer = window.setTimeout(checkConnection, REFRESH_MS);
                    }
                }
            }
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                cancelCheck();
                setIsChecking(false);
            } else {
                void checkConnection();
            }
        }

        refresh.current = checkConnection;
        window.addEventListener("online", checkConnection);
        window.addEventListener("offline", goOffline);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        void checkConnection();

        return () => {
            refresh.current = null;
            window.removeEventListener("online", checkConnection);
            window.removeEventListener("offline", goOffline);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            cancelCheck();
        };
    }, []);

    const status = result.status === "connected" ? describeLatency(result.latency) : statusLabels[result.status];

    return (
        <div id="pingWidget" className="connection-widget">
            <p className="ping-title" title="Browser HTTP request timing. ICMP ping uses network-layer echo requests.">
                Connection
            </p>
            <div className="ping-divider" aria-hidden="true" />
            <button type="button" className="ping-row connection-refresh" aria-label="Check connection"
                aria-describedby={result.status === "connected" ? "connection-description pingValue pingStatus" : "connection-description pingStatus"}
                title="Check HTTP latency to jsDelivr" aria-disabled={isChecking || result.status === "offline"}
                onClick={() => refresh.current?.()}>
                <span className="ping-icon">
                    <Icon name={result.status === "offline" || result.status === "unavailable" ? "triangle-exclamation" : "wifi"} />
                </span>
                <span className="ping-info">
                    <span key={measurement} id="pingValue" className={measurement ? "ping-animate" : undefined}>
                        {result.status === "connected" ? `${result.latency} ms` : "— ms"}
                    </span>
                    <span id="pingStatus" aria-hidden="true">{status}</span>
                </span>
            </button>
            <span id="connection-description" className="visually-hidden">HTTP latency to jsDelivr</span>
            <span className="visually-hidden" role="status">{status}</span>
        </div>
    );
}
