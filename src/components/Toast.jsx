import React, { useEffect } from 'react';

const Toast = ({ message, visible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);
  
  if (!visible) return null;
  
  const bgColor = type === 'success' ? 'bg-lime-400' : 'bg-red-500';
  const textColor = type === 'success' ? 'text-gray-900' : 'text-white';
  
  return (
    <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center z-50 pointer-events-none">
      <div className={`${bgColor} ${textColor} py-2 px-4 rounded-lg shadow-lg flex items-center`}>
        {type === 'success' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {type === 'error' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast; 