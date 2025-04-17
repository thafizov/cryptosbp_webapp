import { useState } from 'react';
import { sendQrCodeData } from '../services/apiService';

/**
 * Хук для работы с QR сканером и отправки данных на сервер
 * @param {Object} options - Опции для хука
 * @param {Function} options.onScanSuccess - Функция, вызываемая при успешном сканировании
 * @param {Function} options.onScanError - Функция, вызываемая при ошибке сканирования
 * @param {Function} options.onApiSuccess - Функция, вызываемая при успешной отправке данных на сервер
 * @param {Function} options.onApiError - Функция, вызываемая при ошибке отправки данных на сервер
 * @returns {Object} Объект с функциями и состоянием для работы с QR сканером
 */
const useQrScanner = ({
  onScanSuccess,
  onScanError,
  onApiSuccess,
  onApiError
} = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  /**
   * Обрабатывает результат сканирования QR-кода
   * @param {string} qrData - Данные отсканированного QR-кода
   */
  const handleScan = (qrData) => {
    try {
      setScanResult(qrData);
      
      // Вызываем колбэк успешного сканирования, если он предоставлен
      if (onScanSuccess) {
        onScanSuccess(qrData);
      }
      
      return qrData;
    } catch (err) {
      setError(err.message || 'Произошла ошибка при обработке QR-кода');
      
      if (onScanError) {
        onScanError(err);
      } else {
        console.error('Ошибка при обработке QR-кода:', err);
      }
      
      // Возвращаем null вместо выбрасывания исключения
      return null;
    }
  };
  
  /**
   * Отправляет данные QR-кода на сервер
   * @param {string} qrData - Данные отсканированного QR-кода
   * @param {number} userId - ID пользователя (по умолчанию 1)
   */
  const sendToServer = async (qrData, userId = 1) => {
    if (!qrData) {
      setError('QR-код не может быть пустым');
      
      if (onApiError) {
        onApiError(new Error('QR-код не может быть пустым'));
      }
      
      return { success: false, error: 'QR-код не может быть пустым' };
    }
    
    try {
      // Начинаем процесс отправки
      setIsLoading(true);
      setError(null);
      
      // Отправляем данные на сервер через сервис API
      const result = await sendQrCodeData(qrData, userId);
      
      // Завершаем процесс отправки
      setIsLoading(false);
      
      // Проверяем результат на наличие ошибки
      if (!result.success && result.error) {
        setError(result.error);
        
        // Вызываем колбэк ошибки API, если он предоставлен
        if (onApiError) {
          onApiError(new Error(result.error));
        } else {
          console.error('Ошибка при отправке данных на сервер:', result.error);
        }
        
        return result;
      }
      
      // Вызываем колбэк успешной отправки на сервер, если он предоставлен
      if (onApiSuccess) {
        onApiSuccess(result);
      }
      
      return result;
    } catch (err) {
      // Обрабатываем любые непредвиденные ошибки
      setIsLoading(false);
      setError(err.message || 'Произошла ошибка при отправке данных на сервер');
      
      // Вызываем колбэк ошибки API, если он предоставлен
      if (onApiError) {
        onApiError(err);
      } else {
        console.error('Ошибка при отправке данных на сервер:', err);
      }
      
      // Возвращаем объект с ошибкой вместо выбрасывания исключения
      return { 
        success: false, 
        error: err.message || 'Произошла ошибка при отправке данных на сервер',
        timestamp: new Date().toISOString()
      };
    }
  };

  /**
   * Обрабатывает ошибку сканирования QR-кода
   * @param {Error} error - Объект ошибки
   */
  const handleScanError = (error) => {
    setError(error.message || 'Ошибка при сканировании QR-кода');
    
    // Вызываем колбэк ошибки сканирования, если он предоставлен
    if (onScanError) {
      onScanError(error);
    } else {
      console.error('Ошибка при сканировании QR-кода:', error);
    }
  };

  /**
   * Сбрасывает состояние сканера
   */
  const resetScanner = () => {
    setIsLoading(false);
    setError(null);
    setScanResult(null);
  };

  return {
    isLoading,
    error,
    scanResult,
    handleScan,
    sendToServer,
    handleScanError,
    resetScanner
  };
};

export default useQrScanner; 