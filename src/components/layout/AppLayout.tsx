import type { ReactNode } from "react";
import { useActiveWidget } from "../../hooks/useActiveWidget";
import CryptoWidget from "../widgets/CryptoWidget";
import WeatherWidget from "../widgets/WeatherWidget";
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
                <WidgetContainer activeWidget={activeWidget}>
                    {activeWidget === "weather" ? <WeatherWidget /> : null}
                    {activeWidget === "crypto" ? <CryptoWidget /> : null}
                </WidgetContainer>
            </main>
            <Footer activeWidget={activeWidget} onWidgetChange={selectWidget} />
        </div>
    );
}
