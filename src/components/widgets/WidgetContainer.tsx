import { useId } from "react";
import type { ReactNode } from "react";
import { WIDGETS, type WidgetId } from "../../data/widgets";

type WidgetContainerProps = {
    activeWidget: WidgetId | null;
    children?: ReactNode;
};

export default function WidgetContainer({ activeWidget, children }: WidgetContainerProps) {
    const titleId = useId();

    return (
        <div id="widget-container" className="app-widget-container">
            {activeWidget && (
                <section className="glass-widget" aria-labelledby={titleId}>
                    <h2 id={titleId}>{WIDGETS[activeWidget]}</h2>
                    {children ?? <p>Coming soon</p>}
                </section>
            )}
        </div>
    );
}
