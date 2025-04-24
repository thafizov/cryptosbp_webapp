import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

/**
 * Компонент для сканирования QR-кодов с использованием камеры устройства
 * или загрузки QR-кода из файла.
 * 
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Флаг, указывающий открыт ли сканер
 * @param {Function} props.onClose - Функция закрытия сканера
 * @param {Function} props.onScanSuccess - Функция обработки успешного сканирования (получает данные QR-кода)
 */
export function QRScanner({ isOpen, onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [torchActive, setTorchActive] = useState(false);

  // Функция для обработки кадров
  const processVideo = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    // Устанавливаем размеры canvas равными размерам видео
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Копируем кадр из видео на canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Получаем данные изображения
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    try {
      // Пытаемся найти QR-код
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('QR-код найден:', code.data);
        setScanResult(code.data);
        setShowResult(true);
        return; // Прекращаем сканирование после нахождения кода
      }
    } catch (error) {
      console.error('Ошибка при обработке QR-кода:', error);
    }

    // Продолжаем сканирование
    requestAnimationFrame(processVideo);
  }, []);

  // Запускаем обработку видео после успешной инициализации
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      processVideo();
    }
  }, [processVideo]);

  // Добавляем обработчик события loadeddata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoLoad = () => {
      console.log('Видео загружено, начинаем обработку');
      processVideo();
    };

    video.addEventListener('loadeddata', handleVideoLoad);
    return () => video.removeEventListener('loadeddata', handleVideoLoad);
  }, [processVideo]);

  // Автоматическое скрытие сообщения об ошибке через 5 секунд
  useEffect(() => {
    let errorTimer;
    if (error) {
      errorTimer = setTimeout(() => {
        setError(null);
      }, 5000); // 5 секунд
    }
    return () => {
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [error]);

  // Сброс состояния ошибки при каждом открытии сканера
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  // Таймер безопасности для сброса состояния загрузки
  useEffect(() => {
    let safetyTimer;
    if (isOpen && isLoading) {
      safetyTimer = setTimeout(() => {
        setIsLoading(false);
      }, 10000); // 10 секунд максимум для загрузки
    }
    return () => {
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, [isOpen, isLoading]);

  // Инициализация камеры
  useEffect(() => {
    let stream;

    const startCamera = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);
      setScanResult(null);

      try {
        console.log('Запрашиваем доступ к камере...');
        
        // Добавляем таймаут для getUserMedia
        const mediaStreamPromise = navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        // Таймаут для предотвращения зависания
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Таймаут запроса доступа к камере')), 10000);
        });
        
        stream = await Promise.race([mediaStreamPromise, timeoutPromise]);
        
        const tracks = stream.getVideoTracks();
        console.log('Видеотреки:', tracks);
        
        if (tracks.length === 0) {
          throw new Error('Не удалось получить видеопоток с камеры');
        }

        if (videoRef.current) {
          videoRef.current.srcObject = null; // Очищаем предыдущий поток
          videoRef.current.srcObject = stream;
          videoRef.current.playsInline = true;
          
          // Ждем загрузки метаданных с таймаутом
          await Promise.race([
            new Promise((resolve) => {
              videoRef.current.onloadedmetadata = () => {
                console.log('Метаданные видео загружены');
                resolve();
              };
            }),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Таймаут загрузки метаданных')), 5000);
            })
          ]);
          
          // Пытаемся начать воспроизведение с таймаутом
          await Promise.race([
            videoRef.current.play(),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Таймаут воспроизведения')), 5000);
            })
          ]);
          
          console.log('Воспроизведение видео началось успешно');
        } else {
          throw new Error('Видеоэлемент не найден');
        }
      } catch (err) {
        console.error('Ошибка инициализации камеры:', err);
        // Устанавливаем флаг ошибки доступа
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Доступ к камере запрещен. Пожалуйста, разрешите доступ к камере в настройках браузера и перезагрузите страницу.');
        } else if (err.name === 'NotFoundError') {
          setError('Камера не найдена на вашем устройстве. Проверьте подключение камеры или используйте загрузку QR-кода из файла.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Камера занята другим приложением или недоступна. Закройте другие приложения, использующие камеру, и попробуйте снова.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Указанные параметры камеры не поддерживаются вашим устройством. Попробуйте загрузить QR-код из файла.');
        } else if (err.name === 'AbortError') {
          setError('Запрос к камере был отменен. Пожалуйста, попробуйте еще раз.');
        } else if (err.message && err.message.includes('Таймаут')) {
          setError('Истекло время ожидания ответа от камеры. Проверьте подключение камеры и попробуйте снова.');
        } else {
          setError(`Ошибка камеры: ${err.message || 'Неизвестная ошибка'}. Попробуйте загрузить QR-код из файла.`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  // Переключение фонарика (если доступно)
  const toggleTorch = async () => {
    const track = videoRef.current?.srcObject?.getVideoTracks()[0];
    if (!track || !track.getCapabilities().torch) {
      setError('Фонарик недоступен на этом устройстве');
      return;
    }
    
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchActive }]
      });
      setTorchActive(!torchActive);
    } catch (err) {
      console.error('Ошибка при включении фонарика:', err);
      setError('Не удалось включить фонарик');
    }
  };

  // Обработка загрузки QR-кода из файла
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          console.log('Найден QR-код в файле:', code.data);
          setScanResult(code.data);
          setShowResult(true);
        } else {
          setError('QR-код не найден в изображении');
          setShowResult(true);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleResultClose = () => {
    setShowResult(false);
    if (scanResult) {
      onScanSuccess(scanResult);
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          {/* Верхняя панель - упрощенная */}
          <div className="relative flex items-center justify-center p-4">
            <h2 className="text-lg font-medium text-white">Наведите на QR</h2>
          </div>

          {/* Кнопка закрытия сканера, всегда видимая даже при ошибках */}
          <div className="fixed top-4 left-4 z-[9999]">
            <button
              onClick={onClose}
              className="rounded-full bg-black/60 p-2 text-white hover:bg-black/80 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Область сканирования - более легкая, с уменьшенной высотой */}
          <div className="relative bg-black overflow-hidden" style={{ height: '40vh' }}>
            <video 
              ref={videoRef} 
              className="absolute inset-0 h-full w-full object-cover"
              playsInline 
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Рамка для сканирования - более легкая */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30"></div>
              
              {/* Рамка сканирования со светлыми углами */}
              <div className="relative aspect-square w-64">
                {/* Углы рамки */}
                <div className="absolute -left-2 -top-2 h-8 w-8 border-l border-t border-white"></div>
                <div className="absolute -right-2 -top-2 h-8 w-8 border-r border-t border-white"></div>
                <div className="absolute -bottom-2 -left-2 h-8 w-8 border-b border-l border-white"></div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 border-b border-r border-white"></div>
              </div>
            </div>
          </div>

          {/* Кнопка загрузки файла - центральная */}
          <div className="relative py-4 flex justify-center bg-black">
            <label className="flex items-center gap-2 rounded-full bg-gray-800 px-6 py-3 text-base font-medium text-white hover:bg-gray-700 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Загрузить файл
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Нижняя панель с платежами - с фиксированной минимальной высотой */}
          <div className="bg-gray-900 rounded-t-3xl flex-shrink-0" style={{ minHeight: '35vh', maxHeight: '45vh', overflowY: 'auto' }}>
            <div className="px-4 py-5">
              <h3 className="text-lg font-medium text-white mb-4">Переводы</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-800 rounded-xl p-3 flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">По номеру телефона</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-3 flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-purple-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">По реквизитам</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-white mb-4">Платежи и подписки</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-gray-800 rounded-xl p-3 flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Мобильная связь</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-3 flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-yellow-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Интернет и ТВ</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-3 flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Платежи по Сплитам</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-3 flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Подписка Яндекс Плюс</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 z-[9998] flex items-center justify-center bg-black/70">
              <div className="text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <p className="mt-2 text-sm text-white">Инициализация камеры...</p>
              </div>
            </div>
          )}

          {/* Сообщение об ошибке доступа к камере */}
          {error && !isLoading && (
            <div className="absolute top-20 inset-x-0 z-[9999] mx-auto max-w-md bg-red-50 p-4 rounded-lg shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  <p className="mt-1 text-sm text-red-700">
                    Вы можете загрузить QR-код из файла или закрыть сканер
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-auto -mx-1.5 -my-1.5 flex-shrink-0 rounded-lg p-1.5 text-red-500 hover:bg-red-100 focus:ring-2 focus:ring-red-500"
                  onClick={() => setError(null)}
                >
                  <span className="sr-only">Закрыть</span>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Добавляем кнопки действий при ошибке */}
              <div className="mt-4 flex justify-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Закрыть сканер
                </button>
                <label className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer">
                  Загрузить файл
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Результат сканирования */}
      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleResultClose} />
          
          <div className="relative w-full max-w-md rounded-2xl bg-gray-800 p-6 shadow-xl">
            <div className="flex flex-col items-center">
              {scanResult ? (
                <>
                  <div className="rounded-full bg-green-900 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 text-green-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-white">
                    QR-код успешно распознан
                  </h3>
                  <div className="mt-4 w-full rounded-lg bg-gray-700 p-4">
                    <pre className="whitespace-pre-wrap break-all text-sm text-gray-300">
                      {scanResult}
                    </pre>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-red-900 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 text-red-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-white">
                    QR-код не найден
                  </h3>
                  <p className="mt-2 text-center text-sm text-gray-400">
                    {error || 'Попробуйте отсканировать другой QR-код или загрузить другое изображение'}
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleResultClose}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Пример использования компонента QRScanner:
 * 
 * function App() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   
 *   const handleScanSuccess = (data) => {
 *     console.log('Отсканированные данные:', data);
 *     // Обработка полученных данных
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={() => setIsOpen(true)}>
 *         Открыть сканер QR-кода
 *       </button>
 *       
 *       <QRScanner
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         onScanSuccess={handleScanSuccess}
 *       />
 *     </div>
 *   );
 * }
 */

export default QRScanner; 