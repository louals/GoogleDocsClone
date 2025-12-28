import { auth } from '../firebase-config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import '../styles/AuthForm.css';

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Optional: Force account selection
      provider.setCustomParameters({ prompt: 'select_account' });
      
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="google-auth-container">
      <div className="google-auth-card">
        <div className="google-auth-brand">
          <img 
            src="/document.png" 
            alt="Google Docs Logo" 
            className="main-logo"
          />
          <h1>Docs</h1>
          <p>Use your Google Account to continue to Docs</p>
        </div>

        {error && <div className="auth-error-pill">{error}</div>}

        <div className="google-btn-wrapper">
          <button 
            onClick={handleGoogleSignIn} 
            className={`google-sign-in-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            <div className="google-icon-wrapper">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span className="btn-text">
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>
        </div>

        <div className="google-auth-footer">
          <p>To continue, Google will share your name, email address, language preference, and profile picture with Docs Clone.</p>
        </div>
      </div>
    </div>
  );
};