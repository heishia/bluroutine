// API 설정 테스트 파일
import { apiClient, tokenUtils } from './config';

export const testApiConfig = async () => {
  console.log('🧪 API 설정 테스트 시작...');
  
  try {
    // 1. 백엔드 서버 연결 테스트
    console.log('1️⃣ 백엔드 서버 연결 테스트...');
    const healthResponse = await apiClient.get('/health');
    console.log('✅ 서버 연결 성공:', healthResponse.data);
    
    // 2. 토큰 없이 인증이 필요한 API 호출 (401 에러 예상)
    console.log('2️⃣ 토큰 없이 인증 API 호출 테스트...');
    try {
      await apiClient.get('/auth/me');
      console.log('❌ 예상치 못한 성공 (401 에러가 나와야 함)');
    } catch (error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 401) {
        console.log('✅ 401 에러 정상 처리됨');
      } else {
        console.log('⚠️ 예상과 다른 에러:', axiosError.response?.status);
      }
    }
    
    // 3. 토큰 유틸 함수 테스트
    console.log('3️⃣ 토큰 유틸 함수 테스트...');
    
    // 토큰 저장 테스트
    tokenUtils.setToken('test-token-123');
    const savedToken = tokenUtils.getToken();
    console.log('✅ 토큰 저장/조회:', savedToken === 'test-token-123' ? '성공' : '실패');
    
    // 토큰 유효성 검사 테스트
    const isValid = tokenUtils.isTokenValid();
    console.log('✅ 토큰 유효성 검사:', isValid ? '유효함' : '유효하지 않음');
    
    // 토큰 제거 테스트
    tokenUtils.removeToken();
    const removedToken = tokenUtils.getToken();
    console.log('✅ 토큰 제거:', removedToken === null ? '성공' : '실패');
    
    console.log('🎉 API 설정 테스트 완료!');
    return true;
    
  } catch (error) {
    const err = error as any;
    console.error('❌ API 설정 테스트 실패:', err.message);
    return false;
  }
};

// 브라우저 콘솔에서 직접 실행할 수 있도록 전역 함수로 등록
if (typeof window !== 'undefined') {
  (window as any).testApiConfig = testApiConfig;
}
