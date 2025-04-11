import React, { createContext, useContext, useEffect, useState } from 'react';

// Создаем контекст для данных Telegram
const TelegramContext = createContext(null);

export function TelegramProvider({ children }) {
  const [telegramData, setTelegramData] = useState({
    user: null,
    initData: null,
    webApp: null,
    isInitialized: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Проверяем доступность Telegram WebApp API
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          
          // Инициализируем приложение
          webApp.ready();
          webApp.expand(); // Разворачиваем приложение на весь экран
          
          // Получаем данные пользователя
          const user = webApp.initDataUnsafe?.user || null;
          const initData = webApp.initData || null;
          
          console.log('Telegram WebApp initialized:', { 
            user, 
            platform: webApp.platform,
            colorScheme: webApp.colorScheme,
            themeParams: webApp.themeParams
          });
          
          // Настраиваем параметры приложения для Telegram
          document.body.style.backgroundColor = webApp.themeParams?.bg_color || '#020203';
          document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.themeParams?.bg_color || '#020203');
          document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams?.text_color || '#ffffff');
          
          // Устанавливаем данные в состояние
          setTelegramData({
            user,
            initData,
            webApp,
            isInitialized: true,
            isLoading: false,
            error: null
          });
          
          // Настраиваем параметры интерфейса
          webApp.enableClosingConfirmation(); // Запрашиваем подтверждение при закрытии
          
          // Убираем лишние отступы при прокрутке на мобильных устройствах
          document.documentElement.style.overflow = 'auto';
          document.documentElement.style.overflowX = 'hidden';
          document.documentElement.style.height = '100%';
          document.body.style.position = 'relative';
          document.body.style.minHeight = '100%';
          document.body.style.overflowX = 'hidden';
          document.body.style.overscrollBehavior = 'none';
          document.documentElement.style.overscrollBehavior = 'none';
          
          // Отключаем масштабирование на мобильных устройствах
          const viewportMeta = document.querySelector('meta[name=viewport]');
          if (viewportMeta) {
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
          } else {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.getElementsByTagName('head')[0].appendChild(meta);
          }
          
          // Меняем цвет статус-бара
          const bgColor = webApp.themeParams?.bg_color || '#020203';
          webApp.setBackgroundColor(bgColor);
          
          // Предотвращаем прокрутку всего документа на iOS
          document.addEventListener('touchmove', function(e) {
            if(e.target.closest('.overflow-y-auto, .overflow-auto')) {
              return true;
            }
            e.preventDefault();
          }, { passive: false });
        } else {
          // Если приложение запущено не в Telegram
          console.log('Telegram WebApp is not available. Running in standalone mode.');
          
          // Создаем тестового пользователя для режима разработки
          const testUser = {
            id: 12345678,
            first_name: 'John',
            last_name: 'Doe',
            username: 'johndoe',
            language_code: 'en'
          };
          
          setTelegramData({
            user: testUser, // В режиме разработки используем тестового пользователя
            initData: null,
            webApp: null,
            isInitialized: false,
            isLoading: false,
            error: 'Telegram WebApp is not available'
          });
        }
      } catch (error) {
        console.error('Error initializing Telegram WebApp:', error);
        setTelegramData({
          user: { first_name: 'Гость' },
          initData: null,
          webApp: null,
          isInitialized: false,
          isLoading: false,
          error: error.message
        });
      }
    };

    initTelegram();
  }, []);

  // Методы для работы с Telegram WebApp API
  const telegramMethods = {
    // Показать сообщение в нативном интерфейсе Telegram
    showAlert: (message) => {
      if (telegramData.webApp) {
        telegramData.webApp.showAlert(message);
      } else {
        alert(message);
      }
    },
    
    // Закрыть приложение
    close: () => {
      if (telegramData.webApp) {
        telegramData.webApp.close();
      }
    },
    
    // Поделиться данными с ботом
    sendData: (data) => {
      if (telegramData.webApp) {
        telegramData.webApp.sendData(JSON.stringify(data));
      }
    },
    
    // Открыть ссылку в браузере Telegram
    openLink: (url) => {
      if (telegramData.webApp) {
        telegramData.webApp.openLink(url);
      } else {
        window.open(url, '_blank');
      }
    }
  };

  return (
    <TelegramContext.Provider value={{ ...telegramData, ...telegramMethods }}>
      {children}
    </TelegramContext.Provider>
  );
}

// Хук для использования контекста Telegram
export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
} 