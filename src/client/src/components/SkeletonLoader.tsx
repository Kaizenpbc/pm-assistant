import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'dashboard' | 'schedule';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full rounded';
      case 'circular':
        return 'rounded-full';
      case 'dashboard':
        return 'h-32 w-full rounded-lg';
      case 'schedule':
        return 'h-16 w-full rounded-md';
      default:
        return 'w-full rounded';
    }
  };

  const getDimensions = () => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
    if (height) styles.height = typeof height === 'number' ? `${height}px` : height;
    return styles;
  };

  return (
    <div
      className={`skeleton-loader ${getVariantStyles()} ${className}`}
      style={getDimensions()}
      aria-label="Loading content"
      role="status"
    >
      <span className="sr-only">Loading content...</span>
    </div>
  );
};

// Dashboard Skeleton Component
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6" role="status" aria-label="Loading dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" width="200px" height="32px" />
        <SkeletonLoader variant="circular" width="40px" height="40px" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <SkeletonLoader variant="text" width="100px" height="20px" className="mb-2" />
            <SkeletonLoader variant="text" width="60px" height="32px" className="mb-1" />
            <SkeletonLoader variant="text" width="80px" height="16px" />
          </div>
        ))}
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <SkeletonLoader variant="text" width="150px" height="24px" />
        </div>
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SkeletonLoader variant="circular" width="48px" height="48px" />
                <div>
                  <SkeletonLoader variant="text" width="200px" height="20px" className="mb-2" />
                  <SkeletonLoader variant="text" width="120px" height="16px" />
                </div>
              </div>
              <SkeletonLoader variant="rectangular" width="80px" height="32px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Schedule Page Skeleton Component
export const ScheduleSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6" role="status" aria-label="Loading schedule">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" width="300px" height="32px" />
        <div className="flex space-x-2">
          <SkeletonLoader variant="rectangular" width="120px" height="40px" />
          <SkeletonLoader variant="rectangular" width="100px" height="40px" />
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <SkeletonLoader variant="text" width="200px" height="24px" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">
                  <SkeletonLoader variant="text" width="100px" height="20px" />
                </th>
                <th className="px-4 py-3 text-left">
                  <SkeletonLoader variant="text" width="80px" height="20px" />
                </th>
                <th className="px-4 py-3 text-left">
                  <SkeletonLoader variant="text" width="120px" height="20px" />
                </th>
                <th className="px-4 py-3 text-left">
                  <SkeletonLoader variant="text" width="90px" height="20px" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3">
                    <SkeletonLoader variant="text" width="200px" height="20px" />
                  </td>
                  <td className="px-4 py-3">
                    <SkeletonLoader variant="text" width="60px" height="20px" />
                  </td>
                  <td className="px-4 py-3">
                    <SkeletonLoader variant="text" width="100px" height="20px" />
                  </td>
                  <td className="px-4 py-3">
                    <SkeletonLoader variant="rectangular" width="80px" height="24px" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Login Page Skeleton Component
export const LoginSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" role="status" aria-label="Loading login form">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <SkeletonLoader variant="text" width="200px" height="40px" className="mx-auto mb-2" />
          <SkeletonLoader variant="text" width="150px" height="20px" className="mx-auto" />
        </div>
        <div className="bg-white p-8 rounded-lg shadow space-y-6">
          <SkeletonLoader variant="text" width="100px" height="20px" />
          <SkeletonLoader variant="rectangular" width="100%" height="48px" />
          <SkeletonLoader variant="text" width="100px" height="20px" />
          <SkeletonLoader variant="rectangular" width="100%" height="48px" />
          <SkeletonLoader variant="rectangular" width="100%" height="48px" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
