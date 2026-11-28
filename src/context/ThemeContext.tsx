import { createContext, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeState = {
    theme: Theme;
    toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() =>
        document.documentElement.dataset.theme === "dark" ? "dark" : "light"
    );

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    function toggleTheme() {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);

        try {
            // Uses the same key as the theme bootstrap in index.html.
            localStorage.setItem("theme", nextTheme);
        } catch {
            // The theme can still change for the current session.
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
