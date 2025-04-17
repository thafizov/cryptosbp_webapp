import React from 'react';
import Modal from '../Modal';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  paymentData, 
  onConfirm, 
  apiStatus = {},
  fullScreen = true 
}) => {
  const { loading, success, error } = apiStatus;

  // Отображение информации о платеже
  const renderPaymentInfo = () => {
    if (!paymentData) return null;
    
    const { paymentUrl } = paymentData;
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Ссылка на оплату</div>
          <div className="font-medium break-all text-sm">{paymentUrl}</div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Описание</div>
          <div className="font-medium">
            Эта ссылка будет отправлена на сервер для обработки платежа
          </div>
        </div>
      </div>
    );
  };

  // Отображение статуса запроса
  const renderApiStatus = () => {
    if (loading) {
      return (
        <div className="mt-6 bg-blue-900/20 border border-blue-800 rounded-xl p-4 flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent mr-3"></div>
          <span className="text-blue-300">Отправка запроса на сервер...</span>
        </div>
      );
    }

    if (success) {
      return (
        <div className="mt-6 bg-green-900/20 border border-green-800 rounded-xl p-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-300">Запрос успешно обработан!</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-6 bg-red-900/20 border border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-300">Ошибка при обработке запроса</span>
          </div>
          {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
          <div className="mt-2 text-sm text-red-300">Нажмите "Подтвердить оплату" для повторной попытки.</div>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Оплата"
      onBack={onClose}
      footer={
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-5 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800"
          >
            {success ? 'Закрыть' : 'Отмена'}
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className={`${
              loading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : success
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gradient-to-br from-primary to-lime-300 text-black hover:opacity-90'
            } px-6 py-3 rounded-xl font-medium transition-colors`}
          >
            {success ? 'Готово' : loading ? 'Обработка...' : 'Подтвердить оплату'}
          </button>
        </div>
      }
      fullScreen={fullScreen}
    >
      <div className="pb-4">
        {renderPaymentInfo()}
        {renderApiStatus()}
        
        {!loading && !success && !error && (
          <div className="mt-6 text-sm text-gray-400">
            <p>Убедитесь, что хотите перейти к оплате по данной ссылке.</p>
            <p>Нажмите кнопку "Подтвердить оплату" для продолжения.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal; 