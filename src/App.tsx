import { useEffect } from "react";
import { matchPath, Navigate, Routes, Route, useLocation } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import WebSearch from "./pages/WebSearch";
import ImageSearch from "./pages/ImageSearch";
import AdvancedSearch from "./pages/AdvancedSearch";

const legacyPaths: Readonly<Record<string, string | undefined>> = {
    "/html/web.html": "/",
    "/html/image.html": "/image",
    "/html/advanced.html": "/advanced",
};

export default function App() {
    const { pathname, search, hash } = useLocation();
    const destination = legacyPaths[pathname];

    useEffect(() => {
        if (destination) return;
        const page = matchPath("/advanced", pathname) ? "Advanced Search"
            : matchPath("/image", pathname) ? "Image Search" : "Web Search";
        document.title = `${page} | Web Search App`;
    }, [destination, pathname]);

    if (destination) return <Navigate to={{ pathname: destination, search, hash }} replace />;

    return (
        <AppLayout>
            <Routes>
                <Route path="/" element={<WebSearch />} />
                <Route path="/image" element={<ImageSearch />} />
                <Route path="/advanced" element={<AdvancedSearch />} />
            </Routes>
        </AppLayout>
    );
}
