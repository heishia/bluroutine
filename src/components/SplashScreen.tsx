import React from 'react';
// public 폴더의 이미지를 직접 참조
const bluroutineLogo = '/c54fa64742fbc82256e77a30852c438a7cd75cbc.png';
const sloganImage = '/81a5ef3ac9b67f59c5d9e8113ad17fe1d4f0021c.png';

interface SplashScreenProps {
  stage: 'logo' | 'message';
}

export function SplashScreen({ stage }: SplashScreenProps) {
  if (stage === 'logo') {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex items-center justify-center">
          <img 
            src={bluroutineLogo} 
            alt="bluroutine" 
            className="w-48 h-auto"
            style={{ 
              transform: 'scale(1.5)'
            }}
          />
        </div>
      </div>
    );
  }

  if (stage === 'message') {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <img 
            src={sloganImage} 
            alt="따분함은 불어버려" 
            className="max-w-xs w-full h-auto mx-auto"
            style={{ 
              imageRendering: 'crisp-edges',
              filter: 'contrast(1.1) brightness(1.05)',
              transform: 'scale(0.78)'
            }}
          />
        </div>
      </div>
    );
  }

  return null;
}