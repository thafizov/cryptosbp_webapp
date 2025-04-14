import React from 'react';

// Иконки для разных типов транзакций
const TransactionIcons = {
  receive: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-lime-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
    </svg>
  ),
  send: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 10.414V14a1 1 0 102 0v-3.586l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
    </svg>
  ),
  payment: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  )
};

// Компонент для отображения одной транзакции
const TransactionItem = ({ transaction, onTransactionClick, showTime = false }) => {
  const { type, amount, currency, date, time, from, to } = transaction;
  
  // Определяем текст и иконку в зависимости от типа транзакции
  const getTransactionText = () => {
    switch (type) {
      case 'receive':
        return `Получено от ${from}`;
      case 'send':
        return `Отправлено ${to}`;
      case 'payment':
        return `Оплата в ${to}`;
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
    <div 
      className="bg-gray-800 rounded-xl p-4 flex items-center justify-between cursor-pointer"
      onClick={() => onTransactionClick && onTransactionClick(transaction)}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex-shrink-0">
          {TransactionIcons[type]}
        </div>
        <div className="overflow-hidden">
          <p className="font-medium truncate">
            {getTransactionText()}
          </p>
          <p className="text-sm text-gray-400 truncate">
            {date}{showTime ? `, ${time}` : ''}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-medium ${amountColorClass} whitespace-nowrap`}>
          {amountPrefix}{currency}{amount}
        </p>
      </div>
    </div>
  );
};

export default TransactionItem; 