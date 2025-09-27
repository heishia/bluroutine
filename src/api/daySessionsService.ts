import { apiClient, ApiResponse, ApiError } from './config';

// 데이 세션 관련 타입 정의
export type SessionStatus = 'ready' | 'started' | 'completed' | 'resting' | 'rest_finished' | 'finished';

export interface DaySession {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD 형식
  start_time: string; // ISO 형식
  end_time?: string; // ISO 형식
  action?: string;
  status: SessionStatus;
  is_rest?: boolean;
  is_new_action?: boolean;
  set_number?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DaySessionCreate {
  date: string; // YYYY-MM-DD 형식
  start_time: string; // ISO 형식
  end_time?: string; // ISO 형식
  action?: string;
  status?: SessionStatus;
  is_rest?: boolean;
  is_new_action?: boolean;
  set_number?: number;
}

export interface DaySessionUpdate {
  start_time?: string; // ISO 형식
  end_time?: string; // ISO 형식
  action?: string;
  status?: SessionStatus;
  is_rest?: boolean;
  is_new_action?: boolean;
  set_number?: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD 형식
  sessions: DaySession[];
}

export interface DayRecordUpdate {
  date: string; // YYYY-MM-DD 형식
  sessions: DaySessionCreate[];
}

// 세션 통계 타입
export interface SessionStats {
  totalSessions: number;
  totalDuration: number; // 분 단위
  averageDuration: number; // 분 단위
  completedSessions: number;
  restSessions: number;
  actionSessions: number;
  longestSession: number; // 분 단위
  shortestSession: number; // 분 단위
}

// 데이 세션 API 서비스 클래스
export class DaySessionsService {
  /**
   * 특정 날짜의 데이 세션들 조회
   */
  static async getDaySessions(date: string): Promise<DayRecord> {
    try {
      const response = await apiClient.get<DayRecord>(`/api/day-sessions/${date}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '데이 세션 조회 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 새 데이 세션 생성
   */
  static async createDaySession(sessionData: DaySessionCreate): Promise<DaySession> {
    try {
      const response = await apiClient.post<DaySession>('/api/day-sessions', sessionData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '데이 세션 생성 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 데이 세션 업데이트
   */
  static async updateDaySession(sessionId: string, sessionData: DaySessionUpdate): Promise<DaySession> {
    try {
      const response = await apiClient.put<DaySession>(`/api/day-sessions/${sessionId}`, sessionData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '데이 세션 업데이트 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 데이 세션 삭제
   */
  static async deleteDaySession(sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/day-sessions/${sessionId}`);
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '데이 세션 삭제 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 하루 전체 세션 업데이트 (bulk update)
   */
  static async updateDayRecord(date: string, recordData: DayRecordUpdate): Promise<DayRecord> {
    try {
      const response = await apiClient.put<DayRecord>(`/api/day-sessions/bulk/${date}`, recordData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '하루 기록 업데이트 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 오늘의 데이 세션들 조회
   */
  static async getTodaySessions(): Promise<DayRecord> {
    const today = new Date().toISOString().split('T')[0];
    return this.getDaySessions(today);
  }

  /**
   * 세션 시작
   */
  static async startSession(action?: string): Promise<DaySession> {
    const now = new Date();
    const sessionData: DaySessionCreate = {
      date: now.toISOString().split('T')[0],
      start_time: now.toISOString(),
      action: action,
      status: 'started'
    };
    
    return this.createDaySession(sessionData);
  }

  /**
   * 세션 완료
   */
  static async completeSession(sessionId: string, action?: string): Promise<DaySession> {
    const updateData: DaySessionUpdate = {
      end_time: new Date().toISOString(),
      status: 'completed'
    };
    
    if (action) {
      updateData.action = action;
    }
    
    return this.updateDaySession(sessionId, updateData);
  }

  /**
   * 휴식 세션 생성
   */
  static async createRestSession(duration?: number): Promise<DaySession> {
    const now = new Date();
    const endTime = duration ? new Date(now.getTime() + duration * 60000) : undefined; // duration은 분 단위
    
    const sessionData: DaySessionCreate = {
      date: now.toISOString().split('T')[0],
      start_time: now.toISOString(),
      end_time: endTime?.toISOString(),
      action: '휴식',
      status: duration ? 'finished' : 'resting',
      is_rest: true
    };
    
    return this.createDaySession(sessionData);
  }

  /**
   * 새 액션 세션 생성
   */
  static async createNewActionSession(action: string, setNumber?: number): Promise<DaySession> {
    const sessionData: DaySessionCreate = {
      date: new Date().toISOString().split('T')[0],
      start_time: new Date().toISOString(),
      action: action,
      status: 'started',
      is_new_action: true,
      set_number: setNumber
    };
    
    return this.createDaySession(sessionData);
  }

  /**
   * 세션 통계 계산
   */
  static async getSessionStats(date: string): Promise<SessionStats> {
    try {
      const dayRecord = await this.getDaySessions(date);
      const sessions = dayRecord.sessions;

      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          totalDuration: 0,
          averageDuration: 0,
          completedSessions: 0,
          restSessions: 0,
          actionSessions: 0,
          longestSession: 0,
          shortestSession: 0
        };
      }

      const durations = sessions
        .filter(s => s.end_time)
        .map(s => this.calculateDuration(s.start_time, s.end_time!));

      const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
      const averageDuration = durations.length > 0 ? totalDuration / durations.length : 0;
      const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'finished').length;
      const restSessions = sessions.filter(s => s.is_rest).length;
      const actionSessions = sessions.filter(s => !s.is_rest && s.action).length;

      return {
        totalSessions: sessions.length,
        totalDuration,
        averageDuration,
        completedSessions,
        restSessions,
        actionSessions,
        longestSession: durations.length > 0 ? Math.max(...durations) : 0,
        shortestSession: durations.length > 0 ? Math.min(...durations) : 0
      };
    } catch (error) {
      console.error('세션 통계 계산 중 오류:', error);
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
        completedSessions: 0,
        restSessions: 0,
        actionSessions: 0,
        longestSession: 0,
        shortestSession: 0
      };
    }
  }

  /**
   * 현재 진행 중인 세션 조회
   */
  static async getCurrentSession(): Promise<DaySession | null> {
    try {
      const todaySessions = await this.getTodaySessions();
      const currentSession = todaySessions.sessions.find(
        s => s.status === 'started' || s.status === 'resting'
      );
      return currentSession || null;
    } catch (error) {
      console.error('현재 세션 조회 중 오류:', error);
      return null;
    }
  }

  /**
   * 주간 세션 데이터 조회
   */
  static async getWeeklySessions(startDate: string, endDate: string): Promise<DayRecord[]> {
    try {
      const dates = this.getDateRange(startDate, endDate);
      const promises = dates.map(date => this.getDaySessions(date));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('주간 세션 데이터 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 세션 복제
   */
  static async duplicateSession(sessionId: string, newDate?: string): Promise<DaySession> {
    try {
      const todaySessions = await this.getTodaySessions();
      const originalSession = todaySessions.sessions.find(s => s.id === sessionId);
      
      if (!originalSession) {
        throw new Error('복제할 세션을 찾을 수 없습니다.');
      }

      const duplicateData: DaySessionCreate = {
        date: newDate || new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        action: originalSession.action,
        status: 'ready',
        is_rest: originalSession.is_rest,
        is_new_action: originalSession.is_new_action,
        set_number: originalSession.set_number
      };

      return this.createDaySession(duplicateData);
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || error.message || '세션 복제 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 유틸리티 함수들
   */
  
  // 세션 지속 시간 계산 (분 단위)
  static calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / 60000); // 분 단위
  }

  // 시간 포맷팅 (HH:MM)
  static formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  // 지속 시간 포맷팅 (1시간 30분)
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
    return `${mins}분`;
  }

  // 날짜 범위 생성
  static getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  // 세션 상태 한글 변환
  static getStatusText(status: SessionStatus): string {
    const statusMap: { [key in SessionStatus]: string } = {
      'ready': '준비',
      'started': '진행 중',
      'completed': '완료',
      'resting': '휴식 중',
      'rest_finished': '휴식 완료',
      'finished': '종료'
    };
    return statusMap[status] || status;
  }

  // 세션 타입 판별
  static getSessionType(session: DaySession): 'rest' | 'action' | 'unknown' {
    if (session.is_rest) return 'rest';
    if (session.action) return 'action';
    return 'unknown';
  }
}

// 편의 함수들
export const daySessionsService = DaySessionsService;

export default DaySessionsService;
