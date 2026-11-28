import type { ReactNode } from "react";
import { useActiveWidget } from "../../hooks/useActiveWidget";
import WidgetContainer from "../widgets/WidgetContainer";
import Footer from "./Footer";
import Navigation from "./Navigation";

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { activeWidget, selectWidget } = useActiveWidget();

    return (
        <div className="app-layout">
            <main>
                <Navigation />
                {children}
                <WidgetContainer activeWidget={activeWidget} />
            </main>
            <Footer activeWidget={activeWidget} onWidgetChange={selectWidget} />
        </div>
    );
}
