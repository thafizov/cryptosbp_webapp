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
        const constraints = {
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Доступ к камере получен:', stream);
        
        const tracks = stream.getVideoTracks();
        console.log('Видеотреки:', tracks);
        
        if (tracks.length === 0) {
          throw new Error('Не удалось получить видеопоток с камеры');
        }

        if (videoRef.current) {
          videoRef.current.srcObject = null; // Очищаем предыдущий поток
          videoRef.current.srcObject = stream;
          videoRef.current.playsInline = true;
          
          // Ждем, пока видео будет готово к воспроизведению
          await new Promise((resolve, reject) => {
            videoRef.current.onloadedmetadata = () => {
              console.log('Метаданные видео загружены');
              resolve();
            };
            videoRef.current.onerror = (error) => {
              console.error('Ошибка загрузки видео:', error);
              reject(new Error('Ошибка загрузки видео'));
            };
          });

          // Пытаемся начать воспроизведение
          try {
            await videoRef.current.play();
            console.log('Воспроизведение видео началось успешно');
          } catch (playError) {
            console.error('Ошибка воспроизведения:', playError);
            throw new Error('Не удалось начать воспроизведение видео');
          }
        } else {
          throw new Error('Видеоэлемент не найден');
        }
      } catch (err) {
        console.error('Ошибка инициализации камеры:', err);
        if (err.name === 'NotAllowedError') {
          setError('Для работы сканера необходимо разрешить доступ к камере');
        } else if (err.name === 'NotFoundError') {
          setError('Камера не найдена на устройстве');
        } else if (err.name === 'NotReadableError') {
          setError('Камера занята другим приложением');
        } else {
          setError(`Ошибка инициализации камеры: ${err.message}`);
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
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Затемнение фона */}
          <div className="fixed inset-0 bg-black/80" />
          
          {/* Верхняя панель */}
          <div className="relative flex items-center justify-between p-4">
            <button
              onClick={onClose}
              className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-medium text-white">Сканирование QR-кода</h2>
            <div className="w-10" /> {/* Для центрирования заголовка */}
          </div>

          {/* Основная область сканирования */}
          <div className="relative flex-1 bg-black">
            <video 
              ref={videoRef} 
              className="absolute inset-0 h-full w-full"
              playsInline 
              muted
              style={{
                objectFit: 'contain'
              }}
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Рамка сканирования */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative aspect-square w-64 rounded-2xl border-2 border-white/50">
                <div className="absolute -inset-1 rounded-2xl border-2 border-white/20" />
                <div className="absolute -inset-4 rounded-2xl border border-white/10" />
                
                {/* Углы рамки */}
                <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-white" />
                <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-white" />
                <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-white" />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-white" />
              </div>
            </div>

            {/* Подсказка */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-center text-sm text-white/80">
                Наведите камеру на QR-код или загрузите изображение
              </p>
            </div>
          </div>

          {/* Нижняя панель */}
          <div className="relative flex items-center justify-center gap-4 p-4">
            <label className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/20 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Загрузить
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <p className="mt-2 text-sm text-white">Инициализация камеры...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Результат сканирования */}
      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={handleResultClose} />
          
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex flex-col items-center">
              {scanResult ? (
                <>
                  <div className="rounded-full bg-green-100 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 text-green-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    QR-код успешно распознан
                  </h3>
                  <div className="mt-4 w-full rounded-lg bg-gray-100 p-4">
                    <pre className="whitespace-pre-wrap break-all text-sm text-gray-700">
                      {scanResult}
                    </pre>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-red-100 p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    QR-код не найден
                  </h3>
                  <p className="mt-2 text-center text-sm text-gray-500">
                    {error || 'Попробуйте отсканировать другой QR-код или загрузить другое изображение'}
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleResultClose}
                className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
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