import React from 'react';
import { cn } from '@/lib/utils';

const Logo = ({ size = 'medium', className, lightBg = false }) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-20 h-20',
    large: 'w-48 h-48 md:w-64 md:h-64 lg:w-[300px] lg:h-[300px]'
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center flex-shrink-0 rounded-full bg-white shadow-md overflow-hidden', 
      sizeClasses[size], 
      className
    )}>
      <img
        src="https://horizons-cdn.hostinger.com/f4103959-de74-4f2a-8ed2-ca305fdcf13f/fd85ff2ce773a8ea96e6754ec94fb147.png"
        alt="Peace Royal Resort Logo"
        className="w-full h-full object-contain p-1"
      />
    </div>
  );
};

export default Logo;