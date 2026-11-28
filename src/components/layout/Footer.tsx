import { useId } from "react";
import { useDropdown } from "../../hooks/useDropdown";
import Button from "../common/Button";
import Icon from "../common/Icon";
import ThemeToggle from "../common/ThemeToggle";
import { WIDGET_IDS, WIDGETS, type WidgetId } from "../widgets/widgetRegistry";
import FooterDateTime from "./FooterDateTime";

type FooterProps = {
    activeWidget: WidgetId | null;
    onWidgetChange: (widget: WidgetId) => void;
};

export default function Footer({ activeWidget, onWidgetChange }: FooterProps) {
    const widgetMenuId = useId();
    const { isOpen, close, trigger, toggle, openOnHover, disclosureProps } = useDropdown();

    return (
        <footer className="site-footer app-footer">
            <FooterDateTime />
            <div className="footer-right">
                <div className={`widget-dropdown app-widget-dropdown${isOpen ? " open" : ""}`} {...disclosureProps}
                    onPointerLeave={(event) => {
                        if (event.pointerType !== "mouse") return;
                        const focused = document.activeElement;
                        if (event.currentTarget.contains(focused)) {
                            if (focused?.matches(":focus-visible")) return;
                            trigger.current?.focus();
                        }
                        close();
                    }}>
                    <Button ref={trigger} className="widget-label" aria-expanded={isOpen} icon="layer-group"
                        aria-controls={widgetMenuId} onClick={toggle} onPointerEnter={openOnHover}>Widgets</Button>

                    <div className="widget-options" id={widgetMenuId} inert={!isOpen}>
                        {WIDGET_IDS.map((id) => (
                            <button key={id} type="button" className={id === activeWidget ? "active-widget" : undefined}
                                aria-pressed={id === activeWidget} aria-controls="widget-container" onClick={(event) => {
                                    onWidgetChange(id);
                                    const pointer = event.nativeEvent;
                                    if (!(pointer instanceof window.PointerEvent && pointer.pointerType === "mouse")) {
                                        close();
                                        trigger.current?.focus();
                                    }
                                }}>
                                {WIDGETS[id].label}
                            </button>
                        ))}
                    </div>
                </div>

                <ThemeToggle />

                <div className="footer-divider-vertical" aria-hidden="true" />

                <div className="social-icons">
                    <a href="https://github.com/KooshaMajl" target="_blank" rel="noopener" aria-label="GitHub">
                        <Icon name="github" />
                    </a>
                    <a href="https://www.linkedin.com/in/koosha-majlessi-3b609038b" target="_blank" rel="noopener" aria-label="LinkedIn">
                        <Icon name="linkedin" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
