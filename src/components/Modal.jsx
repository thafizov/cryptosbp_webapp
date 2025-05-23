import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, fullScreen = true }) => {
  useEffect(() => {
    if (isOpen) {
      // Блокируем прокрутку на body когда модальное окно открыто
      document.body.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.overscrollBehavior = 'none';
    } else {
      // Возвращаем прокрутку когда модальное окно закрыто
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.height = '';
      document.body.style.width = '';
      document.documentElement.style.height = '';
      document.body.style.overscrollBehavior = '';
    }
  }, [isOpen]);
  
  // Если модальное окно закрыто - не рендерим ничего
  if (!isOpen) return null;
  
  // Определяем классы без анимаций
  const backdropClasses = 'fixed inset-0 bg-black/70 backdrop-blur-sm z-40';
  const modalClasses = 'fixed inset-0 z-50 flex items-start justify-center p-0';

  // Изменены стили для полноэкранного режима
  const containerClasses = fullScreen 
    ? 'relative bg-secondary w-full h-[100vh] max-h-[100vh] flex flex-col overflow-hidden' 
    : 'relative bg-secondary rounded-2xl m-4 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-xl';

  return (
    <>
      {/* Затемненный фон */}
      <div className={backdropClasses} onClick={onClose}></div>
      
      {/* Модальное окно */}
      <div className={modalClasses}>
        <div 
          className={containerClasses}
          onClick={e => e.stopPropagation()}
        >
          {/* Заголовок */}
          {title && (
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-medium">{title}</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
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