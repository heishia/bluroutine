import React, { useState } from 'react';
import { User, Bell, LogOut, Settings, Shield, HelpCircle, ChevronRight, ChevronLeft, Megaphone, Calendar, Gift, Blocks } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface User {
  provider: 'kakao' | 'google' | 'naver';
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  subtitle: string;
  type: 'guide' | 'announcement' | 'event';
  icon: any;
  image?: string;
  gradient: string;
}

interface AccountPageProps {
  user: User;
  onLogout: () => void;
  onActivityManage?: () => void;
}

export function AccountPage({ user, onLogout, onActivityManage }: AccountPageProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [routineReminders, setRoutineReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  // 관리자가 올린 게시물들 (실제로는 API에서 가져올 데이터)
  const posts: Post[] = [
    {
      id: '1',
      title: 'bluroutine 사용 가이드',
      subtitle: '효과적인 루틴 관리 방법을 알아보세요',
      type: 'guide',
      icon: Megaphone,
      gradient: 'from-brand-primary to-brand-secondary',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5uZXIlMjBibHVlJTIwZ3JhZGllbnR8ZW58MXx8fHwxNzU3NDIwMDQ4fDA&ixlib=rb-4.0.1&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '2',
      title: '새해 이벤트 진행중',
      subtitle: '새로운 루틴 시작과 함께 특별 혜택을 받아보세요',
      type: 'event',
      icon: Gift,
      gradient: 'from-purple-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMGJhbm5lcnxlbnwxfHx8fDE3NTc0MjAwNDh8MA&ixlib=rb-4.0.1&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: '3',
      title: '업데이트 안내',
      subtitle: '새로운 기능과 개선사항을 확인해보세요',
      type: 'announcement',
      icon: Calendar,
      gradient: 'from-green-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cGRhdGUlMjBiYW5uZXJ8ZW58MXx8fHwxNzU3NDIwMDQ4fDA&ixlib=rb-4.0.1&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'kakao':
        return { name: '카카오톡', icon: '💬', color: '#FEE500' };
      case 'google':
        return { name: 'Google', icon: '🌐', color: '#4285F4' };
      case 'naver':
        return { name: 'NAVER', icon: 'N', color: '#03C75A' };
      default:
        return { name: '알 수 없음', icon: '👤', color: '#gray' };
    }
  };

  const providerInfo = getProviderInfo(user.provider);

  // 게시물 네비게이션 함수
  const handlePrevPost = () => {
    setCurrentPostIndex((prev) => 
      prev === 0 ? posts.length - 1 : prev - 1
    );
  };

  const handleNextPost = () => {
    setCurrentPostIndex((prev) => 
      prev === posts.length - 1 ? 0 : prev + 1
    );
  };

  const currentPost = posts[currentPostIndex];

  const menuItems = [
    {
      icon: Bell,
      title: '알림 설정',
      type: 'section' as const
    },
    {
      icon: Blocks,
      title: '액티비티 블록 관리하기',
      subtitle: '세트 액티비티 추가/편집/삭제',
      type: 'item' as const,
      action: onActivityManage
    },
    {
      icon: Settings,
      title: '앱 설정',
      subtitle: '테마, 언어 등',
      type: 'item' as const,
      action: () => console.log('앱 설정')
    },
    {
      icon: Shield,
      title: '개인정보 보호',
      subtitle: '데이터 관리, 계정 보안',
      type: 'item' as const,
      action: () => console.log('개인정보 보호')
    },
    {
      icon: HelpCircle,
      title: '도움말 및 지원',
      subtitle: '자주 묻는 질문, 문의',
      type: 'item' as const,
      action: () => console.log('도움말')
    }
  ];

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden">
      <div className="h-full overflow-y-auto pb-24 scrollbar-hide">
        <div className="p-4 space-y-6">
          {/* 게시물 배너 */}
          <div 
            className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => console.log(`${currentPost.title} 클릭 - 상세 페이지로 이동`)}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            {currentPost.image && (
              <ImageWithFallback
                src={currentPost.image}
                alt={currentPost.title}
                className="w-full h-28 object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-between p-5">
              {/* 왼쪽 화살표 */}
              {posts.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevPost();
                  }}
                  className="w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all z-10"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
              )}
              
              <div className="flex-1 mx-4 text-center">
                <h3 className="text-white text-base font-medium">{currentPost.title}</h3>
                <p className="text-white text-sm opacity-90 mt-2">{currentPost.subtitle}</p>
              </div>
              
              {/* 오른쪽 화살표 */}
              {posts.length > 1 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPost();
                  }}
                  className="w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition-all z-10"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              ) : (
                <div className="w-8 h-8"></div>
              )}
            </div>
          </div>

          {/* 사용자 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${providerInfo.color}20` }}
              >
                {providerInfo.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded" style={{ 
                    backgroundColor: providerInfo.color,
                    color: user.provider === 'kakao' ? '#000' : '#fff'
                  }}>
                    {providerInfo.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-brand-primary" />
              <h3 className="font-medium text-gray-900">알림 설정</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">전체 알림</p>
                  <p className="text-xs text-gray-500">모든 알림 수신</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">루틴 리마인더</p>
                  <p className="text-xs text-gray-500">루틴 시간 알림</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={routineReminders}
                    onChange={(e) => setRoutineReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">주간 리포트</p>
                  <p className="text-xs text-gray-500">주간 성과 요약</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weeklyReports}
                    onChange={(e) => setWeeklyReports(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 기타 메뉴 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {menuItems.filter(item => item.type === 'item').map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 text-left">
                    <p className="text-sm text-gray-900">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </div>

          {/* 로그아웃 버튼 */}
          <div className="bg-white rounded-lg shadow-sm">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">로그아웃</span>
            </button>
          </div>

          {/* 앱 정보 */}
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">
              bluroutine v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}