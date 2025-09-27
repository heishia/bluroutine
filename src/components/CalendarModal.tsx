import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWeekSelect: (year: number, month: number, weekStart: Date) => void;
  currentYear: number;
  currentMonth: number;
}

export function CalendarModal({ 
  isOpen, 
  onClose, 
  onWeekSelect, 
  currentYear, 
  currentMonth 
}: CalendarModalProps) {
  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();
    
    // 월요일을 주의 시작(0)으로 조정
    const mondayStart = startDate === 0 ? 6 : startDate - 1;
    
    const days = [];
    
    // 이전 달 날짜들은 빈 공간으로 처리
    for (let i = 0; i < mondayStart; i++) {
      days.push({
        date: null,
        isCurrentMonth: false,
        isPrevMonth: true,
        fullDate: null
      });
    }
    
    // 현재 달의 날짜들만 표시
    for (let date = 1; date <= daysInMonth; date++) {
      days.push({
        date,
        isCurrentMonth: true,
        isPrevMonth: false,
        fullDate: new Date(year, month - 1, date)
      });
    }
    
    // 다음 달 날짜들도 빈 공간으로 처리 (6주 = 42일로 맞추기)
    const remainingDays = 42 - days.length;
    for (let i = 0; i < remainingDays; i++) {
      days.push({
        date: null,
        isCurrentMonth: false,
        isPrevMonth: false,
        fullDate: null
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(viewYear, viewMonth);
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateSelect = (selectedDate: Date) => {
    // 선택된 날짜가 속한 주의 월요일 찾기
    const dayOfWeek = selectedDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - mondayOffset);
    
    onWeekSelect(selectedDate.getFullYear(), selectedDate.getMonth() + 1, weekStart);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>날짜 선택</DialogTitle>
          <DialogDescription>
            원하시는 날짜를 선택하면 해당 주가 설정됩니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 월/년 네비게이션 */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium">{viewYear}년 {viewMonth}월</span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              day.date ? (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day.fullDate!)}
                  className={`h-8 w-8 text-sm rounded hover:bg-blue-50 transition-colors flex items-center justify-center text-gray-900 hover:bg-blue-100 ${
                    day.fullDate!.toDateString() === new Date().toDateString()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : ''
                  }`}
                >
                  {day.date}
                </button>
              ) : (
                <div key={index} className="h-8 w-8"></div>
              )
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}