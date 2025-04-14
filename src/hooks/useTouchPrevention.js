import { useEffect } from 'react';

/**
 * Хук для предотвращения сворачивания Telegram WebApp
 * при свайпе вниз на странице без скролла
 */
const useTouchPrevention = (elementRef) => {
  useEffect(() => {
    const element = elementRef?.current || document.body;
    let startY = 0;
    let currentY = 0;
    
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      currentY = e.touches[0].clientY;
      
      // Если мы находимся в верхней части страницы и пытаемся прокрутить вниз
      if (element.scrollTop === 0 && currentY > startY) {
        // Предотвращаем стандартное поведение (сворачивание WebApp)
        e.preventDefault();
      }
    };
    
    // Добавляем слушатели событий
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Очищаем слушатели при размонтировании
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [elementRef]);
};

export default useTouchPrevention; 