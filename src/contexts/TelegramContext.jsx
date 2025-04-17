import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// Удаляем импорт useTheme
// import { useTheme } from './ThemeContext';

// Создаем контекст для данных Telegram
const TelegramContext = createContext(null);

export const TelegramProvider = ({ children }) => {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [isWebApp, setIsWebApp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [isLargeDevice, setIsLargeDevice] = useState(false);
  // Заменяем useTheme на локальное состояние
  const [colorScheme, setColorScheme] = useState('dark');

  // Обнаружение типа устройства и установка CSS переменных
  const detectDeviceType = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Установка переменных для размеров экрана
    document.documentElement.style.setProperty('--screen-width', `${width}px`);
    document.documentElement.style.setProperty('--screen-height', `${height}px`);
    
    // Вычисление соотношения сторон для определения типа устройства
    const aspectRatio = width / height;
    
    // Определение разных типов устройств
    const isLarge = width >= 428 || height >= 926;
    const isTablet = width >= 768 || aspectRatio > 0.8;
    const isLandscape = width > height;
    
    // Установка CSS переменных для различных размеров
    document.documentElement.style.setProperty('--safe-area-inset-top', 
      isWebApp && tg ? `${tg.viewportStableHeight - tg.viewportHeight + 20}px` : '0px');
    
    // Установка классов для типов устройств
    if (isLarge) {
      document.body.classList.add('telegram-large-device');
    } else {
      document.body.classList.remove('telegram-large-device');
    }
    
    if (isTablet) {
      document.body.classList.add('telegram-tablet-device');
    } else {
      document.body.classList.remove('telegram-tablet-device');
    }
    
    if (isLandscape) {
      document.body.classList.add('telegram-landscape');
    } else {
      document.body.classList.remove('telegram-landscape');
    }
    
    // Установка CSS переменных для адаптивного дизайна
    document.documentElement.style.setProperty('--content-width', 
      isTablet ? 'min(90%, 480px)' : '100%');
    
    document.documentElement.style.setProperty('--telegram-bg-color', 
      tg ? tg.backgroundColor : colorScheme === 'dark' ? '#1c1c1d' : '#ffffff');
    
    // Для отладки (раскомментировать при необходимости)
    // document.body.classList.add('telegram-webapp-debug');
    // document.documentElement.style.setProperty('--telegram-show-debug-header', '1');
    
    setIsLargeDevice(isLarge);
    return isLarge;
  }, [isWebApp, tg, colorScheme]);

  // Функция для обеспечения прокрутки документа в Mini App
  const ensureDocumentScrollable = useCallback(() => {
    if (!document.querySelector('#telegram-scroll-container')) {
      const scrollContainer = document.createElement('div');
      scrollContainer.id = 'telegram-scroll-container';
      scrollContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 1px;
        height: calc(100% + 1px);
        visibility: hidden;
        pointer-events: none;
        opacity: 0;
      `;
      document.body.appendChild(scrollContainer);
    }
  }, []);

  useEffect(() => {
    // Инициализация Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
      const telegram = window.Telegram.WebApp;
      setTg(telegram);
      setUser(telegram.initDataUnsafe?.user || null);
      setIsWebApp(true);
      
      // Установка темы и цветовой схемы
      const telegramColorScheme = telegram.colorScheme;
      if (telegramColorScheme) {
        setColorScheme(telegramColorScheme);
      }
      
      // Обеспечение прокрутки документа
      ensureDocumentScrollable();
      
      // Установка параметров viewport
      setViewportHeight(telegram.viewportHeight);
      setViewportWidth(telegram.viewportWidth);
      
      // Статус расширенного состояния
      setIsExpanded(telegram.isExpanded);
      
      // Если изначально в расширенном режиме, определить тип устройства
      if (telegram.isExpanded) {
        detectDeviceType();
      }
      
      // Расширение до полноэкранного режима
      if (!telegram.isExpanded) {
        // Запомнить текущий статус
        const wasExpanded = telegram.isExpanded;
        
        // Расширить приложение
        telegram.expand();
        
        // Обновить статус
        setIsExpanded(true);
        
        // Добавить класс fullscreen, если состояние изменилось
        if (!wasExpanded) {
          document.body.classList.add('telegram-webapp-fullscreen');
          setIsFullscreen(true);
          detectDeviceType();
        }
      }
      
      // Обработчик изменения viewport
      telegram.onEvent('viewportChanged', () => {
        setViewportHeight(telegram.viewportHeight);
        setViewportWidth(telegram.viewportWidth);
        detectDeviceType();
      });
      
      // Обработчик изменения темы
      telegram.onEvent('themeChanged', () => {
        setColorScheme(telegram.colorScheme);
        detectDeviceType(); // Обновляем CSS переменные при смене темы
      });
    }
    
    // Обработчик изменения размера окна для обычных браузеров
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
      detectDeviceType();
    };
    
    window.addEventListener('resize', handleResize);
    
    // При первом рендере определить тип устройства
    detectDeviceType();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (tg) {
        tg.offEvent('viewportChanged');
        tg.offEvent('themeChanged');
      }
    };
  }, [detectDeviceType, ensureDocumentScrollable]);

  // Методы для работы с Telegram WebApp API
  const showAlert = useCallback((message) => {
    if (tg) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  }, [tg]);

  const showConfirm = useCallback((message) => {
    if (tg) {
      return new Promise((resolve) => {
        tg.showConfirm(message, resolve);
      });
    } else {
      return Promise.resolve(window.confirm(message));
    }
  }, [tg]);

  const closeWebApp = useCallback(() => {
    if (tg) {
      tg.close();
    }
  }, [tg]);
  
  const sendData = useCallback((data) => {
    if (tg) {
      tg.sendData(JSON.stringify(data));
    }
  }, [tg]);
  
  const openLink = useCallback((url) => {
    if (tg) {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, [tg]);

  const contextValue = {
    tg,
    user,
    isWebApp,
    viewportHeight,
    viewportWidth,
    isExpanded,
    isFullscreen,
    colorScheme,
    isLargeDevice,
    showAlert,
    showConfirm,
    closeWebApp,
    sendData,
    openLink,
    detectDeviceType
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

// Хук для использования Telegram контекста
export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}; 