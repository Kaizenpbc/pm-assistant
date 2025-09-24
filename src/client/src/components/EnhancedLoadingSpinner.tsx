import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'detailed';
  showProgress?: boolean;
  progress?: number;
}

export const EnhancedLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  variant = 'default',
  showProgress = false,
  progress = 0
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center">
        <div className={`${getSpinnerSize()} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}></div>
        {message && <span className="ml-2 text-sm text-gray-600">{message}</span>}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
        <div className="relative">
          {/* Main spinner */}
          <div className={`${getSizeClasses()} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
          
          {/* Inner pulsing dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{message}</h3>
          
          {showProgress && (
            <div className="w-64 bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
          )}
          
          <div className="space-y-1 text-sm text-gray-600">
            <p className="flex items-center justify-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Initializing application
            </p>
            <p className="flex items-center justify-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              Loading components
            </p>
            <p className="flex items-center justify-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              Preparing workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="relative mb-6">
        {/* Outer ring */}
        <div className={`${getSizeClasses()} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
        
        {/* Middle ring */}
        <div className={`${getSizeClasses()} absolute top-0 left-0 border-4 border-transparent border-r-purple-600 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Inner dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-2">PM Application v2</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      
      {showProgress && (
        <div className="w-48 bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default EnhancedLoadingSpinner;
