import React from 'react';
import { Cloud } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Cloud className="w-8 h-8 text-blue-500" />
    </div>
  );
};