import { NavLink } from "react-router";

const searchPages = [
    { path: "/", label: "Web Search", text: "Web" },
    { path: "/image", label: "Image Search", text: "Image" },
    { path: "/advanced", label: "Advanced Search", text: "Advanced" },
];

export default function Navigation() {
    return (
        <nav className="search-mode-nav" aria-label="Search options">
            {searchPages.map(({ path, label, text }) => (
                <NavLink key={path} to={path} end aria-label={label}>{text}</NavLink>
            ))}
        </nav>
    );
}
