import React, { useState } from 'react';
import Footer from './components/Footer.jsx';
import BalanceSection from './components/BalanceSection.jsx';
import TokenList from './components/TokenList.jsx';
import SendModal from './components/Modals/SendModal.jsx';
import DepositModal from './components/Modals/DepositModal.jsx';
import ScannerModal from './components/Modals/ScannerModal.jsx';
import PaymentModal from './components/Modals/PaymentModal.jsx';
import Modal from './components/Modal.jsx';
import { useTelegram } from './contexts/TelegramContext';
import './index.css';

function App() {
  const { user, isLoading } = useTelegram();
  const [modals, setModals] = useState({
    send: false,
    deposit: false,
    scanner: false,
    payment: false,
    transactionDetails: false,
  });
  
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState(null);

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    // Сбрасываем выбранную криптовалюту при закрытии модального окна
    if (modalName === 'deposit' || modalName === 'send') {
      setSelectedCrypto(null);
    }
  };

  const handleScanSuccess = (result) => {
    console.log('QR код отсканирован:', result);
    
    // Закрываем модальное окно сканера
    closeModal('scanner');
    
    // Обработка результата сканирования
    try {
      // Проверяем, является ли результат URL для оплаты
      // Предполагаем, что любая ссылка или текст является платежным QR-кодом
      setPaymentData({ 
        paymentUrl: result, 
        timestamp: new Date().toISOString() 
      });
      openModal('payment');
    } catch (error) {
      console.error('Ошибка при обработке QR-кода:', error);
      alert('Ошибка при обработке QR-кода');
    }
  };

  // Функция для обработки подтверждения платежа
  const handlePaymentConfirm = () => {
    // Здесь будет логика отправки данных на сервер
    console.log('Оплата подтверждена, данные для отправки:', paymentData);
    
    // ВАЖНО: МЕСТО ДЛЯ РЕАЛИЗАЦИИ ОТПРАВКИ ДАННЫХ НА СЕРВЕР
    // =====================================================
    // Примерная реализация:
    // 
    // fetch('https://api.yourservice.com/payment/process', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     paymentUrl: paymentData.paymentUrl,
    //     userId: 'current-user-id', // получить из контекста пользователя
    //     timestamp: paymentData.timestamp
    //   })
    // })
    // .then(response => response.json())
    // .then(data => {
    //   // Обработка успешного ответа от сервера
    //   if (data.success) {
    //     alert('Платеж успешно выполнен!');
    //     setActiveTab('history');
    //   } else {
    //     alert(`Ошибка при обработке платежа: ${data.message}`);
    //   }
    // })
    // .catch(error => {
    //   console.error('Ошибка отправки запроса:', error);
    //   alert('Не удалось обработать платеж. Попробуйте позже.');
    // });
    // =====================================================
    
    // Имитация успешной отправки данных (для демонстрации)
    setTimeout(() => {
      // Закрываем модальное окно
      closeModal('payment');
      
      // В демо-версии просто показываем уведомление
      alert('Данные для оплаты отправлены на сервер!');
      
      // После оплаты переключаемся на вкладку истории
      setActiveTab('history');
    }, 1000);
  };

  // Пользовательские обработчики для кнопок в BalanceSection
  const handleSend = () => openModal('send');
  const handleReceive = () => openModal('deposit');
  const handleScan = () => openModal('scanner');

  // Обработчик для клика по токену
  const handleTokenClick = (symbol) => {
    setSelectedCrypto(symbol);
    openModal('deposit');
  };

  // Обработчик для клика по токену с выбором действия (контекстное меню)
  const handleTokenContextClick = (event, symbol) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Показываем простой выбор действия
    const action = window.confirm(`Выберите действие для ${symbol}:\n\nOK = Отправить\nОтмена = Пополнить`);
    
    setSelectedCrypto(symbol);
    if (action) {
      // Если ОК - открыть окно отправки
      openModal('send');
    } else {
      // Если Отмена - открыть окно пополнения
      openModal('deposit');
    }
  };

  // Демо-транзакции для истории
  const demoTransactions = [
    {
      id: 1,
      type: 'receive',
      amount: "5,000.00",
      currency: "₽",
      date: "15.04.2023",
      time: "14:32",
      status: "completed",
      from: "Александр П.",
      description: "Перевод средств",
      hash: "EQBIhPuWmjT7fP-VomuTWg5aAr7so3FZUHwLQTogc9y7TP-P",
    },
    {
      id: 2,
      type: 'send',
      amount: "1,250.00",
      currency: "₽",
      date: "12.04.2023",
      time: "09:15",
      status: "completed",
      to: "Мария К.",
      description: "Оплата обеда",
      hash: "EQDMTsDfMhomh-8lt4rlcejGp4-JRs5LnVnntt-g21gWPG0R",
    },
    {
      id: 3,
      type: 'payment',
      amount: "3,500.00",
      currency: "₽",
      date: "10.04.2023",
      time: "18:47",
      status: "completed",
      to: "Магазин 'Продукты'",
      description: "Оплата товаров",
      hash: "EQBmI4WJ0-EcoQVPCdYLgJ8vLnQxOOzRGRZw9-S_5MV9QgLi",
    },
    {
      id: 4,
      type: 'receive',
      amount: "10,000.00",
      currency: "₽",
      date: "05.04.2023",
      time: "12:20",
      status: "completed",
      from: "ООО 'Компания'",
      description: "Зарплата",
      hash: "EQCYrKp4kTyY5xPp8Vra7j5I5JbPR5UfefYaQcF64m9U2R9d",
    }
  ];

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    openModal('transactionDetails');
  };
  
  // Секция профиля
  const renderProfile = () => {
    // Получаем данные пользователя
    const userName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Гость';
    const userInitial = userName.charAt(0);
    const username = user?.username || '-';
    
    return (
      <div className="bg-secondary rounded-xl p-5 text-white">
        <h2 className="text-xl font-bold mb-4">Профиль</h2>
        
        {isLoading ? (
          // Отображаем скелетон загрузки
          <div className="animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-700 mr-4"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 mb-3 h-12"></div>
            <div className="bg-gray-700 rounded-lg p-4 h-12"></div>
          </div>
        ) : (
          // Отображаем профиль пользователя
          <>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-lime-400 text-black flex items-center justify-center text-2xl font-bold mr-4 transition-transform duration-300 hover:scale-105">
                {userInitial}
              </div>
              <div className="transition-opacity duration-300">
                <h3 className="text-lg font-medium">{userName}</h3>
                <p className="text-gray-400">@{username}</p>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-3 transition-colors duration-300 hover:bg-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">ID пользователя</span>
                <span className="text-sm">{user?.id || 'Н/Д'}</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 transition-colors duration-300 hover:bg-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Дата регистрации</span>
                <span className="text-sm">21.04.2023</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Активное содержимое вкладки
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <BalanceSection onSend={handleSend} onReceive={handleReceive} onScan={handleScan} />
            <TokenList 
              onTokenClick={handleTokenClick} 
              onTokenContextClick={handleTokenContextClick}
            />
          </div>
        );
      case 'history':
        return (
          <div className="bg-secondary rounded-xl p-5 text-white">
            <h2 className="text-xl font-bold mb-4">История транзакций</h2>
            {demoTransactions.length > 0 ? (
              <div className="space-y-3">
                {demoTransactions.map(transaction => (
                  <div 
                    key={transaction.id} 
                    className="bg-gray-800 rounded-xl p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        transaction.type === 'receive' ? 'bg-gray-700' : 
                        transaction.type === 'send' ? 'bg-gray-700' : 'bg-gray-700'
                      }`}>
                        {transaction.type === 'receive' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-lime-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {transaction.type === 'send' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {transaction.type === 'payment' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'receive' ? 'Получено от ' + transaction.from : 
                          transaction.type === 'send' ? 'Отправлено ' + transaction.to : 
                          'Оплата в ' + transaction.to}
                        </p>
                        <p className="text-sm text-gray-400">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'receive' ? 'text-lime-400' : 
                        transaction.type === 'send' ? 'text-gray-400' : 'text-gray-200'
                      }`}>
                        {transaction.type === 'receive' ? '+' : '-'}{transaction.currency}{transaction.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">У вас пока нет транзакций</p>
            )}
          </div>
        );
      case 'airdrop':
        return (
          <div className="bg-secondary rounded-xl p-5 text-white">
            <h2 className="text-xl font-bold mb-6">Earn XP, Get Rewards</h2>
            
            {/* XP баланс */}
            <div className="bg-gray-800 rounded-xl p-5 mb-6">
              <div className="text-sm text-gray-400 mb-1">Ваш баланс XP</div>
              <div className="text-3xl font-bold mb-4">750 XP</div>
              <div className="bg-gray-700 rounded-full h-2 mb-1">
                <div className="bg-lime-400 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="text-xs text-right text-gray-400">750/1000 XP до следующего уровня</div>
            </div>
            
            {/* Способы получения XP */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Зарабатывайте XP</h3>
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-lime-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium whitespace-nowrap">Пополнение кошелька</p>
                        <p className="text-sm text-gray-400">+50 XP за каждое пополнение</p>
                      </div>
                    </div>
                    <span className="text-lime-400 font-medium ml-2 whitespace-nowrap">+50 XP</span>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium whitespace-nowrap">Оплата покупки</p>
                        <p className="text-sm text-gray-400">+100 XP за каждую покупку</p>
                      </div>
                    </div>
                    <span className="text-gray-200 font-medium ml-2 whitespace-nowrap">+100 XP</span>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium whitespace-nowrap">Mint NFT</p>
                        <p className="text-sm text-gray-400">+200 XP за каждый NFT</p>
                      </div>
                    </div>
                    <span className="text-gray-400 font-medium ml-2 whitespace-nowrap">+200 XP</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Приглашение друзей */}
            <div>
              <h3 className="text-lg font-medium mb-3">Пригласите друзей</h3>
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <p className="text-sm mb-4">За каждого приглашенного друга, который зарегистрируется по вашей ссылке, вы получите +300 XP</p>
                <div className="bg-gray-900 rounded-lg p-3 flex justify-between items-center mb-3 overflow-hidden">
                  <span className="text-sm font-mono text-gray-400 truncate mr-2">https://t.me/cryptosbp_bot?start=ref_83947593</span>
                  <button 
                    className="text-lime-400 flex-shrink-0"
                    onClick={() => navigator.clipboard.writeText('https://t.me/cryptosbp_bot?start=ref_83947593')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 100 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
                <button className="bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600 px-4 py-3 rounded-xl font-medium w-full hover:bg-gray-700">
                  Поделиться ссылкой
                </button>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return renderProfile();
      default:
        return null;
    }
  };

  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null;
    
    const { type, amount, currency, date, time, status, from, to, description, hash } = selectedTransaction;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gray-700`}>
            {type === 'receive' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'send' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {type === 'payment' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-1">
            <span className={
              type === 'receive' ? 'text-lime-400' : 
              type === 'send' ? 'text-gray-400' : 'text-gray-200'
            }>
              {type === 'receive' ? '+' : '-'}{currency}{amount}
            </span>
          </h3>
          <p className="text-gray-400">
            {type === 'receive' ? 'Получено' : 
             type === 'send' ? 'Отправлено' : 'Оплата'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Статус</span>
            <span className="text-lime-400 font-medium">
              {status === 'completed' ? 'Завершено' : 'В обработке'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Дата</span>
            <span>{date} {time}</span>
          </div>
          
          {type === 'receive' && (
            <div className="flex justify-between">
              <span className="text-gray-400">От кого</span>
              <span>{from}</span>
            </div>
          )}
          
          {(type === 'send' || type === 'payment') && (
            <div className="flex justify-between">
              <span className="text-gray-400">Получатель</span>
              <span>{to}</span>
            </div>
          )}
          
          {description && (
            <div className="flex justify-between">
              <span className="text-gray-400">Описание</span>
              <span>{description}</span>
            </div>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="mb-1">
            <span className="text-gray-400">ID транзакции</span>
          </div>
          <div className="break-all text-sm font-mono">
            {hash}
          </div>
          <button 
            className="text-lime-400 text-sm flex items-center mt-2"
            onClick={() => navigator.clipboard.writeText(hash)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
            </svg>
            Скопировать
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: '#020203' }}>
      {/* Main content */}
      <div className="flex-1 container max-w-md mx-auto p-4 pb-24">
        {renderActiveTab()}
      </div>
      
      {/* Footer */}
      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Modals */}
      <SendModal
        isOpen={modals.send}
        onClose={() => closeModal('send')}
        initialCrypto={selectedCrypto}
      />
      
      <DepositModal
        isOpen={modals.deposit}
        onClose={() => closeModal('deposit')}
        initialCrypto={selectedCrypto}
      />
      
      <ScannerModal
        isOpen={modals.scanner}
        onClose={() => closeModal('scanner')}
        onScanSuccess={handleScanSuccess}
      />
      
      <PaymentModal
        isOpen={modals.payment}
        onClose={() => closeModal('payment')}
        paymentData={paymentData}
        onConfirm={handlePaymentConfirm}
      />
      
      <Modal
        isOpen={modals.transactionDetails}
        onClose={() => closeModal('transactionDetails')}
        title="Детали транзакции"
      >
        {renderTransactionDetails()}
      </Modal>
    </div>
  );
}

export default App; 