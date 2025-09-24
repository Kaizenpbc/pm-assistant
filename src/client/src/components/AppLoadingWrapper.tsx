import React, { useState, useEffect } from 'react';
import EnhancedLoadingSpinner from './EnhancedLoadingSpinner';
import { DashboardSkeleton } from './SkeletonLoader';

interface AppLoadingWrapperProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const AppLoadingWrapper: React.FC<AppLoadingWrapperProps> = ({
  children,
  fallbackMessage = 'Loading your project management workspace...'
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Initializing...');

  useEffect(() => {
    // Simulate loading progress with realistic steps
    const loadingSteps = [
      { step: 'Initializing application...', progress: 10 },
      { step: 'Loading security features...', progress: 25 },
      { step: 'Preparing AI components...', progress: 40 },
      { step: 'Connecting to database...', progress: 60 },
      { step: 'Loading user interface...', progress: 80 },
      { step: 'Finalizing setup...', progress: 95 },
      { step: 'Ready!', progress: 100 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const { step, progress } = loadingSteps[currentStep];
        setLoadingStep(step);
        setLoadingProgress(progress);
        currentStep++;
      } else {
        clearInterval(interval);
        // Small delay before showing the app
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    }, 800); // 800ms per step for realistic loading experience

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Show loading screen while loading
  if (isLoading) {
    // Show skeleton loader for better perceived performance
    if (loadingProgress > 50) {
      return <DashboardSkeleton />;
    }
    
    // Show detailed loading spinner for initial load
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
          <EnhancedLoadingSpinner
            message={loadingStep}
            size="large"
            variant="detailed"
            showProgress={true}
            progress={loadingProgress}
          />
          
          <div className="mt-6 text-center">
            <p className="text-white/80 text-sm">
              {fallbackMessage}
            </p>
            
            <div className="mt-4 space-y-2 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Security</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span>AI Features</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span>PWA Support</span>
                <span className="text-green-400">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the actual app once loading is complete
  return <>{children}</>;
};

export default AppLoadingWrapper;
