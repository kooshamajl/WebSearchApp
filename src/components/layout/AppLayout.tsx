import type { ReactNode } from "react";
import ThemeToggle from "../common/ThemeToggle";
import Navigation from "./Navigation";

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <main>
            <Navigation />
            <div className="app-theme-control">
                <ThemeToggle />
            </div>
            {children}
        </main>
    );
}
