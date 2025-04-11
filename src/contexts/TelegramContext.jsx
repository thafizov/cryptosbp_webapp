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
          
          // Получаем данные пользователя
          const user = webApp.initDataUnsafe?.user || null;
          const initData = webApp.initData || null;
          
          console.log('Telegram WebApp initialized:', { user, initData });
          
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
          webApp.expand(); // Разворачиваем приложение на весь экран
          webApp.enableClosingConfirmation(); // Запрашиваем подтверждение при закрытии
          
          // Меняем цвет статус-бара
          const bgColor = '#020203';
          webApp.setBackgroundColor(bgColor);
        } else {
          // Если приложение запущено не в Telegram
          console.log('Telegram WebApp is not available. Running in standalone mode.');
          setTelegramData({
            user: { first_name: 'Гость' },
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