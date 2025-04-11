import React from 'react';

const Footer = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'home',
      label: 'Главная',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 9V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V9L12 2Z" fill="currentColor"/>
          <path d="M9 22V12H15V22" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'history',
      label: 'История',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      id: 'airdrop',
      label: 'Airdrop',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M19 9L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M5 15L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="4" r="2" fill="currentColor"/>
          <circle cx="12" cy="20" r="2" fill="currentColor"/>
          <circle cx="5" cy="9" r="2" fill="currentColor"/>
          <circle cx="19" cy="9" r="2" fill="currentColor"/>
          <circle cx="5" cy="15" r="2" fill="currentColor"/>
          <circle cx="19" cy="15" r="2" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="5" fill="currentColor"/>
          <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      <div className="bg-gray-800 rounded-t-2xl pt-6 pb-8">
        <div className="container max-w-md mx-auto mb-[10px]">
          <div className="flex justify-around">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex flex-col items-center justify-center p-3 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'text-lime-400 transform scale-110' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <div className={`w-6 h-6 transition-all duration-300 ${
                  activeTab === tab.id ? 'scale-110' : ''
                }`}>
                  {tab.icon}
                </div>
                <span className={`text-xs mt-1 transition-opacity duration-300 ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-70'
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer; 