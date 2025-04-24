import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import jsQR from 'jsqr';

const ScannerModal = ({ isOpen, onClose, onScanSuccess, fullScreen = true }) => {
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastScan, setLastScan] = useState(null);
  const [torchActive, setTorchActive] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Сброс ошибки при изменении статуса открытия модального окна
  useEffect(() => {
    if (isOpen) {
      // Когда окно открывается, сбрасываем сообщение об ошибке
      setErrorMessage('');
    }
  }, [isOpen]);

  // Обертка для функции закрытия с дополнительной очисткой
  const handleClose = () => {
    // Сбрасываем состояние сканера при закрытии
    setErrorMessage('');
    setScanning(false);
    setIsInitialized(false);
    setTorchActive(false);
    
    // Вызываем оригинальную функцию закрытия
    onClose();
  };

  // Инициализация камеры
  useEffect(() => {
    let isMounted = true;
    let initializationTimeout;
    
    const startCamera = async () => {
      if (!isOpen) return;
      
      try {
        console.log('Запрашиваем доступ к камере...');
        const constraints = {
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Доступ к камере получен:', stream);
        
        // Проверяем, поддерживается ли фонарик
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          const capabilities = videoTracks[0].getCapabilities();
          setHasTorch(!!capabilities.torch);
        }

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        // Сохраняем поток
        streamRef.current = stream;

        if (!videoRef.current) {
          throw new Error('Элемент video не найден');
        }

        // Очищаем старый поток и устанавливаем новый
        videoRef.current.srcObject = null;
        videoRef.current.srcObject = stream;
        
        // Ждем загрузки метаданных и начинаем воспроизведение
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current.play();
              console.log('Видео успешно запущено');
              setScanning(true);
              
              // Задержка перед включением обработки сканирования
              // для избежания ложных срабатываний в начале
              initializationTimeout = setTimeout(() => {
                if (isMounted) {
                  setIsInitialized(true);
                  console.log('Сканер полностью инициализирован');
                }
              }, 1000);
              
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          
          videoRef.current.onerror = (error) => {
            reject(new Error(`Ошибка видео: ${error.message}`));
          };
        });

      } catch (err) {
        console.error('Ошибка инициализации камеры:', err);
        
        if (!isMounted) return;
        
        if (err.name === 'NotAllowedError') {
          setErrorMessage('Для работы сканера необходимо разрешить доступ к камере');
        } else if (err.name === 'NotFoundError') {
          setErrorMessage('Камера не найдена на устройстве');
        } else if (err.name === 'NotReadableError') {
          setErrorMessage('Камера занята другим приложением');
        } else {
          setErrorMessage(`Ошибка инициализации камеры: ${err.message}`);
        }
        
        setScanning(false);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      setScanning(false);
      setIsInitialized(false);
      clearTimeout(initializationTimeout);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isOpen]);

  // Функция для проверки валидности данных QR-кода
  const isValidQRCode = (data) => {
    // Базовая проверка, что данные не пустые и имеют минимальную длину
    if (!data || typeof data !== 'string' || data.trim().length < 3) {
      return false;
    }

    // Дополнительная проверка на валидный URL или известный формат
    // Можно добавить более сложные проверки в зависимости от ожидаемого формата данных
    try {
      // Пытаемся определить, является ли это URL или JSON
      if (data.startsWith('http') || data.startsWith('{')) {
        return true;
      }
      
      // Проверка на возможный текстовый формат данных (например, простой текст)
      if (/^[a-zA-Z0-9\s\-_:\/\.]+$/.test(data)) {
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Ошибка при проверке валидности QR-кода:', e);
      return false;
    }
  };

  // Сканирование QR-кода
  useEffect(() => {
    let frameId;
    
    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== 4) {
        frameId = requestAnimationFrame(scanQRCode);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      // Устанавливаем размеры canvas равными размерам видео
      if (video.videoWidth !== canvas.width || video.videoHeight !== canvas.height) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext('2d');
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && isInitialized) {
          const now = Date.now();
          // Проверяем, прошло ли достаточно времени с последнего успешного сканирования
          if (!lastScan || now - lastScan > 2000) { // 2 секунды задержки
            console.log('QR-код найден:', code.data);
            
            // Проверка валидности данных QR-кода перед отправкой
            if (isValidQRCode(code.data)) {
              setLastScan(now);
              onScanSuccess(code.data);
            } else {
              console.warn('Найден невалидный QR-код, игнорируем:', code.data);
            }
          }
        }
      } catch (error) {
        console.error('Ошибка при обработке кадра:', error);
      }

      frameId = requestAnimationFrame(scanQRCode);
    };

    if (scanning) {
      frameId = requestAnimationFrame(scanQRCode);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [scanning, onScanSuccess, lastScan, isInitialized]);

  // Обработка загрузки QR-кода из файла
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Загрузка файла:', file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        console.log('Изображение загружено, размеры:', {
          width: img.width,
          height: img.height
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && isValidQRCode(code.data)) {
          console.log('QR-код найден в файле:', code.data);
          onScanSuccess(code.data);
          handleClose();
        } else {
          console.log('QR-код не найден в файле или невалидный');
          setErrorMessage('QR-код не найден в изображении или имеет неверный формат');
          
          // Сбрасываем инпут файла для возможности повторной загрузки того же файла
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Управление фонариком
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    
    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !torchActive }]
        });
        setTorchActive(!torchActive);
      }
    } catch (error) {
      console.error('Ошибка управления фонариком:', error);
      setErrorMessage('Не удалось управлять фонариком');
    }
  };

  // Функция повторной инициализации камеры
  const retryCamera = () => {
    setErrorMessage('');
    setIsInitialized(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    
    // Короткая задержка перед повторной инициализацией
    setTimeout(() => {
      if (isOpen) {
        // Инициализация камеры выполнится повторно через useEffect
      }
    }, 500);
  };

  // Обработчики для элементов панели
  const handleOptionClick = (option) => {
    console.log(`Выбрана опция: ${option}`);
    // В будущем здесь будет логика для обработки различных опций
    alert(`Функция "${option}" будет доступна в ближайшее время!`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      fullScreen={true}
      className="bg-black"
      showHeader={false}
    >
      <div className="fixed inset-0 flex flex-col h-full">
        {/* Верхняя панель с заголовком */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-black/60 backdrop-blur-sm p-4 flex justify-between items-center">
          <button 
            onClick={handleClose}
            className="p-2 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-white text-lg font-medium">Наведите на QR</h2>
          
          <div className="flex space-x-2">
            {hasTorch && (
              <button 
                onClick={toggleTorch}
                className={`p-2 text-white ${torchActive ? 'bg-white/20 rounded-full' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
            )}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Основная область сканирования */}
        <div className="flex-1 relative">
          {/* Видео с камеры на весь экран */}
          <video 
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <canvas 
            ref={canvasRef}
            className="hidden"
          />

          {/* Только рамка сканера без затемнения */}
          <div className="absolute inset-0 flex items-center justify-center" style={{paddingBottom: "180px"}}>
            {/* Скругленная рамка без затемнения окружения */}
            <div className="w-[250px] h-[250px] border-2 border-white/50 rounded-2xl relative">
              {/* Уголки для визуального эффекта, как на скриншоте */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-xl" />
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />

          {/* Индикатор загрузки - теперь только когда нет ошибок */}
          {!scanning && !errorMessage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent" />
            </div>
          )}

          {/* Сообщение об ошибке - теперь с кнопкой повторной попытки */}
          {errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20 px-6">
              <div className="bg-red-900/30 backdrop-blur-sm rounded-lg p-4 mb-4 max-w-md">
                <p className="text-red-300 text-center mb-3">{errorMessage}</p>
                <div className="flex space-x-2">
                  <button 
                    onClick={retryCamera}
                    className="flex-1 px-4 py-2 bg-red-500/20 text-white text-sm font-medium rounded-lg"
                  >
                    Повторить попытку
                  </button>
                  <button 
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-gray-500/20 text-white text-sm font-medium rounded-lg"
                  >
                    Закрыть сканер
                  </button>
                </div>
              </div>
              <p className="text-white/60 text-sm text-center">
                Вы можете загрузить QR-код из галереи или закрыть сканер
              </p>
            </div>
          )}
        </div>

        {/* Уменьшенная панель с категориями платежей внизу экрана - без скругления */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md z-30 pb-safe h-[180px]">
          <div className="p-5">
            <h3 className="text-white text-lg font-medium mb-4">Платежи</h3>
            
            {/* Упрощенные карточки для платежей */}
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="bg-gray-800 p-4 rounded-xl flex flex-col items-center justify-center"
                onClick={() => handleOptionClick('Мобильная связь')}
              >
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white text-sm text-center">Мобильная связь</span>
              </div>
              
              <div 
                className="bg-gray-800 p-4 rounded-xl flex flex-col items-center justify-center"
                onClick={() => handleOptionClick('ЖКУ')}
              >
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="text-white text-sm text-center">ЖКУ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ScannerModal; 