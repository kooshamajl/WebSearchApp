import { useTheme } from "../../hooks/useTheme";
import "../../styles/theme-toggle.css";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            className="theme-toggle"
            aria-label="Dark mode"
            aria-pressed={isDark}
            onClick={toggleTheme}
        >
            <span aria-hidden="true">{isDark ? "☾" : "☀"}</span>
        </button>
    );
}
