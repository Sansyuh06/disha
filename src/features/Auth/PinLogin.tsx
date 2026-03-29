import React, { useState } from 'react';
import { useCustomer } from '../../contexts/CustomerContext';
import { verifyPin } from '../../utils/mockBank';
import DishaLogo from '../../components/DishaLogo';
import { useNavigate } from 'react-router-dom';

export default function PinLogin({ onComplete }: { onComplete: () => void }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useCustomer();
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const profile = await verifyPin(pin);
      if (profile) {
        dispatch({ type: 'SET_CUSTOMER_PROFILE', profile });
        // Automatically set intent properties based on persona
        if (profile.type === 'elderly') {
          dispatch({
            type: 'SET_INTENT',
            profile: {
              intent: 'General inquiry',
              taskType: 'General',
              userType: 'elderly',
              emotion: 'normal',
              uiMode: 'simplified',
              autoRoute: null,
              confidence: 0.95
            }
          });
        }
        else if (profile.type === 'youth') {
          dispatch({
            type: 'SET_INTENT',
            profile: {
              intent: 'Salary or First Job',
              taskType: 'General',
              userType: 'firstTime',
              emotion: 'normal',
              uiMode: 'standard',
              autoRoute: null,
              confidence: 0.95
            }
          });
        }
        onComplete();
      } else {
        setError('Invalid PIN. Hint: Try 1111, 2222, or 3333');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--navy-900)' }}>
      {/* Background patterns */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, var(--teal), transparent 50%)`,
          backgroundSize: '100vw 100vh',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="bg-white p-8 rounded-3xl shadow-2xl relative w-full max-w-sm animate-fade-in-up">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center mb-6">
          <DishaLogo size={40} />
          <h2 className="mt-4 font-heading text-2xl font-bold" style={{ color: 'var(--navy-900)' }}>Secure Access</h2>
          <p className="text-sm mt-1 text-center" style={{ color: 'var(--text-muted)' }}>
            Enter your 4-digit PIN or biometrics to access your personalized dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="••••"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              className="w-full text-center tracking-[1em] text-3xl font-heading font-bold py-4 rounded-xl border-2 focus:outline-none transition-colors"
              style={{
                borderColor: error ? '#EF4444' : pin.length === 4 ? 'var(--teal)' : 'var(--border)',
                color: 'var(--navy-900)'
              }}
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-red-500 text-center animate-fade-in">{error}</p>}

          <button
            onClick={handleVerify}
            disabled={loading || pin.length !== 4}
            className="w-full py-4 rounded-xl text-white font-semibold text-sm transition-all"
            style={{ 
              backgroundColor: pin.length === 4 && !loading ? 'var(--teal)' : 'var(--border-2)',
              cursor: pin.length === 4 && !loading ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? 'Authenticating...' : 'Authenticate securely'}
          </button>
        </div>
        
        <p className="text-[10px] text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          Powered by Union Bank of India Local Authentication
        </p>
      </div>
    </div>
  );
}
