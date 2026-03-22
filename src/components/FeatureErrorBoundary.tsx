import React, { Component, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class FeatureErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.error?.message ?? 'Unknown error'} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-surface">
      <div className="max-w-md w-full">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-heading font-semibold text-red-800 mb-2">
            Something went wrong with this feature
          </h3>
          <p className="text-red-600 text-sm mb-6 font-mono bg-red-100 rounded p-3">{message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm"
              style={{ backgroundColor: 'var(--teal)' }}
            >
              Reload
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-gray-100 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
