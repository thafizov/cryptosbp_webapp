import React, { useEffect, useState } from 'react';
import Modal from '../Modal';

// Компонент для графика токена
const TokenChart = ({ symbol, period }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">График {symbol}</h3>
        <div className="flex space-x-2">
          <button className={`text-xs px-2 py-1 rounded-md ${period === '1d' ? 'bg-lime-400 text-black' : 'bg-gray-700 text-gray-300'}`}>
            1Д
          </button>
          <button className={`text-xs px-2 py-1 rounded-md ${period === '1w' ? 'bg-lime-400 text-black' : 'bg-gray-700 text-gray-300'}`}>
            1Н
          </button>
          <button className={`text-xs px-2 py-1 rounded-md ${period === '1m' ? 'bg-lime-400 text-black' : 'bg-gray-700 text-gray-300'}`}>
            1М
          </button>
          <button className={`text-xs px-2 py-1 rounded-md ${period === '1y' ? 'bg-lime-400 text-black' : 'bg-gray-700 text-gray-300'}`}>
            1Г
          </button>
        </div>
      </div>
      <div className="h-48 relative">
        {/* Заглушка для графика */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <span>График {symbol} будет здесь</span>
        </div>
        {/* Здесь будет реальный график */}
      </div>
    </div>
  );
};

// Компонент для отображения транзакции
const TransactionItem = ({ transaction, onTransactionClick }) => {
  const { type, amount, currency, date, time, status, from, to, description, hash } = transaction;
  
  return (
    <div 
      className="bg-gray-800 rounded-xl p-4 flex items-center justify-between cursor-pointer mb-3"
      onClick={() => onTransactionClick(transaction)}
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
  );
};

const TokenDetailModal = ({ 
  isOpen, 
  onClose, 
  symbol, 
  tokenData,
  transactions, 
  onTransactionClick,
  onDeposit,
  onSend
}) => {
  const [chartPeriod, setChartPeriod] = useState('1d');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  
  // Фильтруем транзакции по выбранному токену
  useEffect(() => {
    if (transactions && symbol) {
      // Тут может быть логика фильтрации по символу токена
      // в реальном приложении, сейчас просто возвращаем все транзакции
      setFilteredTransactions(transactions);
    }
  }, [transactions, symbol]);
  
  if (!tokenData) return null;
  
  const { token, amount, value, change, icon } = tokenData;
  const isPositive = change >= 0;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${symbol || 'Токен'}`}
      onBack={onClose}
    >
      <div>
        {/* Шапка с информацией о токене */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
            {icon ? (
              <img src={icon} alt={token} className="w-10 h-10" />
            ) : (
              <div className="text-2xl font-bold">{symbol.charAt(0)}</div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{token}</h2>
            <div className="text-sm text-gray-400">{symbol}</div>
          </div>
        </div>
        
        {/* Сумма и изменение стоимости */}
        <div className="bg-gray-800 rounded-xl p-5 mb-6">
          <div className="text-gray-400 mb-1">Баланс</div>
          <div className="text-3xl font-bold mb-2">{amount} {symbol}</div>
          <div className="flex justify-between items-center">
            <div className="text-gray-400">${value}</div>
            <div className={`${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{change}%
            </div>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => onDeposit(symbol)}
            className="flex-1 bg-lime-400 text-black font-medium py-3 rounded-xl"
          >
            Пополнить
          </button>
          <button 
            onClick={() => onSend(symbol)}
            className="flex-1 border border-gray-700 text-white font-medium py-3 rounded-xl"
          >
            Вывести
          </button>
        </div>
        
        {/* График */}
        <TokenChart symbol={symbol} period={chartPeriod} />
        
        {/* История транзакций */}
        <div>
          <h3 className="font-medium mb-4">История транзакций</h3>
          {filteredTransactions.length > 0 ? (
            <div>
              {filteredTransactions.map(transaction => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction} 
                  onTransactionClick={onTransactionClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p>У вас пока нет транзакций с {symbol}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TokenDetailModal; 