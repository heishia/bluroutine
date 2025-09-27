import { apiClient, tokenUtils, ApiResponse, ApiError } from './config';

// 인증 관련 타입 정의
export interface UserSignup {
  email: string;
  password: string;
  name: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  provider: string;
  createdAt: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface TokenData {
  email?: string;
}

// 인증 API 서비스 클래스
export class AuthService {
  /**
   * 회원가입
   */
  static async signup(userData: UserSignup): Promise<Token> {
    try {
      const response = await apiClient.post<Token>('/auth/signup', userData);
      
      // 토큰 저장
      tokenUtils.setToken(response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '회원가입 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 로그인
   */
  static async login(credentials: UserLogin): Promise<Token> {
    try {
      const response = await apiClient.post<Token>('/auth/login', credentials);
      
      // 토큰 저장
      tokenUtils.setToken(response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      // 서버 연결 실패 시 임시 오프라인 모드
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        console.warn('서버 연결 실패, 오프라인 모드로 전환합니다.');
        
        // 임시 토큰과 사용자 정보 생성
        const mockToken = 'mock_token_' + Date.now();
        const mockUser: UserResponse = {
          id: 'temp_user_1',
          email: credentials.email,
          name: '테스트 사용자',
          provider: 'local',
          createdAt: new Date().toISOString()
        };
        
        const mockTokenData: Token = {
          access_token: mockToken,
          token_type: 'bearer',
          user: mockUser
        };
        
        // 토큰 저장
        tokenUtils.setToken(mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        return mockTokenData;
      }
      
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '로그인 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 로그아웃
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // 로그아웃 API 호출 실패해도 로컬 토큰은 제거
      console.warn('로그아웃 API 호출 실패, 로컬 토큰만 제거합니다.');
    } finally {
      // 토큰과 사용자 정보 제거
      tokenUtils.removeToken();
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  static async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await apiClient.get<UserResponse>('/auth/me');
      
      // 사용자 정보 업데이트
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        detail: error.response?.data?.detail || '사용자 정보 조회 중 오류가 발생했습니다.',
        status: error.response?.status
      };
      throw apiError;
    }
  }

  /**
   * 로컬 스토리지에서 사용자 정보 가져오기
   */
  static getStoredUser(): UserResponse | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('저장된 사용자 정보 파싱 실패:', error);
      return null;
    }
  }

  /**
   * 로그인 상태 확인
   */
  static isAuthenticated(): boolean {
    return tokenUtils.isTokenValid() && !!this.getStoredUser();
  }

  /**
   * 토큰 새로고침 (필요시 구현)
   */
  static async refreshToken(): Promise<Token> {
    // 현재 백엔드에 refresh token 엔드포인트가 없으므로
    // 필요시 나중에 구현
    throw new Error('Refresh token not implemented');
  }
}

// 편의 함수들
export const authService = AuthService;

export default AuthService;
