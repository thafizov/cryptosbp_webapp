import React, { createContext, useContext, useState } from 'react';

interface BalanceContextType {
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
}

const BalanceContext = createContext({} as BalanceContextType);

export const useBalance = () => {
  const context = useContext(BalanceContext);
  return context;
};

interface BalanceProviderProps {
  children: any;
}

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  return (
    <BalanceContext.Provider value={{ isBalanceVisible, toggleBalanceVisibility }}>
      {children}
    </BalanceContext.Provider>
  );
};

export default BalanceProvider; 