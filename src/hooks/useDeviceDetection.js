import { useEffect, useState } from 'react';

const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isIPhone: false,
    hasHomeIndicator: false,
    hasSafeAreaSupport: false,
  });

  useEffect(() => {
    // Определение iOS устройства
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Определение iPhone X и новее (с Home Indicator)
    const isIPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream;
    
    // Проверка поддержки Safe Area API
    let hasSafeAreaSupport = false;
    
    if (window.CSS && window.CSS.supports) {
      hasSafeAreaSupport = window.CSS.supports('padding-bottom: env(safe-area-inset-bottom)');
    }
    
    // Проверка на наличие Home Indicator (примерная эвристика для iPhone X и новее)
    // Это примерное определение, не работает на 100%
    const hasHomeIndicator = isIPhone && 
      (window.screen.height >= 812 || window.screen.width >= 812);
    
    // Установка классов на body для использования CSS
    const body = document.body;
    
    if (iOS) body.classList.add('ios-device');
    if (isIPhone) body.classList.add('iphone-device');
    if (hasSafeAreaSupport) body.classList.add('has-safe-area-support');
    else body.classList.add('no-safe-area-support');
    if (hasHomeIndicator) body.classList.add('has-home-indicator');
    
    setDeviceInfo({
      isIOS: iOS,
      isIPhone,
      hasHomeIndicator,
      hasSafeAreaSupport
    });
    
    return () => {
      // Очистка при размонтировании
      body.classList.remove('ios-device', 'iphone-device', 'has-safe-area-support', 'no-safe-area-support', 'has-home-indicator');
    };
  }, []);
  
  return deviceInfo;
};

export default useDeviceDetection; 