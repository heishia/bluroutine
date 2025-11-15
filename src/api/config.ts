import axios from 'axios';

// 환경에 따른 API URL 설정
const isProduction = process.env.NODE_ENV === 'production';
const isMobile = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;

// 백엔드 API 기본 URL
export const API_BASE_URL = isProduction || isMobile 
  ? 'https://bluroutine-production.up.railway.app'  // Railway 배포 서버
  : 'http://localhost:3001';  // 개발 환경

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 시 토큰 제거 및 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // 로그인 페이지로 리다이렉트 (필요시)
      // window.location.href = '/login';
    }
    
    // 에러 로깅
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.detail || error.message,
      url: error.config?.url,
    });
    
    return Promise.reject(error);
  }
);

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

// API 에러 타입 정의
export interface ApiError {
  detail: string;
  status?: number;
}

// 토큰 관련 유틸 함수들
export const tokenUtils = {
  // 토큰 저장
  setToken: (token: string) => {
    localStorage.setItem('access_token', token);
  },
  
  // 토큰 가져오기
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },
  
  // 토큰 제거
  removeToken: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
  
  // 토큰 유효성 검사 (간단한 형태)
  isTokenValid: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },
};

export default apiClient;
