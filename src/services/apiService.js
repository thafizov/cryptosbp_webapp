/**
 * Сервис для работы с API сервера
 * Содержит функции для выполнения запросов на сервер
 */

// Базовый URL API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Проверяет валидность URL
 * @param {string} url - URL для проверки
 * @returns {boolean} Результат проверки
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Безопасно выполняет fetch запрос с обработкой ошибок
 * @param {string} url - URL для запроса
 * @param {Object} options - Опции запроса
 * @returns {Promise} Результат запроса
 */
const safeFetch = async (url, options = {}) => {
  try {
    // Проверяем валидность URL
    if (!isValidUrl(url)) {
      throw new Error(`Невалидный URL: ${url}`);
    }
    
    // Добавляем таймаут, чтобы запрос не висел вечно
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 сек таймаут
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    return response;
  } catch (error) {
    // Обрабатываем разные типы ошибок
    if (error.name === 'AbortError') {
      throw new Error('Превышено время ожидания запроса');
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`Не удалось подключиться к серверу: ${url}. Проверьте подключение к интернету или доступность сервера.`);
    }
    
    throw error;
  }
};

/**
 * Отправляет данные отсканированного QR-кода на сервер
 * @param {string} qrData - Данные отсканированного QR-кода
 * @param {number} userId - ID пользователя
 * @returns {Promise} Промис с результатом запроса
 */
export const sendQrCodeData = async (qrData, userId = 1) => {
  try {
    // Валидация входных данных
    if (!qrData) {
      throw new Error('QR-код не может быть пустым');
    }
    
    if (typeof userId !== 'number' || isNaN(userId)) {
      console.warn('ID пользователя должен быть числом, используем значение по умолчанию');
      userId = 1;
    }
    
    const fullUrl = `${API_BASE_URL}/orders`;
    
    const response = await safeFetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        qr: qrData
      })
    });

    if (!response.ok) {
      // Пытаемся получить сообщение об ошибке из ответа
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message;
      } catch (e) {
        errorMessage = `Ошибка при отправке данных QR-кода. Код ошибки: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }

    // Безопасно парсим JSON
    try {
      return await response.json();
    } catch (e) {
      console.warn('Ошибка при парсинге JSON ответа', e);
      return { success: true }; // Возвращаем простой объект успеха, если не смогли распарсить JSON
    }
  } catch (error) {
    console.error('Ошибка при отправке данных QR-кода:', error);
    
    // Перехватываем ошибку и возвращаем объект с информацией об ошибке
    // вместо выбрасывания исключения, чтобы не ломать приложение
    return {
      success: false,
      error: error.message || 'Произошла неизвестная ошибка при отправке данных QR-кода',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Проверяет статус сервера
 * @returns {Promise<boolean>} Промис с результатом проверки
 */
export const checkServerStatus = async () => {
  try {
    const fullUrl = `${API_BASE_URL}/status`;
    
    const response = await safeFetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Ошибка при проверке статуса сервера:', error);
    return false;
  }
};

export default {
  sendQrCodeData,
  checkServerStatus
}; 