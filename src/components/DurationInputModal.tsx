import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  color: string;
}

interface DurationInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (minutes: number) => void;
  activity: Activity | null;
}

export function DurationInputModal({ isOpen, onClose, onConfirm, activity }: DurationInputModalProps) {
  const [minutes, setMinutes] = useState<string>('');
  
  // isConfirmDisabled 계산을 useEffect보다 먼저 정의
  const isConfirmDisabled = !minutes.trim() || parseInt(minutes) <= 0 || isNaN(parseInt(minutes));

  // handleConfirmClick 함수를 useEffect보다 먼저 정의
  const handleConfirmClick = () => {
    console.log('🔘 [DurationModal] 확인 버튼 클릭 이벤트 발생!');
    console.log('🔍 [DurationModal] 현재 상태:', { 
      minutes, 
      minutesType: typeof minutes,
      minutesLength: minutes.length,
      trimmed: minutes.trim(),
      trimmedLength: minutes.trim().length,
      parsed: parseInt(minutes), 
      isValid: parseInt(minutes) > 0,
      isNaN: isNaN(parseInt(minutes)),
      isConfirmDisabled
    });
    
    const duration = parseInt(minutes);
    if (duration > 0) {
      console.log('✅ [DurationModal] onConfirm 호출 시작 (버튼):', duration);
      try {
        onConfirm(duration);
        console.log('✅ [DurationModal] onConfirm 호출 완료 (버튼):', duration);
        console.log('🚪 [DurationModal] 모달 닫기 시도 (확인 버튼)');
        setMinutes('');
        // 모달을 닫지 않음 - 부모 컴포넌트에서 처리
      } catch (error) {
        console.error('❌ [DurationModal] onConfirm 호출 중 에러 (버튼):', error);
      }
    } else {
      console.log('❌ [DurationModal] 유효하지 않은 시간 (버튼):', duration);
    }
  };

  // 모달이 열릴 때마다 입력값 초기화
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 [DurationModal] 모달 열림, 상태 초기화');
      setMinutes('');
    }
  }, [isOpen]);



  if (!isOpen || !activity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 [DurationModal] Submit 시도 (Enter 키):', { minutes, parsed: parseInt(minutes), isValid: parseInt(minutes) > 0 });
    const duration = parseInt(minutes);
    if (duration > 0) {
      console.log('✅ [DurationModal] onConfirm 호출 (Enter):', duration);
      onConfirm(duration);
      console.log('🚪 [DurationModal] 모달 닫기 시도 (Enter 키)');
      setMinutes('');
      // 모달을 닫지 않음 - 부모 컴포넌트에서 처리
    } else {
      console.log('❌ [DurationModal] 유효하지 않은 시간 (Enter):', duration);
    }
  };


  
  console.log('🔍 [DurationModal] 렌더링 상태:', { 
    minutes, 
    trimmed: minutes.trim(),
    parsed: parseInt(minutes),
    isConfirmDisabled,
    activity: activity?.name 
  });

  const handleClose = () => {
    console.log('🚪 [DurationModal] 모달 닫기 호출');
    setMinutes('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          console.log('🖱️ [DurationModal] 배경 클릭으로 모달 닫기');
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-sm shadow-xl"
        style={{ pointerEvents: 'auto' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">활동 시간 입력</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <div className={`inline-block px-3 py-1 rounded-lg ${activity.color} mb-3`}>
              <span className="text-blue-700 text-sm font-medium">{activity.name}</span>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              얼마나 했나요?
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={minutes}
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log('📝 [DurationModal] 입력값 변경:', { 
                    oldValue: minutes, 
                    newValue: newValue, 
                    newValueType: typeof newValue,
                    newValueLength: newValue.length,
                    parsed: parseInt(newValue),
                    isValid: parseInt(newValue) > 0,
                    isNaN: isNaN(parseInt(newValue))
                  });
                  setMinutes(newValue);
                  
                  // 즉시 버튼 상태 확인
                  const willBeDisabled = !newValue || newValue.trim() === '' || parseInt(newValue) <= 0 || isNaN(parseInt(newValue));
                  console.log('🔍 [DurationModal] 버튼 상태 예측:', { 
                    newValue, 
                    willBeDisabled,
                    reasons: {
                      empty: !newValue,
                      trimEmpty: newValue.trim() === '',
                      lessThanOne: parseInt(newValue) <= 0,
                      isNaN: isNaN(parseInt(newValue))
                    }
                  });
                }}
                placeholder="0"
                min="1"
                max="1440"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-center text-lg"
                autoFocus
              />
              <span className="text-gray-600 font-medium">분</span>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            
            {/* 확인 버튼 - 직접 처리 방식 */}
            <div className="flex-1 relative">
              <div
                className={`w-full py-2 px-4 rounded-lg transition-colors select-none text-center ${
                  isConfirmDisabled 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-brand-primary text-white hover:bg-blue-600 active:bg-blue-700 cursor-pointer'
                }`}
                style={{ 
                  minHeight: '44px', 
                  minWidth: '80px',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  position: 'relative'
                }}
                onClick={(e) => {
                  console.log('🖱️ [DurationModal] 확인 버튼 클릭!', { isConfirmDisabled, minutes });
                  
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (!isConfirmDisabled && minutes.trim()) {
                    console.log('🔥 [DurationModal] onConfirm 호출!');
                    const duration = parseInt(minutes);
                    if (duration > 0) {
                      onConfirm(duration);
                      setMinutes('');
                    }
                  } else {
                    console.log('❌ [DurationModal] 버튼 비활성화 또는 입력값 없음');
                  }
                }}
              >
                확인 {isConfirmDisabled && '(입력 필요)'}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}