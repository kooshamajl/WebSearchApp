import { Children, useId } from "react";
import type { ReactNode } from "react";
import { WIDGETS, type WidgetId } from "../../data/widgets";

type WidgetContainerProps = {
    activeWidget: WidgetId | null;
    children?: ReactNode;
};

const panelTitles: Partial<Record<WidgetId, string>> = { DailyTask: "Daily Tasks", ping: "Connection" };

export default function WidgetContainer({ activeWidget, children }: WidgetContainerProps) {
    const titleId = useId();
    const content = Children.toArray(children);

    return (
        <div id="widget-container" className="app-widget-container">
            {activeWidget && (
                <section key={activeWidget} className="glass-widget" data-widget={activeWidget} aria-labelledby={titleId}>
                    <h2 className="visually-hidden" id={titleId}>{panelTitles[activeWidget] ?? WIDGETS[activeWidget]}</h2>
                    {content.length > 0 ? content : <p>Coming soon</p>}
                </section>
            )}
        </div>
    );
}
