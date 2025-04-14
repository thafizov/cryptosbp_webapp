import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import jsQR from 'jsqr';

const SCAN_INTERVAL = 150; // Интервал между сканированиями (мс)
const DEBOUNCE_DELAY = 1000; // Задержка перед следующим сканированием после успешного (мс)

const ScannerModal = ({ isOpen, onClose, onScanSuccess, fullScreen = true }) => {
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);
  const [cameraPermission, setCameraPermission] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Функция для проверки возможности сканирования (дебаунсинг)
  const canScan = useCallback(() => {
    const now = Date.now();
    if (now - lastScanTime < DEBOUNCE_DELAY) {
      return false;
    }
    return true;
  }, [lastScanTime]);

  // Функция для запуска сканирования
  const startScanner = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      setErrorMessage(
        error.name === 'NotAllowedError' 
          ? 'Нет доступа к камере. Пожалуйста, разрешите доступ в настройках браузера.'
          : 'Не удалось получить доступ к камере. Проверьте, что камера подключена и работает.'
      );
    }
  }, []);
  
  // Функция для остановки потока камеры
  const stopScanner = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setScanning(false);
  }, []);

  // Обработка успешного сканирования
  const handleSuccessfulScan = useCallback((data) => {
    if (!canScan()) return;
    
    setLastScanTime(Date.now());
    console.log('QR-код успешно отсканирован:', data);
    stopScanner();
    onScanSuccess(data);
  }, [onScanSuccess, stopScanner, canScan]);

  // Обработка сканирования через камеру
  useEffect(() => {
    const scanQRCode = () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(scanQRCode);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleSuccessfulScan(code.data);
      }

      animationFrameRef.current = requestAnimationFrame(scanQRCode);
    };

    if (scanning) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scanning, handleSuccessfulScan]);

  // Обработка файла QR-кода
  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setErrorMessage('');
    
    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          handleSuccessfulScan(code.data);
        } else {
          setErrorMessage('QR-код не найден в изображении');
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Ошибка при обработке файла:', error);
      setErrorMessage('Не удалось обработать изображение');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleSuccessfulScan]);

  // Эффект для управления жизненным циклом сканера
  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [isOpen, startScanner, stopScanner]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Сканировать QR-код"
      onBack={onClose}
      fullScreen={fullScreen}
      footer={
        <div className="flex justify-between w-full">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-primary flex items-center"
            disabled={scanning} // Отключаем кнопку во время сканирования
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Загрузить из галереи
          </button>
          <button 
            onClick={onClose}
            className="bg-gradient-to-br from-primary to-lime-300 text-black px-6 py-3 rounded-xl font-medium"
          >
            Отмена
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center h-full">
        {errorMessage && (
          <div className="bg-red-900/20 rounded-lg p-3 mb-4 w-full">
            <p className="text-sm text-red-400">{errorMessage}</p>
            {cameraPermission === 'denied' && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-primary text-sm mt-2 hover:underline"
              >
                Загрузить QR-код из галереи
              </button>
            )}
          </div>
        )}
        
        <div className="relative bg-black rounded-lg overflow-hidden mb-8 aspect-square w-full max-w-md mx-auto">
          {scanning ? (
            <div className="relative w-full h-full">
              <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full" 
                autoPlay 
                playsInline 
                muted
                style={{ 
                  objectFit: 'cover',
                  transform: 'scaleX(1)', // Убираем отзеркаливание
                  display: 'block', // Явно указываем display
                  minWidth: '100%',
                  minHeight: '100%'
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
          
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full opacity-50" 
            style={{
              zIndex: 10,
              background: 'rgba(0,0,0,0.1)'
            }}
          />
          
          <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none">
            <div className="absolute inset-20 border-2 border-primary rounded-lg"></div>
          </div>
        </div>
        
        <p className="text-center text-gray-400 mb-2 max-w-md mx-auto">
          {scanning 
            ? "Наведите камеру на QR-код для сканирования"
            : "Включите камеру или загрузите изображение с QR-кодом"
          }
        </p>
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
        />
      </div>
    </Modal>
  );
};

export default ScannerModal; 