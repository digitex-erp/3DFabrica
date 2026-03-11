import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        if (error) {
          setError(`Authentication error: ${error}`);
          return;
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            setError('Failed to exchange code for session');
            return;
          }
          
          // Redirect to studio after successful auth
          navigate('/studio', { replace: true });
        } else {
          // If no code, check if we already have a session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate('/studio', { replace: true });
          } else {
            setError('No authorization code received');
          }
        }
      } catch (err) {
        setError('An unexpected error occurred');
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Completing authentication...</p>
      </div>
    </div>
  );
}
