import React, { useEffect, useState } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { 
  HomeIcon, 
  ClockIcon, 
  GiftIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

const Footer = ({ activeTab, onTabChange }) => {
  const { webApp } = useTelegram();
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);

  // Обнаружение Safe Area на iOS устройствах
  useEffect(() => {
    const detectSafeArea = () => {
      // Проверка на iOS устройства с Home Indicator
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isIPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream;
      const hasHomeIndicator = isIPhone && (window.screen.height >= 812 || window.screen.width >= 812);
      
      if (iOS && hasHomeIndicator) {
        // Используем CSS переменные или стандартные значения для iPhone с Home Indicator
        setSafeAreaBottom(34);
      } else if (webApp?.viewportStableHeight) {
        // Используем данные от Telegram Web App API для определения безопасной зоны
        const viewportHeight = webApp.viewportHeight;
        const stableViewportHeight = webApp.viewportStableHeight;
        const bottomInset = viewportHeight - stableViewportHeight;
        
        if (bottomInset > 0) {
          setSafeAreaBottom(bottomInset);
        }
      }
    };

    detectSafeArea();
    window.addEventListener('resize', detectSafeArea);
    
    return () => {
      window.removeEventListener('resize', detectSafeArea);
    };
  }, [webApp]);

  const tabs = [
    {
      id: 'home',
      label: 'Главная',
      icon: <HomeIcon className="w-6 h-6" />
    },
    {
      id: 'history',
      label: 'История',
      icon: <ClockIcon className="w-6 h-6" />
    },
    {
      id: 'airdrop',
      label: 'Airdrop',
      icon: <GiftIcon className="w-6 h-6" />
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: <UserIcon className="w-6 h-6" />
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div 
        className="bg-gray-800 rounded-t-2xl pt-4" 
        style={{ 
          paddingBottom: Math.max(16, safeAreaBottom) + 'px',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="container max-w-md mx-auto">
          <div className="flex justify-around">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'text-lime-400 transform scale-110' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
              >
                <div 
                  className={`transition-all duration-300 ${
                    activeTab === tab.id ? 'scale-110 filter drop-shadow-glow' : ''
                  }`}
                  style={
                    activeTab === tab.id 
                      ? { filter: 'drop-shadow(0 0 4px rgb(163 230 53 / 0.7))' } 
                      : {}
                  }
                >
                  {tab.icon}
                </div>
                <span className={`text-xs mt-1 transition-opacity duration-300 ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-70'
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer; 