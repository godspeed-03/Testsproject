'use client';

import React from 'react';

interface BrandLogoIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BrandLogoIcon({ size = 'md', className = '' }: BrandLogoIconProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8.5 h-8.5 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl'
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses[size]} overflow-hidden shadow-md shadow-violet-500/20 ${className}`}>
      <img
        src="/icon.svg"
        alt="UPSC tracker Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
