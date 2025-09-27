import React, { useState, useEffect } from 'react';
import { DaySessionItem } from './DaySessionItem';
import { ActionButton } from './ActionButton';
import { ActionInputModal } from './ActionInputModal';
import { SetLabel } from './SetLabel';
import { ActivityDrawer } from './ActivityDrawer';
import { DrawerTab } from './DrawerTab';
import { ActivityDropZone } from './ActivityDropZone';
import { DurationInputModal } from './DurationInputModal';
import { RotateCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { DaySessionsService, DaySession as ApiDaySession, DaySessionCreate, DaySessionUpdate } from '../api/daySessionsService';

interface DaySession {
  id: string;
  startTime: string;
  endTime?: string;
  action?: string;
  status: 'ready' | 'started' | 'completed' | 'resting' | 'rest_finished' | 'finished';
  isRest?: boolean;
  isNewAction?: boolean; // 새액션으로 생성된 세션인지 표시
  setNumber?: number; // 명시적 세트 번호 (드래그 앤 드롭으로 삽입된 세션용)
}

interface DayPageProps {
  selectedDate: string;
  onSessionsUpdate: (date: string, sessions: DaySession[]) => void;
  dayRecords: DayRecord[];
  activities?: Activity[];
  onActivityManage?: () => void;
}

interface DayRecord {
  date: string;
  sessions: DaySession[];
}

interface Activity {
  id: string;
  name: string;
  color: string;
}

// 고유 ID 생성 함수 (중복 방지) - 더 안전한 버전
const generateUniqueId = (() => {
  let counter = 0;
  let lastTimestamp = 0;
  
  return () => {
    const now = Date.now();
    // 같은 밀리초에 호출되면 카운터를 증가시켜 고유성 보장
    if (now === lastTimestamp) {
      counter++;
    } else {
      counter = 0;
      lastTimestamp = now;
    }
    return `${now}-${counter}-${Math.random().toString(36).substr(2, 9)}`;
  };
})();

export function DayPage({ selectedDate, onSessionsUpdate, dayRecords, activities, onActivityManage }: DayPageProps) {
  const [sessions, setSessions] = useState<DaySession[]>([
    {
      id: generateUniqueId(),
      startTime: '',
      status: 'ready'
    }
  ]);
  
  // 액티비티 목록 (props에서 받거나 기본값 사용)
  const activityList = activities || [
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
  ];
  
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [modalType, setModalType] = useState<'complete' | 'continue'>('complete');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [durationModalOpen, setDurationModalOpen] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<Activity | null>(null);
  const [pendingTargetIndex, setPendingTargetIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');


  // 선택된 날짜가 변경될 때 해당 날짜의 기록 불러오기 (API 연동)
  useEffect(() => {
    const loadDaySessions = async () => {
      if (!selectedDate) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        // 먼저 로컬 캐시 확인
        const cachedRecord = dayRecords.find(record => record.date === selectedDate);
        if (cachedRecord && cachedRecord.sessions.length > 0) {
          // 로컬 세션을 API 형식에 맞게 변환
          const convertedSessions = cachedRecord.sessions.map(session => ({
            ...session,
            startTime: session.startTime
          }));
          setSessions(convertedSessions);
          setIsLoading(false);
          return;
        }
        
        // API에서 데이터 로드
        const dayRecord = await DaySessionsService.getDaySessions(selectedDate);
        
        if (dayRecord.sessions && dayRecord.sessions.length > 0) {
          // API 세션을 로컬 형식으로 변환
          const convertedSessions = dayRecord.sessions.map((apiSession: ApiDaySession) => ({
            id: apiSession.id,
            startTime: apiSession.start_time,
            endTime: apiSession.end_time,
            action: apiSession.action,
            status: apiSession.status,
            isRest: apiSession.is_rest,
            isNewAction: apiSession.is_new_action,
            setNumber: apiSession.set_number
          }));
          setSessions(convertedSessions);
          
          // 로컬 캐시도 업데이트
          onSessionsUpdate(selectedDate, convertedSessions);
        } else {
          // 기록이 없으면 기본 ready 세션으로 초기화
          setSessions([{
            id: generateUniqueId(),
            startTime: '',
            status: 'ready'
          }]);
        }
      } catch (error: any) {
        console.error('세션 로드 중 오류:', error);
        setError(error.detail || '세션을 불러오는 중 오류가 발생했습니다.');
        
        // 에러 시 기본 세션으로 초기화
        setSessions([{
          id: generateUniqueId(),
          startTime: '',
          status: 'ready'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDaySessions();
  }, [selectedDate]); // dayRecords 의존성 제거 - API에서 직접 로드

  // 세션이 변경될 때마다 서버에 저장 및 상위 컴포넌트로 전달
  useEffect(() => {
    const saveSessionsToServer = async () => {
      // 기본 ready 세션만 있는 경우는 업데이트하지 않음 (초기 상태)
      const isInitialState = sessions.length === 1 && 
                            sessions[0].status === 'ready' && 
                            !sessions[0].startTime;
      
      if (!isInitialState && !isLoading && selectedDate) {
        try {
          // 로컬 세션을 API 형식으로 변환
          const apiSessions: DaySessionCreate[] = sessions
            .filter(session => session.startTime || session.action) // 의미있는 세션만 저장
            .map(session => ({
              date: selectedDate,
              start_time: session.startTime,
              end_time: session.endTime,
              action: session.action,
              status: session.status,
              is_rest: session.isRest,
              is_new_action: session.isNewAction,
              set_number: session.setNumber
            }));

          // 벌크 업데이트 API 호출 (의미있는 세션이 있을 때만)
          if (apiSessions.length > 0) {
            await DaySessionsService.updateDayRecord(selectedDate, {
              date: selectedDate,
              sessions: apiSessions
            });
          }
          
          // 로컬 캐시 업데이트
          onSessionsUpdate(selectedDate, sessions);
        } catch (error: any) {
          console.error('세션 저장 중 오류:', error);
          setError(error.detail || '세션 저장 중 오류가 발생했습니다.');
        }
      }
    };

    // 디바운싱: 1초 후에 저장
    const timeoutId = setTimeout(saveSessionsToServer, 1000);
    return () => clearTimeout(timeoutId);
  }, [sessions, selectedDate, isLoading]); // onSessionsUpdate 의존성 제거

  const getCurrentSession = () => {
    return sessions.find(s => s.status !== 'finished') || sessions[sessions.length - 1];
  };

  const formatDateDisplay = () => {
    const date = new Date(selectedDate);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleAction = (action: 'start' | 'complete' | 'rest' | 'rest_end' | 'finish' | 'continue' | 'newAction') => {
    const currentSession = getCurrentSession();
    if (!currentSession) return;

    const now = new Date().toISOString();

    switch (action) {
      case 'start':
        setSessions(sessions.map(s => 
          s.id === currentSession.id 
            ? { ...s, startTime: now, status: 'started' as const }
            : s
        ));
        break;

      case 'complete':
        setSessions(sessions.map(s => 
          s.id === currentSession.id 
            ? { ...s, endTime: now, status: 'completed' as const }
            : s
        ));
        
        // 이미 액션이 기록된 세션이 아닌 경우에만 모달 열기
        if (!currentSession.action) {
          setCurrentSessionId(currentSession.id);
          setModalType('complete');
          setActionModalOpen(true);
        }
        break;

      case 'rest':
        // 현재 세션을 완료된 상태로 마감하고 새로운 휴식 세션 생성
        setSessions(sessions.map(s => 
          s.id === currentSession.id 
            ? { ...s, status: 'finished' as const }
            : s
        ));
        
        // 새로운 휴식 세션 생성
        const restSession: DaySession = {
          id: generateUniqueId(),
          startTime: now,
          status: 'resting',
          isRest: true,
          action: '휴식'
        };
        setSessions(prev => [...prev, restSession]);
        break;

      case 'rest_end':
        // 휴식 끝 - 휴식 세션에 endTime 추가하고 rest_finished 상태로 변경
        setSessions(sessions.map(s => 
          s.id === currentSession.id 
            ? { ...s, endTime: now, status: 'rest_finished' as const }
            : s
        ));
        break;

      case 'finish':
        // 마감 버튼: 현재 세트를 완전히 종료하고 다음 세트로 넘어가기
        
        // 현재 세트의 모든 미완료 세션들을 finished로 마감
        const finishedSessions = sessions.map(s => 
          s.status !== 'finished' 
            ? { ...s, status: 'finished' as const, endTime: s.endTime || now }
            : s
        );
        
        // 현재 세트 번호 계산 (완료된 세트들 중 가장 높은 번호 + 1)
        const currentSetNumber = Math.max(
          1, 
          ...finishedSessions
            .filter(s => s.setNumber)
            .map(s => s.setNumber!),
          ...finishedSessions
            .reduce((sets, session, index) => {
              // 휴식이 아닌 첫 번째 세션이나, 이전에 완료된 작업 세션 후의 첫 작업 세션을 세트 시작으로 간주
              if (!session.isRest && !session.isNewAction) {
                let setNum = 1;
                for (let i = index - 1; i >= 0; i--) {
                  const prevSession = finishedSessions[i];
                  if (prevSession.setNumber) {
                    setNum = prevSession.setNumber;
                    break;
                  }
                  if (!prevSession.isRest && prevSession.status === 'finished') {
                    setNum++;
                    break;
                  }
                  if (!prevSession.isRest) break;
                }
                sets.push(setNum);
              }
              return sets;
            }, [] as number[])
        );
        
        const nextSetNumber = currentSetNumber + 1;
        
        // 새로운 세트의 ready 세션 추가 (명시적 세트 번호 포함)
        const newSetSession: DaySession = {
          id: generateUniqueId(),
          startTime: '',
          status: 'ready',
          setNumber: nextSetNumber // 다음 세트 번호 명시적 설정
        };
        
        setSessions([...finishedSessions, newSetSession]);
        break;

      case 'continue':
        // 휴식 세션을 마감
        setSessions(sessions.map(s => 
          s.id === currentSession.id 
            ? { ...s, status: 'finished' as const }
            : s
        ));
        
        // 현재 세트 번호 유지 (같은 세트 내에서 계속)
        const currentSessionSetNumber = currentSession.setNumber || 
          (() => {
            // 현재 세션의 세트 번호를 역산하여 계산
            let setNum = 1;
            const sessionIndex = sessions.findIndex(s => s.id === currentSession.id);
            for (let i = sessionIndex - 1; i >= 0; i--) {
              const prevSession = sessions[i];
              if (prevSession.setNumber) {
                setNum = prevSession.setNumber;
                break;
              }
              if (!prevSession.isRest && prevSession.status === 'finished') {
                setNum++;
                break;
              }
              if (!prevSession.isRest) break;
            }
            return setNum;
          })();
        
        // 새로운 작업 세션을 시작된 상태로 추가 (같은 세트 번호)
        const continueSession: DaySession = {
          id: generateUniqueId(),
          startTime: now,
          status: 'started',
          setNumber: currentSessionSetNumber // 같은 세트 내에서 계속
        };
        setSessions(prev => [...prev, continueSession]);
        
        // 액션 입력 모달 열기
        setCurrentSessionId(continueSession.id);
        setModalType('continue');
        setActionModalOpen(true);
        break;

      case 'newAction':
        // 현재 세션을 완료된 상태로 마감
        setSessions(sessions.map(s => 
          s.id === currentSession.id 
            ? { ...s, status: 'finished' as const }
            : s
        ));
        
        // 새로운 액션 세션을 시작된 상태로 추가 (같은 세트 내)
        const newActionSession: DaySession = {
          id: generateUniqueId(),
          startTime: now,
          status: 'started',
          isNewAction: true // 새액션 플래그 추가
        };
        setSessions(prev => [...prev, newActionSession]);
        
        // 액션 입력 모달 열기
        setCurrentSessionId(newActionSession.id);
        setModalType('continue');
        setActionModalOpen(true);
        break;
    }
  };

  const handleActionSave = (actionText: string) => {
    setSessions(sessions.map(s => 
      s.id === currentSessionId 
        ? { ...s, action: actionText }
        : s
    ));
    setActionModalOpen(false);
  };

  const handleEditAction = (sessionId: string, newAction: string) => {
    setSessions(sessions.map(s => 
      s.id === sessionId 
        ? { ...s, action: newAction }
        : s
    ));
  };

  const handleDeleteAction = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const handleActivityDrop = (activity: Activity, targetIndex: number) => {
    console.log('🎯 [ActivityDrop] 액티비티 드롭 시작:', {
      activity: activity.name,
      targetIndex
    });
    
    // 간단하게 상태 설정
    setPendingActivity(activity);
    setPendingTargetIndex(targetIndex);
    setDrawerOpen(false);
    setIsDragging(false);
    setDurationModalOpen(true);
    
    console.log('🎯 [ActivityDrop] 모달 열림 완료');
  };

  const handleDurationConfirm = (minutes: number) => {
    console.log('🎯 [DurationConfirm] ===== 함수 호출됨! =====');
    console.log('⏱️ [DurationConfirm] 시간 확인 시작:', {
      minutes,
      activity: pendingActivity?.name,
      targetIndex: pendingTargetIndex
    });
    
    if (!pendingActivity) {
      console.log('❌ [DurationConfirm] pendingActivity가 없음 - 종료');
      return;
    }

    const now = new Date();
    const startTime = new Date(now.getTime() - minutes * 60 * 1000).toISOString();
    
    console.log('📋 [DurationConfirm] 현재 sessions 배열:', sessions.map((s, i) => ({ 
      index: i, 
      id: s.id, 
      action: s.action, 
      status: s.status,
      setNumber: s.setNumber
    })));
    
    // 삽입할 위치의 세트 번호 계산
    let targetSetNumber = 1; // 기본값
    
    if (pendingTargetIndex > 0 && pendingTargetIndex <= sessions.length) {
      // 이전 세션들을 보고 현재 세트 번호 계산
      for (let i = pendingTargetIndex - 1; i >= 0; i--) {
        const prevSession = sessions[i];
        if (prevSession.setNumber) {
          targetSetNumber = prevSession.setNumber;
          break;
        }
        if (!prevSession.isRest && !prevSession.isNewAction) {
          // 휴식이나 새액션이 아닌 실제 작업 세션이면 현재 세트
          targetSetNumber = 1;
          break;
        }
      }
    }
    
    console.log('📍 [DurationConfirm] 계산된 타겟 세트 번호:', targetSetNumber);

    // 새로운 액티비티 세션 생성 (세트 번호 포함)
    const activitySession: DaySession = {
      id: generateUniqueId(),
      startTime: startTime,
      endTime: now.toISOString(),
      action: pendingActivity.name,
      status: 'finished',
      setNumber: targetSetNumber  // 🔥 세트 번호 설정!
    };

    console.log('📝 [DurationConfirm] 새 액티비티 세션 생성:', {
      sessionId: activitySession.id,
      action: activitySession.action,
      setNumber: activitySession.setNumber,
      startTime,
      endTime: activitySession.endTime
    });
    
    // 간단하게 현재 sessions 배열에 직접 삽입
    const newSessions = [...sessions];
    
    // targetIndex가 배열 범위를 벗어나면 마지막에 추가
    const insertIndex = Math.min(pendingTargetIndex, newSessions.length);
    newSessions.splice(insertIndex, 0, activitySession);
    
    console.log('📋 [DurationConfirm] 삽입 후 sessions 배열:', newSessions.map((s, i) => ({ 
      index: i, 
      id: s.id, 
      action: s.action, 
      status: s.status
    })));
    
    const resultSessions = newSessions;
      
    console.log('✅ [DurationConfirm] 최종 세션 배열:', resultSessions.map(s => ({ id: s.id, action: s.action, status: s.status })));
    
    // 세션 업데이트
    setSessions(resultSessions);
    
    // 상태 정리
    console.log('🚪 [DurationConfirm] 모달 닫기');
    setDurationModalOpen(false);
    setPendingActivity(null);
    setPendingTargetIndex(0);
    
    console.log('✅ [DurationConfirm] 액션 추가 완료!');
  };

  // 전체 기록 삭제 함수 (API 연동)
  const handleResetDay = async () => {
    console.log('🗑️ [ResetDay] 하루 기록 초기화 시작');
    
    setIsLoading(true);
    setError('');
    
    try {
      // 서버에서 해당 날짜의 모든 세션 삭제
      await DaySessionsService.updateDayRecord(selectedDate, {
        date: selectedDate,
        sessions: [] // 빈 배열로 전송하여 모든 세션 삭제
      });
      
      // 로컬 상태 초기화
      setSessions([]);
      
      // 부모 컴포넌트에 빈 배열로 업데이트
      onSessionsUpdate(selectedDate, []);
      
      console.log('✅ [ResetDay] 하루 기록 초기화 완료');
    } catch (error: any) {
      console.error('하루 기록 삭제 중 오류:', error);
      setError(error.detail || '기록 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentSession = getCurrentSession();
  const completedSessions = sessions.filter(s => s.startTime && (s.status === 'finished' || s.endTime || s.action));
  
  // 세트별로 세션들을 그룹화하는 함수 (명시적 세트 번호 고려)
  const getSessionsWithSetLabels = () => {
    console.log('🏷️ [SetLabels] 세트 라벨 생성 시작, completedSessions:', completedSessions.map(s => ({ 
      id: s.id, 
      action: s.action, 
      status: s.status, 
      isRest: s.isRest, 
      isNewAction: s.isNewAction, 
      setNumber: s.setNumber 
    })));
    
    const result: Array<{ type: 'session'; session: DaySession; isLast: boolean } | { type: 'setLabel'; setNumber: number }> = [];
    let currentSetNumber = 1;
    let hasAddedFirstSetLabel = false;
    let lastAddedSetNumber = 0;
    
    completedSessions.forEach((session, index) => {
      console.log(`🏷️ [SetLabels] 세션 ${index} 처리:`, { 
        action: session.action, 
        isRest: session.isRest, 
        isNewAction: session.isNewAction,
        status: session.status,
        explicitSetNumber: session.setNumber,
        currentSetNumber 
      });
      
      // 명시적 세트 번호가 있는 경우 (마감 버튼으로 생성되거나 드래그 앤 드롭된 세션)
      if (session.setNumber && !session.isRest) {
        // 새로운 세트 번호라면 라벨 추가
        if (session.setNumber !== lastAddedSetNumber) {
          console.log('🏷️ [SetLabels] 명시적 세트 번호 발견 - 새 라벨 추가:', session.setNumber);
          result.push({ type: 'setLabel', setNumber: session.setNumber });
          lastAddedSetNumber = session.setNumber;
          currentSetNumber = session.setNumber;
        }
      }
      // 첫 번째 세션 앞에 1세트 라벨 추가 (명시적 세트 번호가 없는 경우)
      else if (!hasAddedFirstSetLabel && !session.isRest && !session.setNumber) {
        console.log('🏷️ [SetLabels] 첫 번째 세트 라벨 추가:', currentSetNumber);
        result.push({ type: 'setLabel', setNumber: currentSetNumber });
        hasAddedFirstSetLabel = true;
        lastAddedSetNumber = currentSetNumber;
      }
      // 기존 로직: 새로운 세트 시작 감지 (명시적 세트 번호가 없는 경우만)
      else if (index > 0 && !session.isRest && !session.isNewAction && !session.setNumber) {
        console.log('🏷️ [SetLabels] 새 세트 시작 감지 시도 - 이전 세션들 확인...');
        // 이전 세션들 중에서 마지막으로 완료된 작업 세션을 찾기
        let shouldAddSetLabel = false;
        for (let i = index - 1; i >= 0; i--) {
          const prevSession = completedSessions[i];
          console.log(`🏷️ [SetLabels] 이전 세션 ${i} 확인:`, { 
            action: prevSession.action, 
            isRest: prevSession.isRest, 
            status: prevSession.status,
            setNumber: prevSession.setNumber 
          });
          
          // 이전 세션이 명시적 세트 번호를 가진 세션이면 세트 분리 여부 판단
          if (prevSession.setNumber) {
            // 마감으로 종료된 세트 후 새 세션이면 세트 분리
            if (prevSession.status === 'finished') {
              console.log('🏷️ [SetLabels] 마감된 세트 후 새 세션 - 세트 분리 필요');
              shouldAddSetLabel = true;
            }
            break;
          }
          
          if (!prevSession.isRest && prevSession.status === 'finished') {
            console.log('🏷️ [SetLabels] 완료된 작업 세션 발견 - 새 세트 생성 필요');
            shouldAddSetLabel = true;
            break;
          }
          if (!prevSession.isRest) {
            console.log('🏷️ [SetLabels] 미완료 작업 세션 발견 - 새 세트 생성 중단');
            break; // 휴식이 아닌 미완료 세션을 만나면 중단
          }
        }
        
        if (shouldAddSetLabel) {
          currentSetNumber++;
          console.log('🏷️ [SetLabels] 새 세트 라벨 추가:', currentSetNumber);
          result.push({ type: 'setLabel', setNumber: currentSetNumber });
          lastAddedSetNumber = currentSetNumber;
        }
      }
      
      result.push({ 
        type: 'session', 
        session, 
        isLast: index === completedSessions.length - 1 
      });
    });
    
    console.log('🏷️ [SetLabels] 최종 결과:', result.map(item => item.type === 'setLabel' ? `세트${item.setNumber}` : `세션:${item.session.action}(세트:${item.session.setNumber || 'auto'})`));
    return result;
  };
  
  const sessionsWithLabels = getSessionsWithSetLabels();

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden relative">
      <div className={`h-full overflow-y-auto pb-32 transition-all duration-300 scrollbar-hide ${
        drawerOpen ? 'pr-[20%]' : ''
      }`}>
        <div className="px-4 py-2 bg-white border-b border-gray-200 relative">
          <p className="text-sm text-gray-600 text-center">
            {formatDateDisplay()} 세트 {isLoading && '(저장 중...)'}
          </p>
          
          {/* 전체 기록 삭제 버튼 */}
          {sessions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="하루 기록 전체 삭제"
                >
                  <RotateCcw className="w-4 h-4 text-gray-500" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>하루 기록을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {formatDateDisplay()}의 모든 기록이 삭제됩니다.
                    <br />
                    이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetDay}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        <div className="p-4">
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-xs text-red-500 underline mt-1"
              >
                닫기
              </button>
            </div>
          )}

          {completedSessions.length > 0 ? (
            <div className="space-y-0 mb-6">
              {/* 첫 번째 드롭존 */}
              {completedSessions.length > 0 && (
                <ActivityDropZone
                  key="dropzone-start"
                  index={0}
                  onDrop={handleActivityDrop}
                  isVisible={isDragging}
                />
              )}
              
              {sessionsWithLabels.map((item, index) => {
                const uniqueKey = item.type === 'setLabel' 
                  ? `set-label-${item.setNumber}-${index}` 
                  : `session-item-${item.session.id}-${index}`;
                
                return (
                  <div key={uniqueKey}>
                    {item.type === 'setLabel' ? (
                      <SetLabel setNumber={item.setNumber} />
                    ) : (
                      <>
                        <DaySessionItem 
                          session={item.session}
                          isLast={item.isLast}
                          onEditAction={handleEditAction}
                          onDeleteAction={handleDeleteAction}
                        />
                        {/* 각 세션 아이템 뒤 드롭존 */}
                        <ActivityDropZone
                          key={`dropzone-after-${item.session.id}-${index}`}
                          index={index + 1}
                          onDrop={handleActivityDrop}
                          isVisible={isDragging}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">아직 기록이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-1">시작 버튼을 눌러 하루를 기록해보세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* 고정된 액션 버튼 영역 */}
      <div className="fixed left-0 right-0 z-10" style={{ bottom: '138px' }}>
        <ActionButton
          status={currentSession?.status || 'ready'}
          onAction={handleAction}
        />
      </div>

      <ActionInputModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onSave={handleActionSave}
        title={modalType === 'complete' ? '완료한 액션을 기록하세요' : '계속할 액션을 기록하세요'}
        placeholder={
          modalType === 'complete' 
            ? "무엇을 완료했나요? 예: 프로그램 로직 전체 재정비 완료!"
            : "무엇을 계속할 예정인가요?"
        }
      />

      {/* 시간 ��력 모달 */}
      <DurationInputModal
        isOpen={durationModalOpen}
        onClose={() => {
          setDurationModalOpen(false);
          setPendingActivity(null);
          setPendingTargetIndex(0);
        }}
        onConfirm={handleDurationConfirm}
        activity={pendingActivity}
      />

      {/* 서랍 탭 버튼 */}
      {!drawerOpen && (
        <DrawerTab onClick={() => setDrawerOpen(true)} />
      )}

      {/* 액티비티 서랍 */}
      <ActivityDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onActivityDrop={handleActivityDrop}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onManageClick={onActivityManage}
        activities={activityList}
      />
    </div>
  );
}