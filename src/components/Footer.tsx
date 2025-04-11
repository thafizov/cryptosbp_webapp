import React from 'react';

interface FooterProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ activeTab = 'home', onTabChange = () => {} }) => {
  const tabs = [
    {
      id: 'home',
      label: 'Главная',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      id: 'history',
      label: 'История',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    },
    {
      id: 'airdrop',
      label: 'Airdrop',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    }
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#020203] via-[#020203] to-transparent pt-6 pb-safe z-30">
      <div className="container max-w-md mx-auto">
        <nav className="bg-gray-800 rounded-xl overflow-hidden mb-1 pb-safe">
          <div className="flex justify-around">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
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
        </nav>
      </div>
    </div>
  );
};

export default Footer; 