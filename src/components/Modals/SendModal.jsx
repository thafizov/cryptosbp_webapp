import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

const SendModal = ({ isOpen, onClose, fullScreen = true, initialCrypto = null }) => {
  const [step, setStep] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState('TON');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  // Устанавливаем initialCrypto при открытии модального окна
  useEffect(() => {
    if (isOpen && initialCrypto) {
      setSelectedCrypto(initialCrypto);
    } else if (!isOpen) {
      // Сбрасываем поля при закрытии модального окна
      setStep(1);
      // Не сбрасываем selectedCrypto, так как он может быть установлен при повторном открытии
      setAmount('');
      setAddress('');
    }
  }, [isOpen, initialCrypto]);

  const handleContinue = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };
  
  // Обработчик для иконки "Назад" вверху модального окна
  const handleHeaderBack = () => {
    if (step === 2) {
      // Если мы на втором шаге, возвращаемся к выбору параметров
      handleBack();
    } else {
      // Если мы на первом шаге, закрываем окно
      onClose();
    }
  };

  const handleConfirm = () => {
    // Здесь будет логика отправки средств
    onClose();
  };

  const cryptoOptions = [
    { id: 'TON', name: 'TON', networks: ['TON'] },
    { id: 'USDT', name: 'Tether USD', networks: ['TON'] },
  ];

  const renderStep1 = () => (
    <div className="max-w-md mx-auto mt-8">
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Выберите криптовалюту
        </label>
        <select 
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-gray-800 border-gray-700 text-white"
        >
          {cryptoOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name} ({option.id})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Адрес получателя
        </label>
        <input 
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Введите адрес кошелька"
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Сумма
        </label>
        <div className="relative">
          <input 
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 pr-20 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-gray-800 border-gray-700 text-white"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
            {selectedCrypto}
          </div>
        </div>
        <div className="text-right text-xs text-gray-400 mt-2">
          Доступно: 2.45 {selectedCrypto}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-md mx-auto mt-8">
      <div className="text-center mb-8">
        <div className="bg-gray-800 p-4 rounded-xl mx-auto w-20 h-20 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">Подтвердите отправку</h3>
      </div>

      <div className="bg-gray-800 rounded-xl p-5 mb-5">
        <div className="flex justify-between mb-3">
          <span className="text-gray-400">Отправляете</span>
          <span className="font-medium">{amount} {selectedCrypto}</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-gray-400">Получатель</span>
          <span className="font-medium truncate ml-4 max-w-[180px]">{address}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Комиссия сети</span>
          <span className="font-medium">0.01 {selectedCrypto}</span>
        </div>
      </div>

      <div className="bg-yellow-900/20 rounded-xl p-4 mb-4">
        <div className="flex">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-yellow-300">
            Убедитесь, что адрес получателя верный. Операции с криптовалютой необратимы.
          </p>
        </div>
      </div>
    </div>
  );

  // Футер модального окна в зависимости от шага
  const renderFooter = () => (
    <div className="flex justify-end space-x-3">
      {step === 2 && (
        <button 
          onClick={handleBack}
          className="px-5 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800"
        >
          Назад
        </button>
      )}
      
      {step === 1 ? (
        <button 
          onClick={handleContinue}
          disabled={!amount || !address}
          className={`bg-gradient-to-br from-primary to-lime-300 text-black px-6 py-3 rounded-xl font-medium ${(!amount || !address) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Продолжить
        </button>
      ) : (
        <button 
          onClick={handleConfirm}
          className="bg-gradient-to-br from-primary to-lime-300 text-black px-6 py-3 rounded-xl font-medium"
        >
          Подтвердить
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Отправить"
      onBack={handleHeaderBack}
      footer={renderFooter()}
      fullScreen={fullScreen}
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};

export default SendModal; 