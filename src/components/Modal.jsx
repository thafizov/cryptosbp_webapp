import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, fullScreen = true, onBack }) => {
  // Блокируем прокрутку на body когда модальное окно открыто
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Если модальное окно закрыто - не рендерим ничего
  if (!isOpen) return null;
  
  // Изменены стили для полноэкранного режима
  const containerClasses = fullScreen 
    ? `relative bg-secondary w-full h-[100vh] max-h-[100vh] flex flex-col overflow-hidden telegram-safe-container` 
    : `relative bg-secondary rounded-2xl m-4 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-xl`;

  return (
    <>
      {/* Затемненный фон */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onBack || onClose}></div>
      
      {/* Модальное окно */}
      <div className={`fixed inset-0 z-50 flex items-start justify-center p-0 ${fullScreen ? 'telegram-safe-container' : ''}`} style={{paddingTop: fullScreen ? '70px' : '0'}}>
        <div 
          className={containerClasses}
          onClick={e => e.stopPropagation()}
        >
          {/* Заголовок */}
          {title && (
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              {/* Кнопка "Назад" - всегда видима */}
              <button 
                onClick={onBack || onClose} 
                className="p-1 rounded-full hover:bg-gray-700 transition-colors mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-lg font-medium flex-1 text-center">{title}</h2>
              {/* Пустой элемент для выравнивания заголовка по центру */}
              <div className="w-6"></div>
            </div>
          )}
          
          {/* Содержимое */}
          <div className="flex-1 overflow-y-auto p-5">
            {children}
          </div>
          
          {/* Нижняя панель */}
          {footer && (
            <div className="p-5 border-t border-gray-800">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal; 