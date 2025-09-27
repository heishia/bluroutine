import React from 'react';
import { ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentDate: string;
  onCalendarClick: () => void;
}

export function Header({ currentDate, onCalendarClick }: HeaderProps) {
  return (
    <div className="bg-white h-[6vh] flex items-center justify-center">
      <button 
        onClick={onCalendarClick}
        className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-1 rounded transition-colors"
      >
        <h1 className="text-gray-800 text-xl">{currentDate}</h1>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}