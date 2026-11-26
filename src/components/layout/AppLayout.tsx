import type { ReactNode } from "react";
import Footer from "./Footer";
import Navigation from "./Navigation";

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="app-layout">
            <main>
                <Navigation />
                {children}
            </main>
            <Footer />
        </div>
    );
}
