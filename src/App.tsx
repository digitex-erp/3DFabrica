import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import Studio from "./pages/Studio";
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p className="flex items-center justify-center min-h-screen">Loading...</p>}>
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
