import { Component, Suspense, useId, type ReactNode } from "react";
import { WIDGETS, type WidgetId } from "./widgetRegistry";

type WidgetContainerProps = {
    activeWidget: WidgetId | null;
};

class WidgetErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (this.state.failed) {
            return (
                <div>
                    <p role="alert">Could not load this widget.</p>
                    <button type="button" onClick={() => window.location.reload()}>Reload page</button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function WidgetContainer({ activeWidget }: WidgetContainerProps) {
    const titleId = useId();
    const widget = activeWidget ? WIDGETS[activeWidget] : null;

    return (
        <div id="widget-container" className="app-widget-container">
            {widget && (
                <section key={activeWidget} className="glass-widget" data-widget={activeWidget} aria-labelledby={titleId}>
                    <h2 className="visually-hidden" id={titleId}>{widget.title}</h2>
                    <WidgetErrorBoundary>
                        <Suspense fallback={<p role="status">Loading widget…</p>}>
                            <widget.Component />
                        </Suspense>
                    </WidgetErrorBoundary>
                </section>
            )}
        </div>
    );
}
