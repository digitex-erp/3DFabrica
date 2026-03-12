import { Suspense, useEffect, useState } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import Studio from "./pages/Studio";
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import routes from "tempo-routes";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  console.log("App: Component rendering...", { url: window.location.pathname });

  useEffect(() => {
    console.log("App: Initializing environment...");
    // Check if variables are available
    console.log("App: Supabase URL available?", !!import.meta.env.VITE_SUPABASE_URL);
    
    // Brief delay to ensure styles and initial assets are ready for screenshots
    const timer = setTimeout(() => {
      console.log("App: Setting isLoaded to true");
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">3D Fabrica...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white">Loading...</div>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/studio" 
            element={
              <ProtectedRoute>
                <Studio />
              </ProtectedRoute>
            } 
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
