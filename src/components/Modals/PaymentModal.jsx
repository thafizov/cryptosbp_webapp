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
      title="Оплата"
      onBack={onClose}
      footer={
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-5 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800"
          >
            Отмена
          </button>
          <button 
            onClick={onConfirm}
            className="bg-gradient-to-br from-primary to-lime-300 text-black px-6 py-3 rounded-xl font-medium"
          >
            Подтвердить оплату
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