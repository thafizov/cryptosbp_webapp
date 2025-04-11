import React, { useState } from 'react';
import Modal from '../Modal';

const DepositModal = ({ isOpen, onClose, fullScreen = true }) => {
  const [step, setStep] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState('TON');

  const handleContinue = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const cryptoOptions = [
    { id: 'TON', name: 'TON', network: 'TON' },
    { id: 'USDT', name: 'Tether USD', network: 'TON' },
  ];

  const renderStep1 = () => (
    <div className="max-w-md mx-auto mt-8">
      <div className="mb-6">
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

      <div className="bg-yellow-900/20 rounded-xl p-4 mb-4">
        <div className="flex">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-yellow-300">
            Отправляйте только {selectedCrypto} в сети TON на этот адрес. Отправка других токенов может привести к потере средств.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center max-w-md mx-auto mt-8">
      <div className="mb-6">
        <div className="bg-gray-800 p-4 rounded-xl mx-auto w-56 h-56 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <div className="mb-3">
          <p className="text-gray-400">Отправьте {selectedCrypto} на этот адрес (TON):</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl mb-3 break-all">
          <code className="font-mono text-white">EQBIhPuWmjT7fP-VomuTWg5aAr7so3FZUHwLQTogc9y7TP-P</code>
        </div>
        <button 
          className="text-primary flex items-center mx-auto"
          onClick={() => navigator.clipboard.writeText('EQBIhPuWmjT7fP-VomuTWg5aAr7so3FZUHwLQTogc9y7TP-P')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
          </svg>
          Копировать адрес
        </button>
      </div>

      <div className="bg-yellow-900/20 rounded-xl p-4 mb-4">
        <div className="flex">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-yellow-300">
            Отправляйте только {selectedCrypto} в сети TON на этот адрес.
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
          className="bg-gradient-to-br from-primary to-lime-300 text-black px-6 py-3 rounded-xl font-medium"
        >
          Продолжить
        </button>
      ) : (
        <button 
          onClick={onClose}
          className="bg-gradient-to-br from-primary to-lime-300 text-black px-6 py-3 rounded-xl font-medium"
        >
          Готово
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Пополнить"
      footer={renderFooter()}
      fullScreen={fullScreen}
    >
      {step === 1 ? renderStep1() : renderStep2()}
    </Modal>
  );
};

export default DepositModal; 