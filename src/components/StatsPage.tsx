import React, { useMemo, useState, useEffect } from 'react';
import { RoutineProgressService } from '../api/routineProgressService';

interface Routine {
  id: string;
  timeAction: string;
  routineText: string;
  emoji?: string;
}

interface RoutineProgress {
  routineId: string;
  date: string;
  isCompleted: boolean;
}

interface DaySession {
  id: string;
  startTime: string;
  endTime?: string;
  action?: string;
  status: 'ready' | 'started' | 'completed' | 'resting' | 'rest_finished' | 'finished';
  isRest?: boolean;
}

interface DayRecord {
  date: string;
  sessions: DaySession[];
}

interface StatsPageProps {
  routines: Routine[];
  routineProgress: RoutineProgress[];
  dayRecords: DayRecord[];
  currentYear: number;
  currentMonth: number;
}

export function StatsPage({ 
  routines, 
  routineProgress, 
  dayRecords, 
  currentYear, 
  currentMonth 
}: StatsPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [apiRoutineProgress, setApiRoutineProgress] = useState<RoutineProgress[]>([]);
  
  // API에서 루틴 진행상황 데이터 로드
  useEffect(() => {
    const loadRoutineProgress = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // 현재 월의 시작일과 마지막일 계산
        const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
        const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
        
        const weeklyProgress = await RoutineProgressService.getWeeklyRoutineProgress(startDate, endDate);
        
        // API 응답을 로컬 형식으로 변환
        const convertedProgress: RoutineProgress[] = [];
        weeklyProgress.dailyProgress.forEach(daily => {
          daily.routines.forEach(routine => {
            convertedProgress.push({
              routineId: routine.id,
              date: daily.date,
              isCompleted: routine.isCompleted
            });
          });
        });
        
        setApiRoutineProgress(convertedProgress);
      } catch (error: any) {
        console.error('루틴 진행상황 로드 중 오류:', error);
        setError(error.detail || '통계 데이터를 불러오는 중 오류가 발생했습니다.');
        // 에러 시 props로 받은 기본 데이터 사용
        setApiRoutineProgress(routineProgress);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutineProgress();
  }, [currentYear, currentMonth, routineProgress]);
  
  // API 데이터가 있으면 사용, 없으면 props 데이터 사용
  const activeRoutineProgress = apiRoutineProgress.length > 0 ? apiRoutineProgress : routineProgress;

  // 현재 월의 모든 날짜 생성
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentYear, currentMonth - 1, i + 1);
    // 시간대 문제를 피하기 위해 직접 YYYY-MM-DD 포맷 생성
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return dateString;
  });



  // 세트 기록 월간 달성률 계산 (실제 달력 형태)
  const dayStats = useMemo(() => {
    
    // 해당 월의 1일이 무슨 요일인지 확인 (0=일요일, 1=월요일, ...)
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // 달력 그리드 타입 정의
    type CalendarDay = {
      date: number | null;
      hasRecord: number;
      isEmpty: boolean;
    };
    
    // 달력 그리드 생성 (해당 월의 날짜만 표시)
    const calendarDays: CalendarDay[] = [];
    
    // 1일 이전의 빈 칸들 추가
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push({ date: null, hasRecord: 0, isEmpty: true });
    }
    
    // 실제 날짜들만 추가 (해당 월의 날짜만)
    const dailyDayStats = monthDates.map((date) => {
      const dayRecord = dayRecords.find(record => record.date === date);
      const hasRecord = dayRecord && dayRecord.sessions.some(session => 
        session.status === 'finished' && session.action && !session.isRest
      );
      
      const dayNumber = new Date(date).getDate();
      
      return {
        date: dayNumber,
        hasRecord: hasRecord ? 1 : 0,
        isEmpty: false
      };
    });
    
    calendarDays.push(...dailyDayStats);
    
    // 6주(42칸) 달력을 만들기 위해 나머지 빈 칸 추가
    const remainingCells = 42 - calendarDays.length;
    for (let i = 0; i < remainingCells; i++) {
      calendarDays.push({ date: null, hasRecord: 0, isEmpty: true });
    }
    
    const recordedDays = dailyDayStats.filter(day => day.hasRecord === 1).length;
    
    return { calendarDays, recordedDays, firstDayWeekday };
  }, [dayRecords, monthDates, currentYear, currentMonth, daysInMonth]);

  // 루틴 달성률 계산 (70% 이상 달성한 날 기준)
  const routineStats = useMemo(() => {
    const achievedDays = monthDates.filter(date => {
      const completedRoutines = activeRoutineProgress.filter(
        p => p.date === date && p.isCompleted
      ).length;
      const totalRoutines = routines.length;
      
      if (totalRoutines === 0) return false;
      const achievement = (completedRoutines / totalRoutines) * 100;
      return achievement >= 70;
    }).length;
    
    return { achievedDays };
  }, [activeRoutineProgress, monthDates, routines]);

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden">
      <div className="h-full overflow-y-auto scrollbar-hide">
        <div className="px-4 py-2 bg-white border-b border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {currentYear}년 {currentMonth}월 통계 {isLoading && '(로딩 중...)'}
          </p>
        </div>

        <div className="p-4 space-y-6 pb-32">
          
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-xs text-red-500 underline mt-1"
              >
                닫기
              </button>
            </div>
          )}

          {/* 달성률 통계 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">이번 달 달성률</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">루틴 달성</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-brand-secondary">
                    {routineStats.achievedDays}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">
                    {daysInMonth}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">세트 기록</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-brand-secondary">
                    {dayStats.recordedDays}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">
                    {daysInMonth}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 세트 기록 현황 - 달력 형태 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">세트 기록 현황</h3>
            
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((dayName, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">{dayName}</span>
                </div>
              ))}
            </div>
            
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {dayStats.calendarDays.map((day, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {day.isEmpty ? (
                    // 빈 칸
                    <div className="w-8 h-8"></div>
                  ) : (
                    // 실제 날짜
                    <div 
                      className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                        day.hasRecord 
                          ? 'bg-brand-secondary text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day.date}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-brand-secondary rounded"></div>
                <span className="text-gray-600">기록함</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span className="text-gray-600">기록안함</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}