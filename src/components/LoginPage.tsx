import React, { useState } from 'react';
// public 폴더의 이미지를 직접 참조
const bluroutineLogoText = '/c54fa64742fbc82256e77a30852c438a7cd75cbc.png';
import { AuthService, UserLogin } from '../api/authService';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onSignupClick?: () => void;
}

export function LoginPage({ onLoginSuccess, onSignupClick }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 테스트 계정으로 빠른 로그인
  const handleTestLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await AuthService.login({
        email: 'test@bluroutine.com',
        password: 'test123'
      });
      onLoginSuccess();
    } catch (error: any) {
      setError(error.detail || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 로그인 (현재는 준비 중 메시지)
  const handleSocialLogin = (provider: 'kakao' | 'google' | 'naver') => {
    setError(`${provider} 로그인은 준비 중입니다. 🧪 개발자 테스트 계정을 이용해 주세요!`);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-sm mx-auto w-full space-y-4">
          <div className="text-center mb-12">
            <div className="mb-0">
              <img 
                src={bluroutineLogoText} 
                alt="BLUROUTINE" 
                className="w-auto h-auto mx-auto"
                style={{ 
                  imageRendering: 'crisp-edges',
                  filter: 'contrast(1.1) brightness(1.05)',
                  transform: 'scale(0.7)',
                  objectFit: 'contain'
                }}
              />
            </div>
            <p className="text-gray-600 text-base leading-relaxed">
              즐거운 몰입형 루틴 &<br />
              집중 관리 생산성 어플
            </p>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3">
            {/* 개발자 로그인 버튼 */}
            <button
              onClick={handleTestLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-6 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95 font-medium"
              style={{
                backgroundColor: '#FF6B35',
                color: '#ffffff'
              }}
            >
              {isLoading ? '로그인 중...' : '🧪 개발자 로그인'}
            </button>
            <button
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-6 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95 font-medium"
              style={{
                backgroundColor: '#FEE500',
                color: '#000000'
              }}
            >
              카카오로 계속하기
            </button>
            
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-6 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95 font-medium"
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1px solid #dadce0'
              }}
            >
              Google로 계속하기
            </button>
            
            <button
              onClick={() => handleSocialLogin('naver')}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-6 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95 font-medium"
              style={{
                backgroundColor: '#03C75A',
                color: '#ffffff'
              }}
            >
              네이버로 계속하기
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 회원가입 링크 */}
          <div className="text-center mt-6">
            <button
              onClick={onSignupClick}
              className="text-brand-primary underline hover:no-underline transition-all duration-200 text-sm"
            >
              회원가입하기
            </button>
          </div>

          {/* 약관 동의 */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500 leading-relaxed">
              로그인 시 <span className="text-brand-primary underline cursor-pointer">이용약관</span>과{' '}
              <span className="text-brand-primary underline cursor-pointer">개인정보처리방침</span>에<br />
              동의하게 됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}