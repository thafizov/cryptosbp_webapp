import React from 'react';

// Иконки для разных типов транзакций
const TransactionIcons = {
  receive: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
    </svg>
  ),
  send: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 10.414V14a1 1 0 102 0v-3.586l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
    </svg>
  ),
  payment: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  )
};

// Компонент статуса транзакции
const TransactionStatus = ({ status }) => {
  if (status === 'completed') {
    return (
      <div className="flex items-center text-lime-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Завершено</span>
      </div>
    );
  } else if (status === 'pending') {
    return (
      <div className="flex items-center text-yellow-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span>В обработке</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span>Ошибка</span>
      </div>
    );
  }
};

const TransactionDetail = ({ transaction, onClose, onCopy }) => {
  const { type, amount, currency, date, time, status, from, to, description, hash } = transaction;
  
  // Определяем заголовок в зависимости от типа транзакции
  const getTransactionTitle = () => {
    switch (type) {
      case 'receive':
        return 'Получено';
      case 'send':
        return 'Отправлено';
      case 'payment':
        return 'Оплата';
      default:
        return 'Транзакция';
    }
  };
  
  // Цветовые стили для разных типов транзакций
  const amountColorClass = 
    type === 'receive' ? 'text-lime-400' : 
    type === 'send' ? 'text-gray-400' : 'text-gray-200';
  
  // Символ + или - перед суммой
  const amountPrefix = type === 'receive' ? '+' : '-';
  
  return (
    <div className="space-y-6">
      {/* Шапка с информацией о транзакции */}
      <div className="text-center">
        <div className="flex justify-center mb-3">
          {TransactionIcons[type]}
        </div>
        <h3 className="text-2xl font-bold mb-1">
          <span className={amountColorClass}>
            {amountPrefix}{currency}{amount}
          </span>
        </h3>
        <p className="text-gray-400">
          {getTransactionTitle()}
        </p>
      </div>
      
      {/* Основная информация */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Статус</span>
          <TransactionStatus status={status} />
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Дата и время</span>
          <span>{date}, {time}</span>
        </div>
        
        {type === 'receive' && (
          <div className="flex justify-between">
            <span className="text-gray-400">От кого</span>
            <span className="truncate max-w-[200px]">{from}</span>
          </div>
        )}
        
        {(type === 'send' || type === 'payment') && (
          <div className="flex justify-between">
            <span className="text-gray-400">Получатель</span>
            <span className="truncate max-w-[200px]">{to}</span>
          </div>
        )}
        
        {description && (
          <div className="flex justify-between">
            <span className="text-gray-400">Описание</span>
            <span className="truncate max-w-[200px]">{description}</span>
          </div>
        )}
      </div>
      
      {/* ID транзакции */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="mb-1">
          <span className="text-gray-400">ID транзакции</span>
        </div>
        <div className="break-all text-sm font-mono">
          {hash}
        </div>
        <div className="mt-3">
          <button 
            className="text-lime-400 text-sm flex items-center"
            onClick={() => onCopy(hash, 'ID транзакции скопирован!')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
            </svg>
            Скопировать
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail; 