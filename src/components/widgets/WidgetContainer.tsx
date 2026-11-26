import { Children, useId } from "react";
import type { ReactNode } from "react";
import { WIDGETS, type WidgetId } from "../../data/widgets";

type WidgetContainerProps = {
    activeWidget: WidgetId | null;
    children?: ReactNode;
};

export default function WidgetContainer({ activeWidget, children }: WidgetContainerProps) {
    const titleId = useId();
    const content = Children.toArray(children);

    return (
        <div id="widget-container" className="app-widget-container">
            {activeWidget && (
                <section className="glass-widget" data-widget={activeWidget} aria-labelledby={titleId}>
                    <h2 id={titleId}>{WIDGETS[activeWidget]}</h2>
                    {content.length > 0 ? content : <p>Coming soon</p>}
                </section>
            )}
        </div>
    );
}
