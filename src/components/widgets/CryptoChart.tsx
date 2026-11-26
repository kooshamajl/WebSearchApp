import { useEffect, useRef } from "react";
import type { PricePoint } from "../../services/crypto";

function drawChart(canvas: HTMLCanvasElement, data: readonly PricePoint[]) {
    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!ctx || data.length < 2 || width <= 8 || height <= 8) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const first = data[0];
    const last = data[data.length - 1];
    const values = data.map(({ price }) => price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.15 || 1;
    const color = getComputedStyle(canvas).getPropertyValue(last.price >= first.price ? "--neon-success" : "--neon-danger").trim();
    const points = data.map(({ timestamp, price }) => ({
        x: 4 + (timestamp - first.timestamp) / (last.timestamp - first.timestamp) * (width - 8),
        y: height - 4 - (price - min + padding) / (max - min + padding * 2) * (height - 8),
    }));

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let index = 0; index < points.length - 1; index++) {
        const previous = points[Math.max(index - 1, 0)];
        const start = points[index];
        const end = points[index + 1];
        const next = points[Math.min(index + 2, points.length - 1)];

        ctx.bezierCurveTo(
            start.x + (end.x - previous.x) / 6,
            start.y + (end.y - previous.y) / 6,
            end.x - (next.x - start.x) / 6,
            end.y - (next.y - start.y) / 6,
            end.x, end.y,
        );
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.globalAlpha = .32;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 1;
    ctx.stroke();

    const end = points[points.length - 1];
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "transparent");
    ctx.lineTo(end.x, height);
    ctx.lineTo(points[0].x, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.globalAlpha = .45;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(end.x, end.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 1;
    ctx.fill();
}

export default function CryptoChart({ points }: { points: readonly PricePoint[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const redraw = () => drawChart(canvas, points);
        const observer = new ResizeObserver(redraw);
        observer.observe(canvas);
        window.addEventListener("resize", redraw);
        redraw();

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", redraw);
        };
    }, [points]);

    return (
        <a className="chart-container" href="https://www.coingecko.com/en/coins/bitcoin"
            aria-label="Open Bitcoin chart on CoinGecko" target="_blank" rel="noopener">
            <canvas ref={canvasRef} id="cryptoChart" aria-hidden="true" />
        </a>
    );
}
