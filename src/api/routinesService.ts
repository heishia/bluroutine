import { apiClient, ApiResponse, ApiError } from './config';

// 루틴 관련 타입 정의
export interface RoutineCreate {
  timeAction: string;
  routineText: string;
  emoji?: string;
}

export interface RoutineUpdate {
  timeAction?: string;
  routineText?: string;
  emoji?: string;
}

export interface RoutineResponse {
  id: string;
  userId: string;
  timeAction: string;
  routineText: string;
  emoji?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineReorder {
  routineIds: string[]; // 새로운 순서대로 정렬된 루틴 ID 배열
}

// 루틴 API 서비스 클래스
export class RoutinesService {
  /**
   * 사용자의 모든 루틴 조회 (순서대로 정렬)
   */
  static async getRoutines(): Promise<RoutineResponse[]> {
    try {
      const response = await apiClient.get<RoutineResponse[]>('/routines');
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '루틴 목록 조회 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 새 루틴 생성
   */
  static async createRoutine(routineData: RoutineCreate): Promise<RoutineResponse> {
    try {
      const response = await apiClient.post<RoutineResponse>('/routines', routineData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '루틴 생성 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 루틴 수정
   */
  static async updateRoutine(routineId: string, routineData: RoutineUpdate): Promise<RoutineResponse> {
    try {
      const response = await apiClient.put<RoutineResponse>(`/routines/${routineId}`, routineData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '루틴 수정 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 루틴 삭제
   */
  static async deleteRoutine(routineId: string): Promise<void> {
    try {
      await apiClient.delete(`/routines/${routineId}`);
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '루틴 삭제 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 루틴 순서 변경
   */
  static async reorderRoutines(routineIds: string[]): Promise<RoutineResponse[]> {
    try {
      const reorderData: RoutineReorder = { routineIds };
      const response = await apiClient.put<RoutineResponse[]>('/routines/reorder', reorderData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '루틴 순서 변경 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 특정 루틴 조회 (ID로)
   */
  static async getRoutineById(routineId: string): Promise<RoutineResponse | null> {
    try {
      const routines = await this.getRoutines();
      return routines.find(routine => routine.id === routineId) || null;
    } catch (error) {
      console.error('루틴 조회 중 오류:', error);
      return null;
    }
  }

  /**
   * 루틴 복제
   */
  static async duplicateRoutine(routineId: string): Promise<RoutineResponse> {
    try {
      const originalRoutine = await this.getRoutineById(routineId);
      if (!originalRoutine) {
        throw new Error('복제할 루틴을 찾을 수 없습니다.');
      }

      const duplicateData: RoutineCreate = {
        timeAction: originalRoutine.timeAction,
        routineText: `${originalRoutine.routineText} (복사)`,
        emoji: originalRoutine.emoji
      };

      return await this.createRoutine(duplicateData);
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || error.message || '루틴 복제 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 시간대별 루틴 조회 (편의 함수)
   */
  static async getRoutinesByTimeAction(timeAction: string): Promise<RoutineResponse[]> {
    try {
      const routines = await this.getRoutines();
      return routines.filter(routine => routine.timeAction === timeAction);
    } catch (error) {
      console.error('시간대별 루틴 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 루틴 검색 (텍스트 기반)
   */
  static async searchRoutines(searchText: string): Promise<RoutineResponse[]> {
    try {
      const routines = await this.getRoutines();
      const lowerSearchText = searchText.toLowerCase();
      
      return routines.filter(routine => 
        routine.routineText.toLowerCase().includes(lowerSearchText) ||
        routine.timeAction.toLowerCase().includes(lowerSearchText)
      );
    } catch (error) {
      console.error('루틴 검색 중 오류:', error);
      return [];
    }
  }
}

// 편의 함수들
export const routinesService = RoutinesService;

export default RoutinesService;
