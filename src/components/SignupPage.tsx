import React, { useState } from 'react';
import { ChevronLeft, User, Mail, Lock, Check, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
// public 폴더의 이미지를 직접 참조
const bluroutineLogoText = '/c54fa64742fbc82256e77a30852c438a7cd75cbc.png';

interface SignupPageProps {
  onBack: () => void;
  onSignup: (email: string, password: string, name: string) => Promise<void>;
}

export function SignupPage({ onBack, onSignup }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
    robaco: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 실시간 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAgreementChange = (field: string, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [field]: checked }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 2글자 이상 입력해주세요.';
    }

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자리 이상 입력해주세요.';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // 필수 약관 동의 검증
    if (!agreements.terms) {
      newErrors.terms = '이용약관에 동의해주세요.';
    }
    if (!agreements.privacy) {
      newErrors.privacy = '개인정보처리방침에 동의해주세요.';
    }
    if (!agreements.robaco) {
      newErrors.robaco = '로바코 통합 회원가입에 동의해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && !isLoading) {
      setIsLoading(true);
      setErrors({}); // 기존 에러 초기화
      
      try {
        await onSignup(formData.email, formData.password, formData.name);
      } catch (error: any) {
        // API 에러 처리
        const errorMessage = error.detail || error.message || '회원가입 중 오류가 발생했습니다.';
        setErrors({ submit: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const allRequiredAgreed = agreements.terms && agreements.privacy && agreements.robaco;
  const isFormValid = formData.name && formData.email && formData.password && formData.confirmPassword && allRequiredAgreed;

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-medium">회원가입</h1>
        <div className="w-10"></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-sm mx-auto px-6 py-8 space-y-6">
          {/* 로고 */}
          <div className="text-center mb-8">
            <img 
              src={bluroutineLogoText} 
              alt="BLUROUTINE" 
              className="w-auto h-auto mx-auto mb-4"
              style={{ 
                imageRendering: 'crisp-edges',
                filter: 'contrast(1.1) brightness(1.05)',
                transform: 'scale(0.6)',
                objectFit: 'contain'
              }}
            />
            <p className="text-gray-600 text-sm">
              bluroutine과 함께 즐거운 루틴을 시작해보세요
            </p>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">이름 *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="실명을 입력해주세요"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">이메일 *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">비밀번호 *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="8자리 이상 입력해주세요"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">비밀번호 확인 *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
            </div>
          </form>

          {/* 개발자 소개 */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-brand-primary flex items-center gap-2">
              <User className="w-4 h-4" />
              개발자 소개
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>안녕하세요! <span className="font-medium text-brand-primary">바이브 코딩 개발자 김뽑희</span>입니다.</p>
              <p>다양한 생산성 어플을 개발하고 있습니다.</p>
              <p>제가 만드는 모든 어플은 <span className="font-medium text-brand-primary">로바코 서버</span>에서 데이터베이스를 통합 관리합니다.</p>
              <p>회원가입은 통합으로 진행되므로 다른 어플도 동일하게 사용하실 수 있습니다.</p>
              <div className="flex items-center gap-1 text-brand-primary">
                <ExternalLink className="w-3 h-3" />
                <span className="text-xs">시간이 되신다면 다른 무료 어플들도 확인해보세요!</span>
              </div>
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="space-y-4">
            <h3 className="font-medium">서비스 이용 동의</h3>
            
            {/* 필수 약관들 */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={agreements.terms}
                  onCheckedChange={(checked) => handleAgreementChange('terms', !!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    <span className="text-red-500">*</span> 이용약관에 동의합니다
                  </Label>
                  {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={agreements.privacy}
                  onCheckedChange={(checked) => handleAgreementChange('privacy', !!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="privacy" className="text-sm cursor-pointer">
                    <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다
                  </Label>
                  {errors.privacy && <p className="text-red-500 text-xs mt-1">{errors.privacy}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="robaco"
                  checked={agreements.robaco}
                  onCheckedChange={(checked) => handleAgreementChange('robaco', !!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="robaco" className="text-sm cursor-pointer">
                    <span className="text-red-500">*</span> 로바코 통합 회원가입에 동의합니다
                  </Label>
                  {errors.robaco && <p className="text-red-500 text-xs mt-1">{errors.robaco}</p>}
                </div>
              </div>

              {/* 선택 약관 */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketing"
                  checked={agreements.marketing}
                  onCheckedChange={(checked) => handleAgreementChange('marketing', !!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="marketing" className="text-sm cursor-pointer">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    새로운 기능과 업데이트 소식을 받아보실 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 데이터 수집 안내 */}
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">데이터 수집 및 이용 안내</p>
                  <p>서비스 이용을 위해 필요한 최소한의 개인정보만 수집합니다. 로그인하지 않으면 어플 사용이 제한됩니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 에러 메시지 표시 */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* 회원가입 버튼 */}
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className="w-full py-3"
            style={{ backgroundColor: isFormValid && !isLoading ? 'var(--brand-primary)' : undefined }}
          >
            {isLoading ? '회원가입 중...' : '회원가입 완료'}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={onBack}
                className="text-brand-primary underline hover:no-underline"
              >
                로그인하기
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}