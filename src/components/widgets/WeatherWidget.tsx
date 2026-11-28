import { useEffect, useState } from "react";
import Icon from "../common/Icon";
import { useStoredChoice } from "../../hooks/useStoredChoice";
import { getAirQuality, getCurrentWeather, getForecastUrl, type AirQuality, type WeatherConditions } from "../../services/weather";
const LEFT_METRICS = ["clouds", "feelsLike", "wind", "visibility"] as const;
const RIGHT_METRICS = ["humidity", "uv", "aqi", "precip"] as const;
const UNIT_KEY = "weatherUnit";
const LEFT_METRIC_KEY = "weatherLeftMetric";
const RIGHT_METRIC_KEY = "weatherRightMetric";

type Unit = "C" | "F";
type Metric = (typeof LEFT_METRICS | typeof RIGHT_METRICS)[number];
type Reading = WeatherConditions & AirQuality;
type WeatherState = { status: "loading" } | { status: "error" } | { status: "ready"; reading: Reading };

const labels: Record<Metric, string> = {
    clouds: "Clouds", feelsLike: "Feels Like", wind: "Wind", visibility: "Visibility",
    humidity: "Humidity", uv: "UV Index", aqi: "AQI", precip: "Precip (1 hr)",
};

function nextMetric<T extends Metric>(options: readonly T[], current: T): T {
    return options[(options.indexOf(current) + 1) % options.length];
}

function roundedTemperature(celsius: number, unit: Unit): number {
    return Math.round(unit === "F" ? celsius * 9 / 5 + 32 : celsius);
}

function formatMetric(metric: Metric, reading: Reading, unit: Unit): string {
    const value = reading[metric];
    if (value === null) return "N/A";

    switch (metric) {
        case "clouds":
        case "humidity": return `${value}%`;
        case "feelsLike": return `${roundedTemperature(value, unit)}°${unit}`;
        case "wind": return `${Math.round(value)} m/s`;
        case "visibility": return `${(value / 1000).toFixed(1)} km`;
        case "precip": return `${value} mm`;
        case "uv":
        case "aqi": return String(Math.round(value));
    }
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherState>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);
    const [unit, setUnit] = useStoredChoice(UNIT_KEY, ["C", "F"]);
    const [left, setLeft] = useStoredChoice(LEFT_METRIC_KEY, LEFT_METRICS);
    const [right, setRight] = useStoredChoice(RIGHT_METRIC_KEY, RIGHT_METRICS);
    const [changed, setChanged] = useState({ temperature: false, left: false, right: false });

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        async function loadWeather() {
            let conditions: WeatherConditions;
            try {
                conditions = await getCurrentWeather(signal);
            } catch {
                if (!signal.aborted) setWeather({ status: "error" });
                return;
            }

            if (signal.aborted) return;
            setWeather({ status: "ready", reading: { ...conditions, uv: null, aqi: null } });

            try {
                const air = await getAirQuality(conditions.location, signal);
                if (!signal.aborted) setWeather({ status: "ready", reading: { ...conditions, ...air } });
            } catch {
                // Optional metrics can be unavailable while current weather is still usable.
            }
        }

        void loadWeather();
        return () => controller.abort();
    }, [attempt]);

    if (weather.status === "loading") return <p role="status">Loading weather…</p>;
    if (weather.status === "error") {
        return (
            <div className="weather-widget">
                <p role="alert">Weather unavailable. Check your connection and try again.</p>
                <button type="button" className="weather-retry" onClick={() => {
                    setWeather({ status: "loading" });
                    setAttempt(attempt + 1);
                }}>Try again</button>
            </div>
        );
    }

    const { reading } = weather;
    const temperature = roundedTemperature(reading.temperature, unit);
    const leftValue = formatMetric(left, reading, unit);
    const rightValue = formatMetric(right, reading, unit);
    const showsAirQuality = (right === "uv" || right === "aqi") && reading[right] !== null;

    return (
        <div className="weather-widget" id="weather">
            <p id="city">{reading.location.label}</p>
            <div className="weather-temperature">
                <button id="temp" type="button" aria-label={`Toggle temperature unit. ${temperature}°${unit}`} onClick={() => {
                    const next = unit === "C" ? "F" : "C";
                    setUnit(next);
                    setChanged((previous) => ({ ...previous, temperature: true }));
                }}>
                    <span key={unit} className={changed.temperature ? "value-pulse" : undefined}>{temperature}</span>{" "}
                    <span className="weather-unit">°{unit}</span>
                </button>
                <a className="weather-source" href="https://open-meteo.com/en/licence" target="_blank" rel="noopener"
                    title="Open-Meteo data licence (CC BY 4.0). Values rounded and units converted for display.">Open-Meteo</a>
            </div>

            <div className="weather-divider" aria-hidden="true" />
            <div className="weather-details">
                <button type="button" className="weather-detail" aria-label={`Cycle left weather metric. ${labels[left]}, ${leftValue}`} onClick={() => {
                    const next = nextMetric(LEFT_METRICS, left);
                    setLeft(next);
                    setChanged((previous) => ({ ...previous, left: true }));
                }}>
                    <span className="weather-detail-label">{labels[left]}</span>
                    <span key={left} className={`weather-detail-value${changed.left ? " value-pulse" : ""}`}>{leftValue}</span>
                </button>
                <div className="weather-detail-sep" aria-hidden="true" />
                <button type="button" className="weather-detail" aria-label={`Cycle right weather metric. ${labels[right]}, ${rightValue}`} onClick={() => {
                    const next = nextMetric(RIGHT_METRICS, right);
                    setRight(next);
                    setChanged((previous) => ({ ...previous, right: true }));
                }}>
                    <span className="weather-detail-label">{labels[right]}</span>
                    <span key={right} className={`weather-detail-value${changed.right ? " value-pulse" : ""}`}>{rightValue}</span>
                </button>
            </div>
            {showsAirQuality && (
                <a className="weather-source" href="https://atmosphere.copernicus.eu/" target="_blank" rel="noopener">
                    CAMS ENSEMBLE
                </a>
            )}

            <div className="weather-divider" aria-hidden="true" />
            <a className="weather-forecast-link" href={getForecastUrl(reading.location)} target="_blank" rel="noopener">
                View forecast <Icon name="arrow-right" />
            </a>
        </div>
    );
}
