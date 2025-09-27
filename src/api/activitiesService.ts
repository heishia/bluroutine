import { apiClient, ApiResponse, ApiError } from './config';

// 활동 관련 타입 정의
export interface ActivityCreate {
  name: string;
  color: string; // CSS 클래스명 (예: "bg-blue-200")
}

export interface ActivityUpdate {
  name?: string;
  color?: string;
}

export interface ActivityResponse {
  id: string;
  userId: string;
  name: string;
  color: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityReorder {
  activityIds: string[]; // 새로운 순서대로 정렬된 활동 ID 배열
}

// 미리 정의된 색상 옵션들
export const ACTIVITY_COLORS = [
  { name: '파란색', value: 'bg-blue-200', preview: '#BFDBFE' },
  { name: '초록색', value: 'bg-green-200', preview: '#BBF7D0' },
  { name: '보라색', value: 'bg-purple-200', preview: '#E9D5FF' },
  { name: '빨간색', value: 'bg-red-200', preview: '#FECACA' },
  { name: '노란색', value: 'bg-yellow-200', preview: '#FEF08A' },
  { name: '분홍색', value: 'bg-pink-200', preview: '#FBCFE8' },
  { name: '주황색', value: 'bg-orange-200', preview: '#FED7AA' },
  { name: '회색', value: 'bg-gray-200', preview: '#E5E7EB' },
  { name: '청록색', value: 'bg-teal-200', preview: '#99F6E4' },
  { name: '남색', value: 'bg-indigo-200', preview: '#C7D2FE' },
];

// 활동 API 서비스 클래스
export class ActivitiesService {
  /**
   * 사용자의 모든 활동 조회 (순서대로 정렬)
   */
  static async getActivities(): Promise<ActivityResponse[]> {
    try {
      const response = await apiClient.get<ActivityResponse[]>('/activities');
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '활동 목록 조회 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 새 활동 생성
   */
  static async createActivity(activityData: ActivityCreate): Promise<ActivityResponse> {
    try {
      const response = await apiClient.post<ActivityResponse>('/activities', activityData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '활동 생성 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 활동 수정
   */
  static async updateActivity(activityId: string, activityData: ActivityUpdate): Promise<ActivityResponse> {
    try {
      const response = await apiClient.put<ActivityResponse>(`/activities/${activityId}`, activityData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '활동 수정 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 활동 삭제
   */
  static async deleteActivity(activityId: string): Promise<void> {
    try {
      await apiClient.delete(`/activities/${activityId}`);
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '활동 삭제 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 활동 순서 변경
   */
  static async reorderActivities(activityIds: string[]): Promise<ActivityResponse[]> {
    try {
      const reorderData: ActivityReorder = { activityIds };
      const response = await apiClient.put<ActivityResponse[]>('/activities/reorder', reorderData);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '활동 순서 변경 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 특정 활동 조회 (ID로)
   */
  static async getActivityById(activityId: string): Promise<ActivityResponse | null> {
    try {
      const activities = await this.getActivities();
      return activities.find(activity => activity.id === activityId) || null;
    } catch (error) {
      console.error('활동 조회 중 오류:', error);
      return null;
    }
  }

  /**
   * 활동 복제
   */
  static async duplicateActivity(activityId: string): Promise<ActivityResponse> {
    try {
      const originalActivity = await this.getActivityById(activityId);
      if (!originalActivity) {
        throw new Error('복제할 활동을 찾을 수 없습니다.');
      }

      const duplicateData: ActivityCreate = {
        name: `${originalActivity.name} (복사)`,
        color: originalActivity.color
      };

      return await this.createActivity(duplicateData);
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || error.message || '활동 복제 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 활동 검색 (이름 기반)
   */
  static async searchActivities(searchText: string): Promise<ActivityResponse[]> {
    try {
      const activities = await this.getActivities();
      const lowerSearchText = searchText.toLowerCase();
      
      return activities.filter(activity => 
        activity.name.toLowerCase().includes(lowerSearchText)
      );
    } catch (error) {
      console.error('활동 검색 중 오류:', error);
      return [];
    }
  }

  /**
   * 색상별 활동 조회
   */
  static async getActivitiesByColor(color: string): Promise<ActivityResponse[]> {
    try {
      const activities = await this.getActivities();
      return activities.filter(activity => activity.color === color);
    } catch (error) {
      console.error('색상별 활동 조회 중 오류:', error);
      return [];
    }
  }

  /**
   * 활동 통계 정보
   */
  static async getActivityStats(): Promise<{
    totalCount: number;
    colorDistribution: { [color: string]: number };
    mostUsedColor: string;
  }> {
    try {
      const activities = await this.getActivities();
      
      const colorDistribution: { [color: string]: number } = {};
      activities.forEach(activity => {
        colorDistribution[activity.color] = (colorDistribution[activity.color] || 0) + 1;
      });

      const mostUsedColor = Object.keys(colorDistribution).reduce((a, b) => 
        colorDistribution[a] > colorDistribution[b] ? a : b, 
        Object.keys(colorDistribution)[0] || 'bg-gray-200'
      );

      return {
        totalCount: activities.length,
        colorDistribution,
        mostUsedColor
      };
    } catch (error) {
      console.error('활동 통계 조회 중 오류:', error);
      return {
        totalCount: 0,
        colorDistribution: {},
        mostUsedColor: 'bg-gray-200'
      };
    }
  }

  /**
   * 색상 유틸리티 함수들
   */
  static getColorName(colorValue: string): string {
    const colorOption = ACTIVITY_COLORS.find(c => c.value === colorValue);
    return colorOption?.name || '알 수 없음';
  }

  static getColorPreview(colorValue: string): string {
    const colorOption = ACTIVITY_COLORS.find(c => c.value === colorValue);
    return colorOption?.preview || '#E5E7EB';
  }

  static getAvailableColors() {
    return ACTIVITY_COLORS;
  }
}

// 편의 함수들
export const activitiesService = ActivitiesService;

export default ActivitiesService;
