import { Link, useLocation } from "react-router";

const searchPages = [
    { path: "/", label: "Web Search" },
    { path: "/image", label: "Image Search" },
    { path: "/advanced", label: "Advanced Search" },
];

export default function Navigation() {
    const { pathname } = useLocation();

    return (
        <nav className="search-nav" aria-label="Search options">
            <div className="search-dropdown">
                <span className="search-label" tabIndex={0}>
                    Search Options
                    <span className="search-chevron" aria-hidden="true">
                        ▼
                    </span>
                </span>

                <div className="search-menu">
                    {searchPages
                        .filter((page) => page.path !== pathname)
                        .map((page) => (
                            <Link key={page.path} to={page.path}>
                                {page.label}
                            </Link>
                        ))}
                </div>
            </div>
        </nav>
    );
}