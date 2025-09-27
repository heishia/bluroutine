import React from 'react';

interface DayProgress {
  day: string;
  date: number;
  dateString: string;
  achievement: number; // 0-100 percentage
  isRestDay: boolean;
}

interface WeeklyProgressProps {
  weekData: DayProgress[];
  onDateClick?: (date: number, day: string, dateString?: string) => void;
}

export function WeeklyProgress({ weekData, onDateClick }: WeeklyProgressProps) {
  const getCircleColor = (achievement: number, isRestDay: boolean) => {
    if (isRestDay) return 'bg-gray-400';
    if (achievement >= 70) return 'bg-blue-500';
    return 'bg-blue-300'; // 70% 미만일 때 연한 파란색
  };

  return (
    <div className="bg-white px-0 py-2">
      <div className="flex justify-center space-x-4 max-w-2xl mx-auto px-6">
        {weekData.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-sm text-gray-600 mb-1">{day.day}</span>
            <div 
              className={`w-10 h-10 rounded-full ${getCircleColor(day.achievement, day.isRestDay)} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => onDateClick?.(day.date, day.day, day.dateString)}
            >
              <span className="text-white text-sm font-medium">
                {day.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}