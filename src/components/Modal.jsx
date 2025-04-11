import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, fullScreen = true }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationState, setAnimationState] = useState('closed'); // 'closed', 'opening', 'open', 'closing'
  
  useEffect(() => {
    if (isOpen && (animationState === 'closed' || animationState === 'closing')) {
      // Открытие модального окна
      setIsAnimating(true);
      setAnimationState('opening');
      
      // Блокируем прокрутку
      document.body.style.overflow = 'hidden';
      
      // Задержка перед переходом к полностью открытому состоянию
      const timer = setTimeout(() => {
        setAnimationState('open');
      }, 10); // Короткая задержка для запуска анимации
      
      return () => clearTimeout(timer);
    } else if (!isOpen && (animationState === 'open' || animationState === 'opening')) {
      // Закрытие модального окна
      setAnimationState('closing');
      
      // Задержка перед полным удалением
      const timer = setTimeout(() => {
        setAnimationState('closed');
        setIsAnimating(false);
        // Возвращаем прокрутку когда модальное окно закрыто
        document.body.style.overflow = '';
      }, 300); // Должно соответствовать длительности анимации
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, animationState]);
  
  // Если модальное окно закрыто и нет анимации - не рендерим ничего
  if (animationState === 'closed' && !isAnimating) return null;
  
  // Определяем классы анимации в зависимости от состояния
  const isVisible = animationState === 'open' || animationState === 'opening';
  
  const backdropClasses = `fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
    animationState === 'open' ? 'opacity-100' : 'opacity-0'
  }`;
  
  const modalClasses = `fixed inset-0 z-50 flex items-start justify-center p-0 transition-all duration-300 ${
    animationState === 'open' ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'
  }`;

  // Изменены стили для полноэкранного режима
  const containerClasses = fullScreen 
    ? `relative bg-secondary w-full h-[100vh] max-h-[100vh] flex flex-col overflow-hidden` 
    : `relative bg-secondary rounded-2xl m-4 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-xl`;

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