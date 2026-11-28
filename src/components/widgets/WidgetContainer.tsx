import { useId } from "react";
import { WIDGETS, type WidgetId } from "./widgetRegistry";

type WidgetContainerProps = {
    activeWidget: WidgetId | null;
};

export default function WidgetContainer({ activeWidget }: WidgetContainerProps) {
    const titleId = useId();
    const widget = activeWidget ? WIDGETS[activeWidget] : null;

    return (
        <div id="widget-container" className="app-widget-container">
            {widget && (
                <section key={activeWidget} className="glass-widget" data-widget={activeWidget} aria-labelledby={titleId}>
                    <h2 className="visually-hidden" id={titleId}>{widget.title}</h2>
                    <widget.Component />
                </section>
            )}
        </div>
    );
}
