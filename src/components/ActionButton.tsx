import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ActionButtonProps {
  status: 'ready' | 'started' | 'completed' | 'resting' | 'rest_finished' | 'finished';
  onAction: (action: 'start' | 'complete' | 'rest' | 'rest_end' | 'finish' | 'continue' | 'newAction') => void;
  disabled?: boolean;
}

export function ActionButton({ status, onAction, disabled = false }: ActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (action: 'start' | 'complete' | 'rest' | 'rest_end' | 'finish' | 'continue' | 'newAction') => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    
    // 애니메이션 시간
    setTimeout(() => {
      onAction(action);
      setIsLoading(false);
    }, 800);
  };

  const getButtonConfig = () => {
    switch (status) {
      case 'ready':
        return {
          text: '시작',
          action: 'start' as const,
          className: 'bg-brand-primary hover:bg-brand-secondary text-white'
        };
      case 'started':
        return {
          text: '완료',
          action: 'complete' as const,
          className: 'bg-brand-secondary hover:bg-brand-primary text-white'
        };
      case 'completed':
        return [
          {
            text: '휴식',
            action: 'rest' as const,
            className: 'bg-brand-tertiary hover:bg-brand-secondary text-white'
          },
          {
            text: '새액션',
            action: 'newAction' as const,
            className: 'bg-brand-primary hover:bg-brand-secondary text-white'
          },
          {
            text: '마감',
            action: 'finish' as const,
            className: 'bg-gray-500 hover:bg-gray-600 text-white'
          }
        ];
      case 'resting':
        return {
          text: '종료',
          action: 'rest_end' as const,
          className: 'bg-gray-500 hover:bg-gray-600 text-white'
        };
      case 'rest_finished':
        return [
          {
            text: '마감',
            action: 'finish' as const,
            className: 'bg-gray-500 hover:bg-gray-600 text-white'
          },
          {
            text: '새액션',
            action: 'continue' as const,
            className: 'bg-brand-primary hover:bg-brand-secondary text-white'
          }
        ];
      default:
        return null;
    }
  };

  const buttonConfig = getButtonConfig();

  if (!buttonConfig || status === 'finished') {
    return null;
  }

  // 여러 버튼이 있는 경우 (completed, rest_finished 상태)
  if (Array.isArray(buttonConfig)) {
    const buttonCount = buttonConfig.length;
    const buttonSize = buttonCount === 3 ? 'px-4 py-3 text-sm' : 'px-6 py-3';
    
    return (
      <div className={`flex gap-2 justify-center ${buttonCount === 3 ? 'px-4' : ''}`}>
        {buttonConfig.map((config) => (
          <motion.button
            key={config.action}
            className={`${buttonSize} rounded-full transition-all duration-300 shadow-lg ${config.className} ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={disabled || isLoading}
            onClick={() => handleClick(config.action)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="flex items-center justify-center"
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeInOut",
                repeat: isLoading ? Infinity : 0
              }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                config.text
              )}
            </motion.div>
          </motion.button>
        ))}
      </div>
    );
  }

  // 단일 버튼인 경우
  return (
    <div className="flex justify-center">
      <motion.button
        className={`px-8 py-4 rounded-full transition-all duration-300 shadow-lg ${buttonConfig.className} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled || isLoading}
        onClick={() => handleClick(buttonConfig.action)}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          className="flex items-center justify-center"
          animate={isLoading ? { rotate: [0, 180, 360] } : { rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
        >
          {isLoading ? (
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
            />
          ) : (
            buttonConfig.text
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}