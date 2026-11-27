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
            <span id="theme-icon"><Icon name={isDark ? "moon" : "sun"} /></span>
        </button>
    );
}
