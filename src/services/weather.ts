type Coordinates = { latitude: number; longitude: number };
type WeatherLocation = Coordinates & { label: string };

const DEFAULT_LOCATION: WeatherLocation = { latitude: 35.69, longitude: 51.39, label: "Tehran" };

type CurrentWeatherResponse = {
    current?: {
        temperature_2m?: number | null;
        cloud_cover?: number | null;
        apparent_temperature?: number | null;
        wind_speed_10m?: number | null;
        visibility?: number | null;
        relative_humidity_2m?: number | null;
    };
    hourly?: { precipitation?: (number | null)[] };
};

type AirQualityResponse = { current?: { uv_index?: number | null; us_aqi?: number | null } };

export type WeatherConditions = {
    location: WeatherLocation;
    temperature: number;
    clouds: number | null;
    feelsLike: number | null;
    wind: number | null;
    visibility: number | null;
    humidity: number | null;
    precip: number | null;
};

export type AirQuality = { uv: number | null; aqi: number | null };

function finiteNumber(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function coordinateParams({ latitude, longitude }: Coordinates) {
    return new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
}

async function fetchJson(url: string, signal: AbortSignal): Promise<unknown> {
    signal.throwIfAborted();
    const request = new AbortController();
    const abort = () => request.abort();
    const timer = window.setTimeout(abort, 8000);
    signal.addEventListener("abort", abort, { once: true });

    try {
        const response = await fetch(url, { signal: request.signal });
        if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
        return await response.json();
    } finally {
        window.clearTimeout(timer);
        signal.removeEventListener("abort", abort);
    }
}

function getLocalCoordinates(signal: AbortSignal): Promise<Coordinates | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation || signal.aborted) {
            resolve(null);
            return;
        }

        // The browser's timeout can exclude time spent waiting for permission.
        const timer = window.setTimeout(fallback, 5000);
        signal.addEventListener("abort", fallback, { once: true });

        function finish(coordinates: Coordinates | null) {
            window.clearTimeout(timer);
            signal.removeEventListener("abort", fallback);
            resolve(coordinates);
        }

        function fallback() {
            finish(null);
        }

        navigator.geolocation.getCurrentPosition(({ coords }) => {
            finish({
                latitude: Number(coords.latitude.toFixed(2)),
                longitude: Number(coords.longitude.toFixed(2)),
            });
        }, fallback, { timeout: 5000 });
    });
}

async function fetchCurrentWeather(location: WeatherLocation, signal: AbortSignal): Promise<WeatherConditions> {
    const params = coordinateParams(location);
    params.set("current", "temperature_2m,cloud_cover,apparent_temperature,wind_speed_10m,visibility,relative_humidity_2m");
    params.set("wind_speed_unit", "ms");
    params.set("hourly", "precipitation");
    params.set("forecast_hours", "1");

    const response = await fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`, signal) as CurrentWeatherResponse | null;
    const current = response?.current;
    const temperature = finiteNumber(current?.temperature_2m);
    if (temperature === null) throw new Error("Weather response is missing temperature");

    return {
        location,
        temperature,
        clouds: finiteNumber(current?.cloud_cover),
        feelsLike: finiteNumber(current?.apparent_temperature),
        wind: finiteNumber(current?.wind_speed_10m),
        visibility: finiteNumber(current?.visibility),
        humidity: finiteNumber(current?.relative_humidity_2m),
        precip: finiteNumber(response?.hourly?.precipitation?.[0]),
    };
}

export async function getCurrentWeather(signal: AbortSignal): Promise<WeatherConditions> {
    const local = await getLocalCoordinates(signal);
    signal.throwIfAborted();

    if (local) {
        try {
            return await fetchCurrentWeather({ ...local, label: "Local weather" }, signal);
        } catch {
            signal.throwIfAborted();
        }
    }

    return fetchCurrentWeather(DEFAULT_LOCATION, signal);
}

export async function getAirQuality(location: Coordinates, signal: AbortSignal): Promise<AirQuality> {
    const params = coordinateParams(location);
    params.set("current", "uv_index,us_aqi");
    const response = await fetchJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`, signal) as AirQualityResponse | null;
    return { uv: finiteNumber(response?.current?.uv_index), aqi: finiteNumber(response?.current?.us_aqi) };
}

export function getForecastUrl(location: Coordinates): string {
    const params = coordinateParams(location);
    params.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum");
    params.set("timezone", "auto");
    return `https://open-meteo.com/en/docs?${params}`;
}
