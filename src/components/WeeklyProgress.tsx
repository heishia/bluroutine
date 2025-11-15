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
    <div className="bg-white px-3 sm:px-4 md:px-6 py-2">
      <div className="flex justify-between items-center max-w-2xl mx-auto gap-1 sm:gap-2">
        {weekData.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1 min-w-0">
            <span className="text-xs sm:text-sm text-gray-600 mb-1">{day.day}</span>
            <div 
              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full ${getCircleColor(day.achievement, day.isRestDay)} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0`}
              onClick={() => onDateClick?.(day.date, day.day, day.dateString)}
            >
              <span className="text-white text-xs sm:text-sm font-medium">
                {day.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}