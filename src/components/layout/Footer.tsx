import { useEffect, useId, useState } from "react";
import Icon from "../common/Icon";
import ThemeToggle from "../common/ThemeToggle";
import { WIDGETS, type WidgetId } from "../../data/widgets";
import { useDropdown } from "../../hooks/useDropdown";
import { formatFooterDate, formatFooterTime, type ClockFormat, type DateFormat } from "../../utils/footerDateTime";

const DATE_FORMAT_KEY = "dateFormat";
const CLOCK_FORMAT_KEY = "clockFormat";

type FooterProps = {
    activeWidget: WidgetId | null;
    onWidgetChange: (widget: WidgetId) => void;
};

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

export default function Footer({ activeWidget, onWidgetChange }: FooterProps) {
    const widgetMenuId = useId();
    const { isOpen, close, trigger, toggle, openOnHover, disclosureProps } = useDropdown();
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
                    <Icon name="calendar-days" />
                    <time key={dateFormat} className="value-pulse" id="full-date" dateTime={timestamp}>{formatFooterDate(now, dateFormat)}</time>
                </button>

                <button type="button" className="footer-time-card" aria-label="Toggle clock format"
                    aria-describedby="full-time" onClick={toggleClockFormat}>
                    <Icon name="clock" />
                    <time key={clockFormat} className="value-pulse" id="full-time" dateTime={timestamp}>{formatFooterTime(now, clockFormat)}</time>
                </button>
            </div>

            <div className="footer-right">
                <div className={`widget-dropdown app-widget-dropdown${isOpen ? " open" : ""}`} {...disclosureProps}>
                    <button ref={trigger} type="button" className="widget-label" aria-expanded={isOpen}
                        aria-controls={widgetMenuId} onClick={toggle} onPointerEnter={openOnHover}>
                        <Icon name="layer-group" /> Widgets
                    </button>

                    <div className="widget-options" id={widgetMenuId} inert={!isOpen}>
                        {(Object.keys(WIDGETS) as WidgetId[]).map((id) => (
                            <button key={id} type="button" className={id === activeWidget ? "active-widget" : undefined}
                                aria-pressed={id === activeWidget} aria-controls="widget-container" onClick={() => {
                                    onWidgetChange(id);
                                    close();
                                    trigger.current?.focus();
                                }}>
                                {WIDGETS[id]}
                            </button>
                        ))}
                    </div>
                </div>

                <ThemeToggle />

                <div className="footer-divider-vertical" aria-hidden="true" />

                <div className="social-icons">
                    <a href="https://github.com/KooshaMajl" target="_blank" rel="noopener" aria-label="GitHub">
                        <Icon name="github" />
                    </a>
                    <a href="https://www.linkedin.com/in/koosha-majlessi-3b609038b" target="_blank" rel="noopener" aria-label="LinkedIn">
                        <Icon name="linkedin" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
