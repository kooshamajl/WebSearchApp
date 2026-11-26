import type { ReactNode } from "react";
import Navigation from "./Navigation";

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <main>
            <Navigation />
            {children}
        </main>
    );
}