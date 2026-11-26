import type { ReactNode } from "react";
import { useActiveWidget } from "../../hooks/useActiveWidget";
import ConnectionWidget from "../widgets/ConnectionWidget";
import CryptoWidget from "../widgets/CryptoWidget";
import DailyTasksWidget from "../widgets/DailyTasksWidget";
import QuickLinksWidget from "../widgets/QuickLinksWidget";
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
                    {activeWidget === "DailyTask" ? <DailyTasksWidget /> : null}
                    {activeWidget === "quick-links" ? <QuickLinksWidget /> : null}
                    {activeWidget === "ping" ? <ConnectionWidget /> : null}
                </WidgetContainer>
            </main>
            <Footer activeWidget={activeWidget} onWidgetChange={selectWidget} />
        </div>
    );
}
