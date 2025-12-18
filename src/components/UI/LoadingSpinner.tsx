'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'orange' | 'white' | 'gray';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'orange',
  className = '',
  text
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 border-2';
      case 'lg':
        return 'w-8 h-8 border-2';
      case 'xl':
        return 'w-12 h-12 border-4';
      default:
        return 'w-6 h-6 border-2';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white border-t-transparent';
      case 'gray':
        return 'border-dt-light-gray border-t-transparent';
      default:
        return 'border-dt-charcoal border-t-dt-orange';
    }
  };

  const spinnerClasses = `spinner ${getSizeClasses()} ${getColorClasses()} ${className}`;

  if (text) {
    return (
      <div className="flex flex-col items-center space-y-3">
        <div className={spinnerClasses}></div>
        <div className="text-dt-light-gray text-sm">{text}</div>
      </div>
    );
  }

  return <div className={spinnerClasses}></div>;
};