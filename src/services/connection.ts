const CHECK_URL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";

export async function measureHttpLatency(signal: AbortSignal): Promise<number> {
    const start = performance.now();
    const response = await fetch(CHECK_URL, {
        method: "HEAD",
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal,
    });

    if (!response.ok) throw new Error(`Connection check failed (${response.status})`);
    return Math.round(performance.now() - start);
}

export function describeLatency(ms: number): "Excellent" | "Normal" | "Bad" {
    if (ms < 100) return "Excellent";
    if (ms < 300) return "Normal";
    return "Bad";
}
