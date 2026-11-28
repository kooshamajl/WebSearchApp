import { useEffect, useState } from "react";
import { useStoredChoice } from "../../hooks/useStoredChoice";
import { formatFooterDate, formatFooterTime } from "../../utils/footerDateTime";
import Button from "../common/Button";

const DATE_FORMAT_KEY = "dateFormat";
const CLOCK_FORMAT_KEY = "clockFormat";

export default function FooterDateTime() {
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
                <time key={dateFormat} className="value-pulse" id="full-date" dateTime={timestamp}>
                    {formatFooterDate(now, dateFormat)}
                </time>
            </Button>

            <Button className="footer-time-card" aria-label="Toggle clock format"
                aria-describedby="full-time" icon="clock" onClick={toggleClockFormat}>
                <time key={clockFormat} className="value-pulse" id="full-time" dateTime={timestamp}>
                    {formatFooterTime(now, clockFormat)}
                </time>
            </Button>
        </div>
    );
}
