import React, { useState } from 'react';

const TokenItem = ({ token, symbol, amount, value, change, icon, onTokenClick }) => {
  const isPositive = change >= 0;
  
  return (
    <div 
      className="flex items-center justify-between py-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={() => onTokenClick && onTokenClick(symbol)}
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
          <div className="text-sm text-gray-400">${value}</div>
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

const TokenList = ({ onTokenClick }) => {
  const [activeTab, setActiveTab] = useState('crypto');
  
  // Примеры токенов для демонстрации - только TON и USDT с локальными SVG
  const cryptoTokens = [
    { 
      token: 'The Open Network', 
      symbol: 'TON', 
      amount: '2.35', 
      value: '26,360.29', 
      change: 3.19,
      icon: `${process.env.PUBLIC_URL}/ton.svg`
    },
    { 
      token: 'Tether', 
      symbol: 'USDT', 
      amount: '125.75', 
      value: '125.75', 
      change: 0.01,
      icon: `${process.env.PUBLIC_URL}/usdt.svg`
    }
  ];

  return (
    <div className="bg-secondary rounded-xl overflow-hidden">
      <div className="flex border-b border-gray-800">
        <button 
          className={`flex-1 py-3 text-center ${activeTab === 'crypto' ? 'bg-gradient-to-r from-lime-300 to-green-400 text-black font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('crypto')}
        >
          Crypto
        </button>
        <button 
          className={`flex-1 py-3 text-center ${activeTab === 'nfts' ? 'bg-gradient-to-r from-lime-300 to-green-400 text-black font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('nfts')}
        >
          NFTs
        </button>
      </div>
      <div className="px-4">
        {activeTab === 'crypto' ? (
          cryptoTokens.map((token, index) => (
            <TokenItem 
              key={index}
              token={token.token}
              symbol={token.symbol}
              amount={token.amount}
              value={token.value}
              change={token.change}
              icon={token.icon}
              onTokenClick={onTokenClick}
            />
          ))
        ) : (
          <div className="py-10 text-center text-gray-400">
            <p>У вас пока нет NFT</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenList; 