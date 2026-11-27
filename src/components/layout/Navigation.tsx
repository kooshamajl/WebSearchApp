import { useId } from "react";
import { Link, useLocation } from "react-router";
import { useDropdown } from "../../hooks/useDropdown";
import Icon from "../common/Icon";

const searchPages = [
    { path: "/advanced", label: "Advanced Search" },
    { path: "/image", label: "Image Search" },
    { path: "/", label: "Web Search" },
];

export default function Navigation() {
    const { pathname } = useLocation();
    const menuId = useId();
    const { isOpen, close, trigger, toggle, openOnHover, disclosureProps } = useDropdown();

    return (
        <nav className="search-nav" aria-label="Search options">
            <div className={`search-dropdown app-search-dropdown${isOpen ? " open" : ""}`} {...disclosureProps}>
                <button ref={trigger} type="button" className="search-label" aria-expanded={isOpen}
                    aria-controls={menuId} onClick={toggle} onPointerEnter={openOnHover}>
                    Search Options <Icon name="chevron-down" className="search-chevron" />
                </button>

                <div className="search-menu" id={menuId} inert={!isOpen}>
                    {searchPages.filter(({ path }) => path !== pathname).map(({ path, label }) => (
                        <Link key={path} to={path} onClick={() => {
                            close();
                            trigger.current?.focus();
                        }}>{label}</Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
