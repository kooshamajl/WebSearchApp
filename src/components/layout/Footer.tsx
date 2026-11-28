import { useEffect, useId, useState } from "react";
import Button from "../common/Button";
import Icon from "../common/Icon";
import ThemeToggle from "../common/ThemeToggle";
import { WIDGET_IDS, WIDGETS, type WidgetId } from "../widgets/widgetRegistry";
import { useDropdown } from "../../hooks/useDropdown";
import { useStoredChoice } from "../../hooks/useStoredChoice";
import { formatFooterDate, formatFooterTime } from "../../utils/footerDateTime";

const DATE_FORMAT_KEY = "dateFormat";
const CLOCK_FORMAT_KEY = "clockFormat";

type FooterProps = {
    activeWidget: WidgetId | null;
    onWidgetChange: (widget: WidgetId) => void;
};

function FooterDateTime() {
    const [now, setNow] = useState(() => new Date());
    const [dateFormat, setDateFormat] = useStoredChoice(DATE_FORMAT_KEY, ["persian", "gregorian"]);
    const [clockFormat, setClockFormat] = useStoredChoice(CLOCK_FORMAT_KEY, ["24", "12"]);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    function toggleDateFormat() {
        setDateFormat(dateFormat === "persian" ? "gregorian" : "persian");
    }

    function toggleClockFormat() {
        setClockFormat(clockFormat === "24" ? "12" : "24");
    }

    const timestamp = now.toISOString();

    return (
        <div className="footer-left">
            <Button className="footer-date-card" aria-label="Toggle date format"
                aria-describedby="full-date" icon="calendar-days" onClick={toggleDateFormat}>
                <time key={dateFormat} className="value-pulse" id="full-date" dateTime={timestamp}>{formatFooterDate(now, dateFormat)}</time>
            </Button>

            <Button className="footer-time-card" aria-label="Toggle clock format"
                aria-describedby="full-time" icon="clock" onClick={toggleClockFormat}>
                <time key={clockFormat} className="value-pulse" id="full-time" dateTime={timestamp}>{formatFooterTime(now, clockFormat)}</time>
            </Button>
        </div>
    );
}

export default function Footer({ activeWidget, onWidgetChange }: FooterProps) {
    const widgetMenuId = useId();
    const { isOpen, close, trigger, toggle, openOnHover, disclosureProps } = useDropdown();

    return (
        <footer className="site-footer app-footer">
            <FooterDateTime />
            <div className="footer-right">
                <div className={`widget-dropdown app-widget-dropdown${isOpen ? " open" : ""}`} {...disclosureProps}
                    onPointerLeave={(event) => {
                        if (event.pointerType !== "mouse") return;
                        const focused = document.activeElement;
                        if (event.currentTarget.contains(focused)) {
                            if (focused?.matches(":focus-visible")) return;
                            trigger.current?.focus();
                        }
                        close();
                    }}>
                    <Button ref={trigger} className="widget-label" aria-expanded={isOpen} icon="layer-group"
                        aria-controls={widgetMenuId} onClick={toggle} onPointerEnter={openOnHover}>Widgets</Button>

                    <div className="widget-options" id={widgetMenuId} inert={!isOpen}>
                        {WIDGET_IDS.map((id) => (
                            <button key={id} type="button" className={id === activeWidget ? "active-widget" : undefined}
                                aria-pressed={id === activeWidget} aria-controls="widget-container" onClick={(event) => {
                                    onWidgetChange(id);
                                    const pointer = event.nativeEvent;
                                    if (!(pointer instanceof window.PointerEvent && pointer.pointerType === "mouse")) {
                                        close();
                                        trigger.current?.focus();
                                    }
                                }}>
                                {WIDGETS[id].label}
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
