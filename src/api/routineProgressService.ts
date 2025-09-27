import { apiClient, ApiResponse, ApiError } from './config';

// 루틴 진행상황 관련 타입 정의
export interface RoutineProgressCreate {
  routineId: string;
  date: string; // YYYY-MM-DD 형식
  isCompleted: boolean;
}

export interface RoutineProgressResponse {
  id: string;
  userId: string;
  routineId: string;
  date: string; // YYYY-MM-DD 형식
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineProgressToggle {
  routineId: string;
  date: string; // YYYY-MM-DD 형식
}

export interface DailyRoutineProgress {
  date: string;
  routines: Array<{
    id: string;
    timeAction: string;
    routineText: string;
    emoji?: string;
    orderIndex: number;
    isCompleted: boolean;
    completedAt?: string;
  }>;
}

export interface WeeklyRoutineProgress {
  startDate: string;
  endDate: string;
  dailyProgress: DailyRoutineProgress[];
}

// 진행상황 통계 타입
export interface ProgressStats {
  totalRoutines: number;
  completedRoutines: number;
  completionRate: number;
  streak: number; // 연속 완료 일수
  bestStreak: number; // 최고 연속 완료 일수
}

// 루틴 진행상황 API 서비스 클래스
export class RoutineProgressService {
  /**
   * 특정 날짜의 루틴 진행상황 조회
   */
  static async getRoutineProgress(date: string): Promise<RoutineProgressResponse[]> {
    try {
      const response = await apiClient.get<RoutineProgressResponse[]>(`/routine-progress?date=${date}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '루틴 진행상황 조회 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 루틴 완료 상태 토글 (완료 ↔ 미완료)
   */
  static async toggleRoutineProgress(progressData: RoutineProgressToggle): Promise<RoutineProgressResponse> {
    try {
      const response = await apiClient.post<RoutineProgressResponse>('/routine-progress', progressData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '루틴 상태 변경 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 특정 날짜의 일일 루틴 진행상황 조회 (루틴 정보 포함)
   */
  static async getDailyRoutineProgress(date: string): Promise<DailyRoutineProgress> {
    try {
      const response = await apiClient.get<DailyRoutineProgress>(`/routine-progress/daily?date=${date}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '일일 루틴 진행상황 조회 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 주간 루틴 진행상황 조회
   */
  static async getWeeklyRoutineProgress(startDate: string, endDate: string): Promise<WeeklyRoutineProgress> {
    try {
      const response = await apiClient.get<WeeklyRoutineProgress>(
        `/routine-progress/week?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '주간 루틴 진행상황 조회 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 오늘의 루틴 진행상황 조회
   */
  static async getTodayProgress(): Promise<DailyRoutineProgress> {
    const today = new Date().toISOString().split('T')[0];
    return this.getDailyRoutineProgress(today);
  }

  /**
   * 이번 주 루틴 진행상황 조회
   */
  static async getThisWeekProgress(): Promise<WeeklyRoutineProgress> {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일을 주 시작으로
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const startDate = monday.toISOString().split('T')[0];
    const endDate = sunday.toISOString().split('T')[0];
    
    return this.getWeeklyRoutineProgress(startDate, endDate);
  }

  /**
   * 월간 루틴 진행상황 조회
   */
  static async getMonthlyProgress(year: number, month: number): Promise<DailyRoutineProgress[]> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // 해당 월의 마지막 날
      
      const weeklyProgress = await this.getWeeklyRoutineProgress(startDate, endDate);
      return weeklyProgress.dailyProgress;
    } catch (error) {
      console.error('월간 진행상황 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 진행상황 통계 계산
   */
  static async getProgressStats(date: string): Promise<ProgressStats> {
    try {
      const dailyProgress = await this.getDailyRoutineProgress(date);
      const totalRoutines = dailyProgress.routines.length;
      const completedRoutines = dailyProgress.routines.filter(r => r.isCompleted).length;
      const completionRate = totalRoutines > 0 ? (completedRoutines / totalRoutines) * 100 : 0;

      // 연속 완료 일수 계산 (간단한 버전)
      const streak = await this.calculateStreak(date);
      const bestStreak = await this.calculateBestStreak();

      return {
        totalRoutines,
        completedRoutines,
        completionRate: Math.round(completionRate * 100) / 100, // 소수점 2자리
        streak,
        bestStreak
      };
    } catch (error) {
      console.error('진행상황 통계 계산 중 오류:', error);
      return {
        totalRoutines: 0,
        completedRoutines: 0,
        completionRate: 0,
        streak: 0,
        bestStreak: 0
      };
    }
  }

  /**
   * 연속 완료 일수 계산 (현재 날짜부터 역순으로)
   */
  private static async calculateStreak(currentDate: string): Promise<number> {
    try {
      let streak = 0;
      let checkDate = new Date(currentDate);

      for (let i = 0; i < 30; i++) { // 최대 30일까지만 확인
        const dateStr = checkDate.toISOString().split('T')[0];
        const dailyProgress = await this.getDailyRoutineProgress(dateStr);
        
        const totalRoutines = dailyProgress.routines.length;
        const completedRoutines = dailyProgress.routines.filter(r => r.isCompleted).length;
        
        if (totalRoutines > 0 && completedRoutines === totalRoutines) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('연속 완료 일수 계산 중 오류:', error);
      return 0;
    }
  }

  /**
   * 최고 연속 완료 일수 계산 (구현 복잡도로 인해 간단한 버전)
   */
  private static async calculateBestStreak(): Promise<number> {
    // 실제로는 서버에서 계산하는 것이 효율적
    // 여기서는 현재 streak을 반환 (간단한 구현)
    const today = new Date().toISOString().split('T')[0];
    return this.calculateStreak(today);
  }

  /**
   * 완료율이 높은 루틴 조회
   */
  static async getTopPerformingRoutines(days: number = 7): Promise<Array<{
    routineId: string;
    routineText: string;
    completionRate: number;
    totalDays: number;
    completedDays: number;
  }>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days + 1);

      const weeklyProgress = await this.getWeeklyRoutineProgress(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      const routineStats: { [routineId: string]: { 
        routineText: string;
        totalDays: number;
        completedDays: number;
      } } = {};

      // 각 루틴별 통계 계산
      weeklyProgress.dailyProgress.forEach(daily => {
        daily.routines.forEach(routine => {
          if (!routineStats[routine.id]) {
            routineStats[routine.id] = {
              routineText: routine.routineText,
              totalDays: 0,
              completedDays: 0
            };
          }
          routineStats[routine.id].totalDays++;
          if (routine.isCompleted) {
            routineStats[routine.id].completedDays++;
          }
        });
      });

      // 완료율 계산 및 정렬
      return Object.entries(routineStats)
        .map(([routineId, stats]) => ({
          routineId,
          routineText: stats.routineText,
          completionRate: (stats.completedDays / stats.totalDays) * 100,
          totalDays: stats.totalDays,
          completedDays: stats.completedDays
        }))
        .sort((a, b) => b.completionRate - a.completionRate);

    } catch (error) {
      console.error('상위 성과 루틴 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 날짜 유틸리티 함수들
   */
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

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
}

// 편의 함수들
export const routineProgressService = RoutineProgressService;

export default RoutineProgressService;
