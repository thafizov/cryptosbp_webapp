import React, { useState, useEffect } from 'react';
import Footer from './components/Footer';
import Modal from './components/Modal';
import './index.css';
import './utils/safeArea.css';
import { useTelegram } from './contexts/TelegramContext';
import useDeviceDetection from './hooks/useDeviceDetection';

function App() {
  const { user } = useTelegram();
  const [activeTab, setActiveTab] = useState('home');
  const [modals, setModals] = useState({
    send: false,
    deposit: false,
    scanner: false,
  });
  
  // Определение типа устройства
  const deviceInfo = useDeviceDetection();
  
  // Добавление класса для iOS-устройств с Home Indicator
  useEffect(() => {
    const htmlEl = document.documentElement;
    
    if (deviceInfo.hasHomeIndicator) {
      htmlEl.classList.add('has-home-indicator');
    }
    
    return () => {
      htmlEl.classList.remove('has-home-indicator');
    };
  }, [deviceInfo.hasHomeIndicator]);

  const openModal = (modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: string) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleSend = () => openModal('send');
  const handleReceive = () => openModal('deposit');
  const handleScan = () => openModal('scanner');

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Криптокошелек</h1>
            <div className="card mb-6">
              <div className="text-center mb-2">Ваш баланс</div>
              <div className="text-3xl font-bold text-center">1,234.56 USDT</div>
              <div className="flex justify-center mt-4 space-x-3">
                <button className="btn btn-primary" onClick={handleReceive}>Пополнить</button>
                <button className="btn btn-outline" onClick={handleSend}>Отправить</button>
                <button className="btn btn-secondary" onClick={handleScan}>Оплатить</button>
              </div>
            </div>
          </>
        );
      case 'history':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">История операций</h1>
            <div className="card mb-4">
              <div className="p-4 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Получено</div>
                    <div className="text-sm text-gray-400">15.04.2023, 14:32</div>
                  </div>
                  <div className="text-green-400 font-medium">+5,000.00 ₽</div>
                </div>
              </div>
              <div className="p-4 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Отправлено</div>
                    <div className="text-sm text-gray-400">12.04.2023, 09:15</div>
                  </div>
                  <div className="text-red-400 font-medium">-1,250.00 ₽</div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Оплата</div>
                    <div className="text-sm text-gray-400">10.04.2023, 18:47</div>
                  </div>
                  <div className="text-red-400 font-medium">-3,500.00 ₽</div>
                </div>
              </div>
            </div>
          </>
        );
      case 'airdrop':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Airdrop</h1>
            <div className="card mb-6 p-6 text-center">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Получите бесплатные токены</h2>
              <p className="text-gray-400 mb-6">Участвуйте в акциях и получайте вознаграждения</p>
              <button className="btn btn-primary w-full">Участвовать</button>
            </div>
          </>
        );
      case 'profile':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Профиль</h1>
            <div className="card mb-6">
              <div className="flex items-center p-4 border-b border-gray-800">
                <div className="w-16 h-16 rounded-full bg-lime-400 text-black flex items-center justify-center text-2xl font-bold mr-4">
                  {user?.first_name?.charAt(0) || 'G'}
                </div>
                <div>
                  <div className="font-medium text-lg">{user?.first_name || 'Гость'} {user?.last_name || ''}</div>
                  <div className="text-gray-400">@{user?.username || 'username'}</div>
                </div>
              </div>
              <div className="p-4">
                <button className="btn btn-outline w-full mb-3">Настройки</button>
                <button className="btn btn-secondary w-full">Выйти</button>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark pb-16">
      <header className="bg-secondary text-white py-4 px-4 flex items-center justify-between">
        <div className="font-semibold">
          {user?.first_name || 'Крипто'}Кошелек
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {renderTab()}
      </main>
      
      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Модальные окна */}
      <Modal 
        isOpen={modals.send} 
        onClose={() => closeModal('send')}
        title="Отправить"
        fullScreen={true}
      >
        <div className="py-6">
          <p className="text-center mb-4">Введите адрес получателя и сумму</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Адрес</label>
              <input type="text" className="w-full p-2 bg-gray-800 rounded-lg" placeholder="Введите адрес..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Сумма</label>
              <input type="text" className="w-full p-2 bg-gray-800 rounded-lg" placeholder="0.00" />
            </div>
            <button className="w-full py-3 bg-lime-400 text-black font-medium rounded-lg hover:bg-lime-500 transition-colors">
              Отправить
            </button>
          </div>
        </div>
      </Modal>
      
      <Modal 
        isOpen={modals.deposit} 
        onClose={() => closeModal('deposit')}
        title="Пополнить"
        fullScreen={true}
      >
        <div className="py-6">
          <p className="text-center mb-4">Отсканируйте QR-код для пополнения</p>
          <div className="bg-white p-4 rounded-lg mx-auto w-64 h-64 flex items-center justify-center">
            <div className="text-black">QR-код здесь</div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-center text-gray-400 mb-4">Или используйте адрес кошелька</p>
            <div className="bg-gray-800 p-3 rounded-lg text-center break-all">
              EQDMTsDfMhomh-8lt4rlcejGp4-JRs5LnVnntt-g21gWPG0R
            </div>
          </div>
        </div>
      </Modal>
      
      <Modal 
        isOpen={modals.scanner} 
        onClose={() => closeModal('scanner')}
        title="Сканирование QR-кода"
        fullScreen={true}
      >
        <div className="py-6">
          <p className="text-center mb-4">Наведите камеру на QR-код</p>
          <div className="bg-gray-900 rounded-lg relative mx-auto w-full max-w-xs h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-lime-400 w-48 h-48 rounded-lg"></div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-4">Ожидание QR-кода...</p>
            <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              Выбрать из галереи
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App; 