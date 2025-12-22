import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  variant = 'rectangular' 
}) => {
  const baseClasses = "animate-shimmer bg-gray-200";
  const radius = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg';
  
  return (
    <div 
      className={`${baseClasses} ${radius} ${className}`} 
      style={{ width, height }}
    />
  );
};

export const ProductSkeleton = () => (
  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
    <Skeleton height={128} className="mb-3 w-full" />
    <Skeleton height={16} width="80%" className="mb-2" />
    <Skeleton height={12} width="50%" className="mb-2" />
    <div className="mt-auto flex justify-between items-center">
      <Skeleton height={16} width={60} />
      <Skeleton height={32} width={32} />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-gray-50">
    <td className="p-4"><div className="flex items-center gap-3"><Skeleton variant="circular" width={32} height={32} /><Skeleton width={100} height={16} /></div></td>
    <td className="p-4"><Skeleton width={80} height={16} /></td>
    <td className="p-4"><Skeleton width={60} height={16} /></td>
    <td className="p-4"><Skeleton width={40} height={16} /></td>
  </tr>
);