import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  console.log("ProtectedRoute: Checking auth state...", { current: isAuthenticated });

  useEffect(() => {
    const checkAuth = async () => {
      console.log("ProtectedRoute: Fetching initial session...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("ProtectedRoute: Initial session result:", !!session);
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("ProtectedRoute: Auth state change event:", _event, "Session exists?", !!session);
      setIsAuthenticated(!!session);
    });

    return () => {
      console.log("ProtectedRoute: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    console.log("ProtectedRoute: Rendering loading state...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the location they were trying to access
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
