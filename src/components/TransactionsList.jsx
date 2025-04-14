import React from 'react';
import TransactionItem from './TransactionItem';

// Функция для группировки транзакций по дате
const groupTransactionsByDate = (transactions) => {
  const groups = {};
  
  transactions.forEach(transaction => {
    if (!groups[transaction.date]) {
      groups[transaction.date] = [];
    }
    groups[transaction.date].push(transaction);
  });
  
  // Сортируем даты по убыванию (сначала новые)
  return Object.keys(groups)
    .sort((a, b) => {
      const dateA = a.split('.').reverse().join('-');
      const dateB = b.split('.').reverse().join('-');
      return new Date(dateB) - new Date(dateA);
    })
    .map(date => ({
      date,
      transactions: groups[date]
    }));
};

const TransactionsList = ({ transactions, onTransactionClick, showTime = false }) => {
  // Группируем транзакции по дате
  const groupedTransactions = groupTransactionsByDate(transactions);
  
  return (
    <div className="space-y-6">
      {groupedTransactions.map(group => (
        <div key={group.date} className="space-y-3">
          {/* Заголовок с датой */}
          <div className="sticky top-0 bg-secondary z-10 py-2">
            <h3 className="text-sm font-medium text-gray-400">{group.date}</h3>
          </div>
          
          {/* Транзакции в группе */}
          <div className="space-y-3">
            {group.transactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onTransactionClick={onTransactionClick}
                showTime={showTime}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionsList; 