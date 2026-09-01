import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Chatbot } from "./components/chat/Chatbot";
import { Landing } from "./pages/Landing";
import { Apply } from "./pages/Apply";
import { Results } from "./pages/Results";
import { SchemeRecommender } from "./pages/SchemeRecommender";

/** Scroll to top on route change (skip it for in-page anchors). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/recommender" element={<SchemeRecommender />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
