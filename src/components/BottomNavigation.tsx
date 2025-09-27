import React from 'react';
import { Calendar, BarChart3, CheckSquare, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'routine', label: '루틴', icon: CheckSquare },
    { id: 'day', label: '세트', icon: Calendar },
    { id: 'stats', label: '통계', icon: BarChart3 },
    { id: 'account', label: '계정', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[13vh] bg-white border-t border-gray-200 flex items-center justify-around z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
              isActive ? 'text-gray-500' : 'text-gray-500'
            }`}
            style={isActive ? { color: 'var(--brand-primary)' } : {}}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}