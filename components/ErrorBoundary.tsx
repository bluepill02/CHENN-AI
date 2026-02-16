import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { IllustratedIcon, ChennaiIcons } from './IllustratedIcon';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chennai Community App Error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center px-6">
      <Card className="p-6 max-w-md w-full text-center bg-white/95 backdrop-blur-sm shadow-xl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          ஏதோ தவறு நடந்துவிட்டது
        </h1>
        <p className="text-gray-600 mb-2">Something went wrong</p>
        
        <p className="text-sm text-gray-500 mb-6">
          நம்ம Chennai app-ல ஒரு சிறிய பிரச்சினை. மீண்டும் முயற்சி செய்யுங்கள்.
        </p>

        {error && (
          <Card className="p-3 bg-red-50 border-red-200 mb-4 text-left">
            <p className="text-xs text-red-600 font-mono">
              {error.message}
            </p>
          </Card>
        )}
        
        <div className="space-y-3">
          <Button 
            onClick={resetError}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            மீண்டும் முயற்சி செய்யுங்கள் • Try Again
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full border-orange-200 hover:bg-orange-50"
          >
            App-ஐ Restart பண்ணுங்க • Restart App
          </Button>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <IllustratedIcon src={ChennaiIcons.temple} alt="Chennai" size="sm" className="w-4 h-4" />
          <span>Made with ❤️ for Chennai</span>
        </div>
      </Card>
    </div>
  );
}

export default ErrorBoundary;