import { useEffect, useState } from "react";
import ThemeToggle from "../common/ThemeToggle";
import { formatFooterDate, formatFooterTime, type ClockFormat, type DateFormat } from "../../utils/footerDateTime";

import "../../../css/footer.css";

const DATE_FORMAT_KEY = "dateFormat";
const CLOCK_FORMAT_KEY = "clockFormat";

function readPreference(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function savePreference(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // The format still applies to the current page when storage is unavailable.
    }
}

export default function Footer() {
    const [now, setNow] = useState(() => new Date());
    const [dateFormat, setDateFormat] = useState<DateFormat>(() =>
        readPreference(DATE_FORMAT_KEY) === "gregorian" ? "gregorian" : "persian"
    );
    const [clockFormat, setClockFormat] = useState<ClockFormat>(() =>
        readPreference(CLOCK_FORMAT_KEY) === "12" ? "12" : "24"
    );

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    function toggleDateFormat() {
        const next = dateFormat === "persian" ? "gregorian" : "persian";
        setDateFormat(next);
        savePreference(DATE_FORMAT_KEY, next);
    }

    function toggleClockFormat() {
        const next = clockFormat === "24" ? "12" : "24";
        setClockFormat(next);
        savePreference(CLOCK_FORMAT_KEY, next);
    }

    const timestamp = now.toISOString();

    return (
        <footer className="site-footer app-footer">
            <div className="footer-left">
                <button type="button" className="footer-date-card" aria-label="Toggle date format"
                    aria-describedby="full-date" onClick={toggleDateFormat}>
                    <time id="full-date" dateTime={timestamp}>{formatFooterDate(now, dateFormat)}</time>
                </button>

                <button type="button" className="footer-time-card" aria-label="Toggle clock format"
                    aria-describedby="full-time" onClick={toggleClockFormat}>
                    <time id="full-time" dateTime={timestamp}>{formatFooterTime(now, clockFormat)}</time>
                </button>
            </div>

            <div className="footer-right">
                <select className="footer-widget-select" aria-label="Widgets" defaultValue="" disabled>
                    <option value="">Widgets</option>
                    <option value="weather">Weather</option>
                    <option value="crypto">Crypto</option>
                    <option value="DailyTask">Task</option>
                    <option value="quick-links">Quick links</option>
                    <option value="ping">Ping</option>
                </select>

                <ThemeToggle />

                <div className="social-icons">
                    <a href="https://github.com/KooshaMajl" target="_blank" rel="noopener">GitHub</a>
                    <a href="https://www.linkedin.com/in/koosha-majlessi-3b609038b" target="_blank" rel="noopener">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
}
