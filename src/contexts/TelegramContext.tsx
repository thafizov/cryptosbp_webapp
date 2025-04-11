import React, { createContext, useContext, useEffect, useState } from 'react';

// Определение типов для Telegram Web App
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

interface TelegramUser {
  first_name?: string;
  last_name?: string;
  username?: string;
  id?: number;
}

interface TelegramData {
  user: TelegramUser | null;
  initData: string | null;
  webApp: any | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

interface TelegramMethods {
  showAlert: (message: string) => void;
  close: () => void;
  sendData: (data: any) => void;
  openLink: (url: string) => void;
}

type TelegramContextData = TelegramData & TelegramMethods;

// Создаем контекст для данных Telegram
const TelegramContext = createContext<TelegramContextData | null>(null);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [telegramData, setTelegramData] = useState<TelegramData>({
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
            user: { first_name: 'Гость' } as TelegramUser,
            initData: null,
            webApp: null,
            isInitialized: false,
            isLoading: false,
            error: 'Telegram WebApp is not available'
          });
        }
      } catch (error: any) {
        console.error('Error initializing Telegram WebApp:', error);
        setTelegramData({
          user: { first_name: 'Гость' } as TelegramUser,
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
  const telegramMethods: TelegramMethods = {
    // Показать сообщение в нативном интерфейсе Telegram
    showAlert: (message: string) => {
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
    sendData: (data: any) => {
      if (telegramData.webApp) {
        telegramData.webApp.sendData(JSON.stringify(data));
      }
    },
    
    // Открыть ссылку в браузере Telegram
    openLink: (url: string) => {
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
export function useTelegram(): TelegramContextData {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
} 