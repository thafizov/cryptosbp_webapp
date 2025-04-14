import React from 'react';

const TokenItem = ({ token, symbol, amount, value, rubValue, change, icon, onTokenClick, onTokenContextClick, tokenData }) => {
  const isPositive = change >= 0;
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onTokenContextClick) {
      onTokenContextClick(e, symbol);
    }
    return false;
  };
  
  return (
    <div 
      className="flex items-center justify-between py-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={() => onTokenClick && onTokenClick(symbol, tokenData)}
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mr-3 overflow-hidden">
          {icon ? (
            <img src={icon} alt={token} className="w-8 h-8" />
          ) : (
            <div className="text-lg font-bold">{symbol.charAt(0)}</div>
          )}
        </div>
        <div>
          <div className="font-medium text-white">{token} ({symbol})</div>
          <div className="text-sm text-gray-400">₽{rubValue}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-white">{amount}</div>
        <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}%
        </div>
      </div>
    </div>
  );
};

const TokenList = ({ onTokenClick, onTokenContextClick }) => {
  // Примеры токенов для демонстрации - только TON и USDT с локальными SVG
  const cryptoTokens = [
    { 
      token: 'The Open Network', 
      symbol: 'TON', 
      amount: '2.35', 
      value: '26,360.29',
      rubValue: '2,115.00', // ~900 рублей за 1 TON
      change: 3.19,
      icon: `${process.env.PUBLIC_URL}/ton.svg`
    },
    { 
      token: 'Tether', 
      symbol: 'USDT', 
      amount: '125.75', 
      value: '125.75',
      rubValue: '12,575.00', // Добавляем стоимость в рублях
      change: 0.01,
      icon: `${process.env.PUBLIC_URL}/usdt.svg`
    }
  ];

  return (
    <div className="bg-secondary rounded-xl overflow-hidden">
      <div className="px-4">
        {cryptoTokens.map((token, index) => (
          <TokenItem 
            key={index}
            token={token.token}
            symbol={token.symbol}
            amount={token.amount}
            value={token.value}
            rubValue={token.rubValue}
            change={token.change}
            icon={token.icon}
            onTokenClick={onTokenClick}
            onTokenContextClick={onTokenContextClick}
            tokenData={token}
          />
        ))}
      </div>
    </div>
  );
};

export default TokenList; 