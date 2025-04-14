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
          
          // Добавляем слушатель изменения темы
          webApp.onEvent('themeChanged', () => {
            document.body.style.backgroundColor = webApp.themeParams?.bg_color || '#020203';
            document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.themeParams?.bg_color || '#020203');
            document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams?.text_color || '#ffffff');
            document.body.setAttribute('data-theme', webApp.colorScheme || 'dark');
          });
          
          // Получаем данные пользователя
          const user = webApp.initDataUnsafe?.user || null;
          const initData = webApp.initData || null;

          // Если у пользователя есть фото в Telegram, сохраняем его URL
          let photoUrl = null;
          if (user && user.photo_url) {
            photoUrl = user.photo_url;
            console.log('User photo URL:', photoUrl);
          }
          
          console.log('Telegram WebApp initialized:', { 
            user: { ...user, photo_url: photoUrl }, 
            platform: webApp.platform,
            colorScheme: webApp.colorScheme,
            themeParams: webApp.themeParams
          });
          
          // Настраиваем параметры приложения для Telegram
          document.body.style.backgroundColor = webApp.themeParams?.bg_color || '#020203';
          document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.themeParams?.bg_color || '#020203');
          document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams?.text_color || '#ffffff');
          
          // Устанавливаем тему для pull-to-refresh
          document.body.setAttribute('data-theme', webApp.colorScheme || 'dark');
          
          // Устанавливаем данные в состояние
          setTelegramData({
            user: { ...user, photo_url: photoUrl },
            initData,
            webApp,
            isInitialized: true,
            isLoading: false,
            error: null
          });
          
          // Настраиваем параметры интерфейса
          webApp.enableClosingConfirmation(); // Запрашиваем подтверждение при закрытии
          
          // Убираем лишние отступы при прокрутке на мобильных устройствах
          document.documentElement.style.position = 'relative';
          document.documentElement.style.overflow = 'hidden';
          document.documentElement.style.height = '100%';
          
          // Меняем цвет статус-бара
          const bgColor = webApp.themeParams?.bg_color || '#020203';
          webApp.setBackgroundColor(bgColor);
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