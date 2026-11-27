import { useEffect } from "react";
import { matchPath, Routes, Route, useLocation } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import WebSearch from "./pages/WebSearch";
import ImageSearch from "./pages/ImageSearch";
import AdvancedSearch from "./pages/AdvancedSearch";

export default function App() {
    const { pathname } = useLocation();

    useEffect(() => {
        const page = matchPath("/advanced", pathname) ? "Advanced Search"
            : matchPath("/image", pathname) ? "Image Search" : "Web Search";
        document.title = `${page} | Web Search App`;
    }, [pathname]);

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
