import React from 'react';
interface SkeletonLoaderProps {
    variant?: 'text' | 'rectangular' | 'circular' | 'dashboard' | 'schedule';
    width?: string | number;
    height?: string | number;
    className?: string;
}
export declare const SkeletonLoader: React.FC<SkeletonLoaderProps>;
export declare const DashboardSkeleton: React.FC;
export declare const ScheduleSkeleton: React.FC;
export declare const LoginSkeleton: React.FC;
export default SkeletonLoader;
//# sourceMappingURL=SkeletonLoader.d.ts.map