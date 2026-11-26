import { useEffect, useState } from "react";
import { getAirQuality, getCurrentWeather, getForecastUrl, type AirQuality, type WeatherConditions } from "../../services/weather";
import "../../../css/widgets.css";

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

function readPreference<T extends string>(key: string, options: readonly [T, ...T[]]): T {
    try {
        const saved = localStorage.getItem(key);
        return options.find((option) => option === saved) ?? options[0];
    } catch {
        return options[0];
    }
}

function savePreference(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // The controls still work when storage is unavailable.
    }
}

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
    const [unit, setUnit] = useState<Unit>(() => readPreference(UNIT_KEY, ["C", "F"]));
    const [left, setLeft] = useState(() => readPreference(LEFT_METRIC_KEY, LEFT_METRICS));
    const [right, setRight] = useState(() => readPreference(RIGHT_METRIC_KEY, RIGHT_METRICS));

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

    return (
        <div className="weather-widget" id="weather">
            <p id="city">{reading.location.label}</p>
            <button id="temp" type="button" aria-label={`Toggle temperature unit. ${temperature}°${unit}`} onClick={() => {
                const next = unit === "C" ? "F" : "C";
                setUnit(next);
                savePreference(UNIT_KEY, next);
            }}>
                <span>{temperature}</span><span className="weather-unit">°{unit}</span>
            </button>

            <div className="weather-divider" aria-hidden="true" />
            <div className="weather-details">
                <button type="button" className="weather-detail" aria-label={`Cycle left weather metric. ${labels[left]}, ${leftValue}`} onClick={() => {
                    const next = nextMetric(LEFT_METRICS, left);
                    setLeft(next);
                    savePreference(LEFT_METRIC_KEY, next);
                }}>
                    <span className="weather-detail-label">{labels[left]}</span>
                    <span className="weather-detail-value">{leftValue}</span>
                </button>
                <div className="weather-detail-sep" aria-hidden="true" />
                <button type="button" className="weather-detail" aria-label={`Cycle right weather metric. ${labels[right]}, ${rightValue}`} onClick={() => {
                    const next = nextMetric(RIGHT_METRICS, right);
                    setRight(next);
                    savePreference(RIGHT_METRIC_KEY, next);
                }}>
                    <span className="weather-detail-label">{labels[right]}</span>
                    <span className="weather-detail-value">{rightValue}</span>
                </button>
            </div>

            <div className="weather-divider" aria-hidden="true" />
            <a className="weather-forecast-link" href={getForecastUrl(reading.location)} target="_blank" rel="noopener">View forecast</a>
            <small className="weather-attribution">
                <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>
                {" · "}
                <a href="https://atmosphere.copernicus.eu/" target="_blank" rel="noopener">CAMS ENSEMBLE</a>
            </small>
        </div>
    );
}
