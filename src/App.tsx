import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Header } from './components/Header';
import { WeeklyProgress } from './components/WeeklyProgress';
import RoutineItem from './components/RoutineItem';
import { AddButton } from './components/AddButton';
import { BottomNavigation } from './components/BottomNavigation';
import { EditModal } from './components/EditModal';
import { AddRoutineModal } from './components/AddRoutineModal';
import { EditRoutineModal } from './components/EditRoutineModal';
import { CalendarModal } from './components/CalendarModal';
import { EmojiPickerModal } from './components/EmojiPickerModal';
import { DayPage } from './components/DayPage';
import { StatsPage } from './components/StatsPage';
import { SplashScreen } from './components/SplashScreen';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { AccountPage } from './components/AccountPage';
import { ActivityManageModal } from './components/ActivityManageModal';

interface Routine {
  id: string;
  timeAction: string;
  routineText: string;
  emoji?: string;
}

interface RoutineProgress {
  routineId: string;
  date: string; // YYYY-MM-DD 형식
  isCompleted: boolean;
}

interface DayProgress {
  day: string;
  date: number;
  dateString: string;
  achievement: number;
  isRestDay: boolean;
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

interface User {
  provider: 'kakao' | 'google' | 'naver';
  name: string;
  email: string;
}

export default function App() {
  // 모든 상태를 먼저 선언
  const [splashStage, setSplashStage] = useState('logo');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState('routine');
  const [selectedDate, setSelectedDate] = useState('');
  const [routines, setRoutines] = useState([
    {
      id: '1',
      timeAction: '일어나면',
      routineText: '💧 패드컵기 주변청소하기',
      emoji: '💧'
    },
    {
      id: '2',
      timeAction: '일어나면',
      routineText: '사루하기 or 세수'
    },
    {
      id: '3',
      timeAction: '일어나면',
      routineText: '아침밥기쓰기'
    },
    {
      id: '4',
      timeAction: '일어나면',
      routineText: '명상하기'
    },
    {
      id: '5',
      timeAction: '일어나면',
      routineText: '질문하기'
    },
    {
      id: '6',
      timeAction: '일어나면',
      routineText: '독서 글쓰기 11 전략'
    },
    {
      id: '7',
      timeAction: '화사',
      routineText: '블로그'
    }
  ]);
  const [routineProgress, setRoutineProgress] = useState([
    {
      routineId: '1',
      date: new Date().toISOString().split('T')[0],
      isCompleted: true
    }
  ]);
  const [dayRecords, setDayRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(9);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editRoutineModalOpen, setEditRoutineModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [activityManageModalOpen, setActivityManageModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activities, setActivities] = useState([
    // 기본 활동들 (API 로드 실패 시 대체용)
    { id: '1', name: '운동', color: 'bg-blue-200' },
    { id: '2', name: '독서', color: 'bg-blue-300' },
    { id: '3', name: '공부', color: 'bg-blue-400' },
    { id: '4', name: '요리', color: 'bg-blue-200' },
    { id: '5', name: '청소', color: 'bg-blue-300' },
    { id: '6', name: '산책', color: 'bg-blue-400' },
    { id: '7', name: '명상', color: 'bg-blue-200' },
    { id: '8', name: '영화감상', color: 'bg-blue-300' },
    { id: '9', name: '음악감상', color: 'bg-blue-400' },
    { id: '10', name: '게임', color: 'bg-blue-200' },
    { id: '11', name: '쇼핑', color: 'bg-blue-300' },
    { id: '12', name: '카페', color: 'bg-blue-400' },
    { id: '13', name: '친구만남', color: 'bg-blue-200' },
    { id: '14', name: '드라마', color: 'bg-blue-300' },
    { id: '15', name: '유튜브', color: 'bg-blue-400' },
  ]);

  // 모든 useEffect를 먼저 선언
  useEffect(() => {
    // AuthService를 통한 인증 상태 확인
    const checkAuthStatus = async () => {
      try {
        const { AuthService } = await import('./api/authService');
        
        // 토큰 유효성 검사
        if (AuthService.isAuthenticated()) {
          const storedUser = AuthService.getStoredUser();
          if (storedUser) {
            const user: User = {
              name: storedUser.name,
              email: storedUser.email,
              provider: storedUser.provider as any || 'email'
            };
            
            setUser(user);
            setIsLoggedIn(true);
            localStorage.setItem('bluroutine_user', JSON.stringify(user));
            
            // 현재 사용자 정보 새로고침 (선택적)
            try {
              await AuthService.getCurrentUser();
            } catch (error) {
              console.warn('사용자 정보 새로고침 실패:', error);
            }
          }
        } else {
          // 토큰이 유효하지 않으면 로컬 상태 정리
          localStorage.removeItem('bluroutine_user');
        }
      } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
        localStorage.removeItem('bluroutine_user');
      }
    };

    checkAuthStatus();
  }, []);

  // 로그인 후 활동 데이터 로드
  useEffect(() => {
    const loadActivities = async () => {
      if (!isLoggedIn) return;
      
      try {
        const { ActivitiesService } = await import('./api/activitiesService');
        const apiActivities = await ActivitiesService.getActivities();
        
        if (apiActivities.length > 0) {
          // API 응답을 로컬 형식으로 변환
          const localActivities = apiActivities.map(apiActivity => ({
            id: apiActivity.id,
            name: apiActivity.name,
            color: apiActivity.color
          }));
          setActivities(localActivities);
        }
        // API에서 활동이 없으면 기본 활동들 유지
      } catch (error) {
        console.error('활동 데이터 로드 중 오류:', error);
        // 에러 시 기본 활동들 유지
      }
    };

    loadActivities();
  }, [isLoggedIn]);

  // 로그인 후 루틴 데이터 로드
  useEffect(() => {
    const loadRoutines = async () => {
      if (!isLoggedIn) return;
      
      try {
        const { RoutinesService } = await import('./api/routinesService');
        const apiRoutines = await RoutinesService.getRoutines();
        
        if (apiRoutines.length > 0) {
          // API 응답을 로컬 형식으로 변환
          const localRoutines = apiRoutines.map(apiRoutine => ({
            id: apiRoutine.id,
            timeAction: apiRoutine.timeAction,
            routineText: apiRoutine.routineText,
            emoji: apiRoutine.emoji
          }));
          setRoutines(localRoutines);
        }
        // API에서 루틴이 없으면 기본 루틴들 유지
      } catch (error) {
        console.error('루틴 데이터 로드 중 오류:', error);
        // 에러 시 기본 루틴들 유지
      }
    };

    loadRoutines();
  }, [isLoggedIn]);

  // 로그인 후 루틴 진행상황 데이터 로드
  useEffect(() => {
    const loadRoutineProgress = async () => {
      if (!isLoggedIn) return;
      
      try {
        const { RoutineProgressService } = await import('./api/routineProgressService');
        
        // 이번 주 진행상황 조회
        const weeklyProgress = await RoutineProgressService.getThisWeekProgress();
        
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
        
        if (convertedProgress.length > 0) {
          setRoutineProgress(convertedProgress);
        }
        // API에서 진행상황이 없으면 기본 데이터 유지
      } catch (error) {
        console.error('루틴 진행상황 로드 중 오류:', error);
        // 에러 시 기본 데이터 유지
      }
    };

    loadRoutineProgress();
  }, [isLoggedIn]);

  useEffect(() => {
    if (splashStage === 'main') return;
    
    let timer: NodeJS.Timeout;
    
    if (splashStage === 'logo') {
      timer = setTimeout(() => {
        setSplashStage('message');
      }, 1000);
    } else if (splashStage === 'message') {
      timer = setTimeout(() => {
        setSplashStage('main');
      }, 1500);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [splashStage]);

  useEffect(() => {
    if (splashStage === 'main' && !isInitialized) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const todayString = now.toISOString().split('T')[0];
      
      setCurrentYear(year);
      setCurrentMonth(month);
      setCurrentDate(`${year}년 ${month}월`);
      setSelectedDate(prev => prev || todayString);
      setIsInitialized(true);
    }
  }, [splashStage, isInitialized]);

  // 모든 계산된 값들을 useMemo로 처리
  const weekData = useMemo(() => {
    if (splashStage !== 'main' || !isInitialized) return [];
    
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    const totalRoutines = routines.length;
    
    // Get relevant week progress once
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(dayDate.toISOString().split('T')[0]);
    }
    
    // API에서 로드된 루틴 진행상황이 있으면 사용, 없으면 기본 데이터 사용
    const weekProgress = routineProgress.filter(p => weekDates.includes(p.date));
    
    return weekDays.map((dayName, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      const dateString = dayDate.toISOString().split('T')[0];
      
      const completedRoutines = weekProgress.filter(
        p => p.date === dateString && p.isCompleted
      ).length;
      
      const achievement = totalRoutines === 0 ? 0 : Math.round((completedRoutines / totalRoutines) * 100);
      
      return {
        day: dayName,
        date: dayDate.getDate(),
        dateString, // 정확한 날짜 문자열 추가
        achievement,
        isRestDay: index === 5
      };
    });
  }, [splashStage, isInitialized, routines.length, routineProgress]);

  const routinesWithCompletion = useMemo(() => {
    if (!selectedDate || routines.length === 0) return [];
    
    const todayProgress = routineProgress.filter(p => p.date === selectedDate);
    const progressMap = new Map(todayProgress.map(p => [p.routineId, p.isCompleted]));
    
    return routines.map(routine => ({
      ...routine,
      isCompleted: progressMap.get(routine.id) || false
    }));
  }, [selectedDate, routines, routineProgress]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    const selectedDateObj = new Date(selectedDate);
    return `${selectedDateObj.getMonth() + 1}월 ${selectedDateObj.getDate()}일`;
  }, [selectedDate]);

  const todayProgress = useMemo(() => {
    const totalRoutines = routinesWithCompletion.length;
    const completedRoutines = routinesWithCompletion.filter(routine => routine.isCompleted).length;
    const percentage = totalRoutines === 0 ? 0 : Math.round((completedRoutines / totalRoutines) * 100);
    
    return {
      total: totalRoutines,
      completed: completedRoutines,
      percentage
    };
  }, [routinesWithCompletion]);

  const Backend = useMemo(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile ? TouchBackend : HTML5Backend;
  }, []);

  // 모든 콜백 함수들을 useCallback으로 처리



  const handleToggleComplete = useCallback(async (routineId: string) => {
    if (!selectedDate) return;
    
    try {
      const { RoutineProgressService } = await import('./api/routineProgressService');
      
      // API를 통해 루틴 상태 토글
      await RoutineProgressService.toggleRoutineProgress({
        routineId,
        date: selectedDate
      });
      
      // 로컬 상태 업데이트
      setRoutineProgress(prevProgress => {
        const existingIndex = prevProgress.findIndex(
          p => p.routineId === routineId && p.date === selectedDate
        );

        if (existingIndex >= 0) {
          const newProgress = [...prevProgress];
          newProgress[existingIndex] = {
            ...newProgress[existingIndex],
            isCompleted: !newProgress[existingIndex].isCompleted
          };
          return newProgress;
        } else {
          return [
            ...prevProgress,
            {
              routineId,
              date: selectedDate,
              isCompleted: true
            }
          ];
        }
      });
    } catch (error) {
      console.error('루틴 상태 변경 중 오류:', error);
      // 에러 시에도 로컬 상태는 업데이트 (사용자 경험을 위해)
      setRoutineProgress(prevProgress => {
        const existingIndex = prevProgress.findIndex(
          p => p.routineId === routineId && p.date === selectedDate
        );

        if (existingIndex >= 0) {
          const newProgress = [...prevProgress];
          newProgress[existingIndex] = {
            ...newProgress[existingIndex],
            isCompleted: !newProgress[existingIndex].isCompleted
          };
          return newProgress;
        } else {
          return [
            ...prevProgress,
            {
              routineId,
              date: selectedDate,
              isCompleted: true
            }
          ];
        }
      });
    }
  }, [selectedDate]);

  const handleLongPress = useCallback((id: string) => {
    // Long press for reorder
  }, []);

  const moveRoutine = useCallback((dragIndex: number, hoverIndex: number) => {
    setRoutines(prevRoutines => {
      const draggedRoutine = prevRoutines[dragIndex];
      const newRoutines = [...prevRoutines];
      newRoutines.splice(dragIndex, 1);
      newRoutines.splice(hoverIndex, 0, draggedRoutine);
      return newRoutines;
    });
  }, []);

  const handleEdit = useCallback((id: string) => {
    const routine = routines.find(r => r.id === id);
    if (routine) {
      setSelectedRoutine(routine);
      setEditModalOpen(true);
    }
  }, [routines]);

  const stableHandlers = {
    handleToggleComplete,
    handleLongPress,
    handleEdit,
    moveRoutine
  };

  const handleEditRoutine = useCallback(() => {
    setEditModalOpen(false);
    setSelectedEmoji(selectedRoutine?.emoji || '');
    setEditRoutineModalOpen(true);
  }, [selectedRoutine]);

  const handleDeleteRoutine = useCallback(async () => {
    if (selectedRoutine) {
      try {
        const { RoutinesService } = await import('./api/routinesService');
        
        await RoutinesService.deleteRoutine(selectedRoutine.id);
        
        // 로컬 상태 업데이트
        setRoutines(prev => prev.filter(r => r.id !== selectedRoutine.id));
        setSelectedRoutine(null);
      } catch (error) {
        console.error('루틴 삭제 중 오류:', error);
        // 에러 시에도 모달은 닫되, 사용자에게 알림 (필요시 추가)
        setSelectedRoutine(null);
      }
    }
  }, [selectedRoutine]);

  const handleAddRoutine = useCallback(async (timeAction: string, routineText: string, emoji?: string, useCheckbox?: boolean) => {
    try {
      const { RoutinesService } = await import('./api/routinesService');
      
      const newRoutine = await RoutinesService.createRoutine({
        timeAction,
        routineText,
        emoji: useCheckbox ? undefined : emoji
      });
      
      // API 응답을 로컬 형식으로 변환
      const localRoutine: Routine = {
        id: newRoutine.id,
        timeAction: newRoutine.timeAction,
        routineText: newRoutine.routineText,
        emoji: newRoutine.emoji
      };
      
      setRoutines(prev => [...prev, localRoutine]);
      setSelectedEmoji('');
    } catch (error) {
      console.error('루틴 추가 중 오류:', error);
      throw error; // 컴포넌트에서 에러 처리할 수 있도록 다시 throw
    }
  }, []);

  const handleSaveRoutine = useCallback(async (id: string, timeAction: string, routineText: string, emoji?: string, useCheckbox?: boolean) => {
    try {
      const { RoutinesService } = await import('./api/routinesService');
      
      const updatedRoutine = await RoutinesService.updateRoutine(id, {
        timeAction,
        routineText,
        emoji: useCheckbox ? undefined : emoji
      });
      
      // 로컬 상태 업데이트
      setRoutines(prev => prev.map(routine =>
        routine.id === id
          ? {
              id: updatedRoutine.id,
              timeAction: updatedRoutine.timeAction,
              routineText: updatedRoutine.routineText,
              emoji: updatedRoutine.emoji
            }
          : routine
      ));
      
      setSelectedEmoji('');
      setEditRoutineModalOpen(false);
      setSelectedRoutine(null);
    } catch (error) {
      console.error('루틴 수정 중 오류:', error);
      throw error; // 컴포넌트에서 에러 처리할 수 있도록 다시 throw
    }
  }, []);

  const handleWeekSelect = useCallback((year: number, month: number, weekStart: Date) => {
    const midWeekDate = new Date(weekStart);
    midWeekDate.setDate(weekStart.getDate() + 2);
    
    const displayYear = midWeekDate.getFullYear();
    const displayMonth = midWeekDate.getMonth() + 1;
    
    if (displayYear !== currentYear || displayMonth !== currentMonth) {
      setCurrentYear(displayYear);
      setCurrentMonth(displayMonth);
      setCurrentDate(`${displayYear}년 ${displayMonth}월`);
    }
  }, [currentYear, currentMonth]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setSelectedEmoji(emoji);
    setEmojiPickerOpen(false);
  }, []);

  const handleDateClick = useCallback((date: number, day: string, dateString?: string) => {
    if (dateString && dateString !== selectedDate) {
      setSelectedDate(dateString);
    }
  }, [selectedDate]);

  const handleLoginSuccess = useCallback(() => {
    // AuthService에서 이미 토큰과 사용자 정보를 저장했으므로
    // 저장된 사용자 정보를 가져와서 상태 업데이트
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const user: User = {
          name: userData.name,
          email: userData.email,
          provider: userData.provider || 'email'
        };
        
        setUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('bluroutine_user', JSON.stringify(user));
      } catch (error) {
        console.error('저장된 사용자 정보 파싱 실패:', error);
      }
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      // AuthService를 통한 로그아웃 (토큰 제거 포함)
      const { AuthService } = await import('./api/authService');
      await AuthService.logout();
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      // 로컬 상태 정리
      setUser(null);
      setIsLoggedIn(false);
      setActiveTab('routine');
      setShowSignup(false);
      localStorage.removeItem('bluroutine_user');
    }
  }, []);

  const handleSignup = useCallback(async (email: string, password: string, name: string) => {
    try {
      const { AuthService } = await import('./api/authService');
      
      // AuthService를 통한 회원가입
      const response = await AuthService.signup({
        email,
        password,
        name
      });
      
      // 회원가입 성공 시 사용자 정보 설정
      const user: User = {
        name: response.user.name,
        email: response.user.email,
        provider: response.user.provider as any || 'email'
      };
      
      setUser(user);
      setIsLoggedIn(true);
      setShowSignup(false);
      localStorage.setItem('bluroutine_user', JSON.stringify(user));
    } catch (error: any) {
      console.error('회원가입 중 오류:', error);
      // 에러 처리는 SignupPage 컴포넌트에서 처리하도록 에러를 다시 throw
      throw error;
    }
  }, []);

  const handleShowSignup = useCallback(() => {
    setShowSignup(true);
  }, []);

  const handleBackToLogin = useCallback(() => {
    setShowSignup(false);
  }, []);

  const updateDayRecord = useCallback((date: string, sessions: DaySession[]) => {
    setDayRecords(prev => {
      const existingIndex = prev.findIndex(record => record.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { date, sessions };
        return updated;
      } else {
        return [...prev, { date, sessions }];
      }
    });
  }, []);

  const handleActivityManage = useCallback(() => {
    setActivityManageModalOpen(true);
  }, []);

  const handleUpdateActivities = useCallback((newActivities: typeof activities) => {
    setActivities(newActivities);
  }, []);

  // 렌더링 관련 useMemo들
  const renderRoutinePage = useMemo(() => (
    <div className="flex-1 bg-gray-100 overflow-hidden">
      <div className="h-full overflow-y-auto pb-20 scrollbar-hide">
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-2">
            {formattedSelectedDate} 루틴
          </p>
          
          {/* 진행률 막대와 퍼센트 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {todayProgress.completed}/{todayProgress.total} 완료
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">
                  {todayProgress.percentage}%
                </span>
                {todayProgress.percentage === 100 && todayProgress.total > 0 && (
                  <span className="text-xs">✨</span>
                )}
              </div>
            </div>
            
            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  todayProgress.percentage === 100 && todayProgress.total > 0
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary shadow-sm' 
                    : 'bg-brand-tertiary'
                }`}
                style={{ 
                  width: `${Math.min(todayProgress.percentage, 100)}%`,
                  ...(todayProgress.percentage === 100 && todayProgress.total > 0 && {
                    boxShadow: '0 0 8px rgba(37, 99, 235, 0.3)'
                  })
                }}
              />
            </div>
            
            {/* 100% 완료 시 축하 메시지 */}
            {todayProgress.percentage === 100 && todayProgress.total > 0 && (
              <div className="text-center py-1">
                <span className="text-xs text-brand-primary font-medium animate-pulse">
                  🎉 오늘의 루틴을 모두 완료했어요!
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 space-y-0">
          {routinesWithCompletion.length > 0 ? (
            routinesWithCompletion.map((routine, index) => (
              <RoutineItem
                key={routine.id}
                id={routine.id}
                index={index}
                timeAction={routine.timeAction}
                routineText={routine.routineText}
                isCompleted={routine.isCompleted}
                emoji={routine.emoji}
                onToggleComplete={handleToggleComplete}
                onLongPress={handleLongPress}
                onEdit={handleEdit}
                onMoveRoutine={moveRoutine}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">등록된 루틴이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-1">+ 버튼을 눌러 루틴을 추가해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  ), [formattedSelectedDate, routinesWithCompletion, todayProgress]);

  const renderContent = () => {
    switch (activeTab) {
      case 'routine':
        return renderRoutinePage;
      case 'day':
        return (
          <DayPage 
            selectedDate={selectedDate} 
            onSessionsUpdate={updateDayRecord}
            dayRecords={dayRecords}
            activities={activities}
            onActivityManage={handleActivityManage}
          />
        );
      case 'stats':
        return (
          <StatsPage
            routines={routines}
            routineProgress={routineProgress}
            dayRecords={dayRecords}
            currentYear={currentYear}
            currentMonth={currentMonth}
          />
        );
      case 'account':
        return user ? (
          <AccountPage 
            user={user}
            onLogout={handleLogout}
            onActivityManage={handleActivityManage}
          />
        ) : null;
      default:
        return null;
    }
  };

  // 조건부 렌더링 - 모든 훅 호출 후에 처리
  if (splashStage !== 'main') {
    return <SplashScreen stage={splashStage} />;
  }

  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <SignupPage
          onBack={handleBackToLogin}
          onSignup={handleSignup}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSignupClick={handleShowSignup}
      />
    );
  }

  return (
    <DndProvider backend={Backend}>
      <div className="h-screen flex flex-col">
      {/* 계정 페이지가 아닐 때만 헤더와 진행률 표시 */}
      {activeTab !== 'account' && (
        <>
          <Header 
            currentDate={currentDate} 
            onCalendarClick={() => setCalendarModalOpen(true)}
          />
          <WeeklyProgress weekData={weekData} onDateClick={handleDateClick} />
        </>
      )}
      
      {renderContent()}
      
      {activeTab === 'routine' && (
        <AddButton onClick={() => setAddModalOpen(true)} />
      )}
      
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <EditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          // selectedRoutine을 여기서 null로 설정하지 않음 - EditRoutineModal에서 사용해야 함
        }}
        onEdit={handleEditRoutine}
        onDelete={() => {
          handleDeleteRoutine();
          setSelectedRoutine(null); // 삭제할 때만 null로 설정
        }}
        routineText={selectedRoutine?.routineText || ''}
      />
      
      <AddRoutineModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setSelectedEmoji('');
        }}
        onAdd={handleAddRoutine}
        onEmojiPicker={() => setEmojiPickerOpen(true)}
        selectedEmoji={selectedEmoji}
      />
      
      <EditRoutineModal
        isOpen={editRoutineModalOpen}
        onClose={() => {
          setEditRoutineModalOpen(false);
          setSelectedEmoji('');
          setSelectedRoutine(null);
        }}
        onSave={handleSaveRoutine}
        onEmojiPicker={() => setEmojiPickerOpen(true)}
        selectedEmoji={selectedEmoji}
        routine={selectedRoutine ? selectedRoutine : undefined}
      />
      
      <CalendarModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        onWeekSelect={handleWeekSelect}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
      
      <EmojiPickerModal
        isOpen={emojiPickerOpen}
        onClose={() => setEmojiPickerOpen(false)}
        onEmojiSelect={handleEmojiSelect}
      />
      
      <ActivityManageModal
        isOpen={activityManageModalOpen}
        onClose={() => setActivityManageModalOpen(false)}
        activities={activities}
        onUpdateActivities={handleUpdateActivities}
      />
      </div>
    </DndProvider>
  );
}