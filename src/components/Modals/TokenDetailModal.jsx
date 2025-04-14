import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import TransactionsList from '../TransactionsList';
import TokenChart from '../TokenChart';

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
  
  // Функция для изменения периода графика
  const handlePeriodChange = (period) => {
    setChartPeriod(period);
  };
  
  // Фильтруем транзакции по выбранному токену
  useEffect(() => {
    if (transactions && symbol) {
      // Фильтруем транзакции по символу токена
      const filtered = transactions.filter(transaction => {
        // Проверяем, соответствует ли символ в транзакции текущему токену
        // Обычно в транзакции должно быть поле с идентификатором токена/валюты
        return transaction.token === symbol || 
               (symbol === 'TON' && transaction.currency === '₽') || // Временное соответствие для демо
               (symbol === 'USDT' && transaction.currency === '$'); // Временное соответствие для демо
      });
      setFilteredTransactions(filtered);
    }
  }, [transactions, symbol]);
  
  if (!tokenData) return null;
  
  const { token, amount, value, change, icon } = tokenData;
  const isPositive = change >= 0;
  
  // Определяем, следует ли показывать график для данного токена
  const shouldShowChart = symbol !== 'USDT'; // Не показываем график для USDT
  
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
        
        {/* График только для токенов кроме USDT */}
        {shouldShowChart && (
          <TokenChart symbol={symbol} period={chartPeriod} onPeriodChange={handlePeriodChange} />
        )}
        
        {/* История транзакций */}
        <div>
          <h3 className="font-medium mb-4">История транзакций</h3>
          {filteredTransactions.length > 0 ? (
            <TransactionsList 
              transactions={filteredTransactions} 
              onTransactionClick={onTransactionClick}
            />
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