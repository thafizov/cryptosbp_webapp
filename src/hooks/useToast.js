import { useState, useCallback } from 'react';

const useToast = () => {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  }, []);
  
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);
  
  return { toast, showToast, hideToast };
};

export default useToast; 