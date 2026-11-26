import { Routes, Route } from "react-router";
import AppLayout from "./components/layout/AppLayout";
import WebSearch from "./pages/WebSearch";
import ImageSearch from "./pages/ImageSearch";
import AdvancedSearch from "./pages/AdvancedSearch";

export default function App() {
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