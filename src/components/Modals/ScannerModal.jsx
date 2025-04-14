import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import jsQR from 'jsqr';

const ScannerModal = ({ isOpen, onClose, onScanSuccess, fullScreen = true }) => {
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastScan, setLastScan] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Инициализация камеры
  useEffect(() => {
    const startCamera = async () => {
      if (!isOpen) return;

      try {
        console.log('Запрашиваем доступ к камере...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        console.log('Доступ к камере получен:', stream);

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
      setScanning(false);
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

  // Сканирование QR-кода
  useEffect(() => {
    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== 4) {
        requestAnimationFrame(scanQRCode);
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

        if (code) {
          const now = Date.now();
          // Проверяем, прошло ли достаточно времени с последнего успешного сканирования
          if (!lastScan || now - lastScan > 2000) { // 2 секунды задержки
            console.log('QR-код найден:', code.data);
            setLastScan(now);
            onScanSuccess(code.data);
          }
        }
      } catch (error) {
        console.error('Ошибка при обработке кадра:', error);
      }

      requestAnimationFrame(scanQRCode);
    };

    let frameId;
    if (scanning) {
      frameId = requestAnimationFrame(scanQRCode);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [scanning, onScanSuccess, lastScan]);

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
        
        if (code) {
          console.log('QR-код найден в файле:', code.data);
          onScanSuccess(code.data);
          onClose();
        } else {
          console.log('QR-код не найден в файле');
          setErrorMessage('QR-код не найден в изображении');
        }
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      fullScreen={true}
      className="bg-black"
      showHeader={false}
    >
      <div className="fixed inset-0">
        {/* Камера на весь экран */}
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

        {/* Маска с прозрачным квадратом */}
        <div className="absolute inset-0">
          {/* Верхняя часть затемнения */}
          <div className="absolute top-0 left-0 right-0 bottom-[calc(50%+140px)] bg-black/80" />
          {/* Нижняя часть затемнения */}
          <div className="absolute top-[calc(50%+140px)] left-0 right-0 bottom-0 bg-black/80" />
          {/* Левая часть затемнения */}
          <div className="absolute top-[calc(50%-140px)] left-0 bottom-[calc(50%-140px)] right-[calc(50%+140px)] bg-black/80" />
          {/* Правая часть затемнения */}
          <div className="absolute top-[calc(50%-140px)] left-[calc(50%+140px)] bottom-[calc(50%-140px)] right-0 bg-black/80" />
          
          {/* Рамка квадрата */}
          <div className="absolute top-[calc(50%-140px)] left-[calc(50%-140px)] w-[280px] h-[280px] border border-white/30" />
        </div>

        {/* Кнопка закрытия */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Кнопка загрузки файла */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full"
        >
          Загрузить из галереи
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />

        {/* Индикатор загрузки */}
        {!scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent" />
          </div>
        )}

        {/* Сообщение об ошибке */}
        {errorMessage && (
          <div className="absolute top-16 left-4 right-4">
            <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-red-400 text-center">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ScannerModal; 