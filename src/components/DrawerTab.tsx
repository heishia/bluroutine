import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface DrawerTabProps {
  onClick: () => void;
}

export function DrawerTab({ onClick }: DrawerTabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 z-30 rounded-l-lg"
      style={{ 
        width: '24px',
        height: '60px',
      }}
    >
      <div className="flex items-center justify-center h-full">
        <ChevronLeft className="w-4 h-4 text-white opacity-80" />
      </div>
    </button>
  );
}