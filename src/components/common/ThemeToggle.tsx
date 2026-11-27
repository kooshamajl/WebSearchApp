import { useTheme } from "../../hooks/useTheme";
import Icon from "./Icon";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            id="theme-toggle"
            className="theme-toggle"
            aria-label="Dark mode"
            aria-pressed={isDark}
            onClick={toggleTheme}
        >
            <span id="theme-icon" aria-hidden="true">
                <Icon name="sun" className="theme-glyph theme-glyph--sun" />
                <Icon name="moon" className="theme-glyph theme-glyph--moon" />
            </span>
        </button>
    );
}
