import React from 'react';
import Modal from '../Modal';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  paymentData, 
  onConfirm, 
  fullScreen = true 
}) => {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Платеж"
      footer={
        <div className="flex w-full space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-700 text-white"
          >
            Назад
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-br from-accent-green to-accent-yellow text-black font-medium"
          >
            Оплатить
          </button>
        </div>
      }
      fullScreen={fullScreen}
    >
      <div className="pb-4">
        {renderPaymentInfo()}
        
        <div className="mt-6 text-sm text-gray-400">
          <p>Убедитесь, что хотите перейти к оплате по данной ссылке.</p>
          <p>Нажмите кнопку "Оплатить" для продолжения.</p>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal; 