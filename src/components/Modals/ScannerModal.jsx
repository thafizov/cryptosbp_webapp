import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import jsQR from 'jsqr';

const ScannerModal = ({ isOpen, onClose, onScanSuccess, fullScreen = true }) => {
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null); // Реф для хранения потока камеры
  
  // Функция для запуска сканирования
  const startScanner = async () => {
    setErrorMessage('');
    setScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Сохраняем поток для последующего закрытия
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setScanning(false);
      setErrorMessage('Не удалось получить доступ к камере. Пожалуйста, проверьте разрешения.');
      console.error('Ошибка доступа к камере:', error);
    }
  };
  
  // Функция для остановки потока камеры
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    setScanning(false);
  };
  
  // Остановка сканирования при закрытии модального окна
  // Используем useCallback, чтобы функция не пересоздавалась при каждом рендере
  const stopScanner = useCallback(() => {
    stopCamera();
  }, []);

  // Обработка файла QR-кода
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Реальная логика декодирования QR-кода из изображения
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            console.log('Найден QR-код в файле:', code.data);
            stopCamera(); // Останавливаем камеру перед закрытием модального окна
            onScanSuccess(code.data);
          } else {
            setErrorMessage('QR-код не найден в изображении');
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработка успешного сканирования
  // Используем useCallback, чтобы функция не пересоздавалась при каждом рендере
  const handleSuccessfulScan = useCallback((data) => {
    console.log('Найден QR-код:', data);
    stopCamera(); // Останавливаем камеру
    onScanSuccess(data); // Передаем результат наверх
  }, [onScanSuccess]);

  // Обработка сканирования кода
  useEffect(() => {
    let scanInterval;
    
    if (scanning && videoRef.current && canvasRef.current) {
      // Реальная логика сканирования через камеру с jsQR
      scanInterval = setInterval(() => {
        if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
          return;
        }
        
        const canvas = canvasRef.current;
        const canvasContext = canvas.getContext('2d');
        
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        canvasContext.drawImage(
          videoRef.current, 
          0, 
          0, 
          canvas.width, 
          canvas.height
        );
        
        const imageData = canvasContext.getImageData(
          0, 
          0, 
          canvas.width, 
          canvas.height
        );
        
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          clearInterval(scanInterval);
          handleSuccessfulScan(code.data);
        }
      }, 100);
    }

    return () => {
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [scanning, handleSuccessfulScan]);

  // Обработчик закрытия модального окна
  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Эффект для запуска/остановки сканера
  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, stopScanner]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Сканировать QR-код"
      fullScreen={fullScreen}
      footer={
        <div className="flex justify-between w-full">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Загрузить из галереи
          </button>
          <button 
            onClick={handleClose}
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
          </div>
        )}
        
        <div className="relative bg-black rounded-lg overflow-hidden mb-8 aspect-square w-full max-w-md mx-auto">
          {scanning ? (
            <video 
              ref={videoRef} 
              className="w-full h-full" 
              autoPlay 
              playsInline 
              muted
            />
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
            className="absolute top-0 left-0 w-full h-full hidden" 
          />
          
          <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none">
            <div className="absolute inset-20 border-2 border-primary rounded-lg"></div>
          </div>
        </div>
        
        <p className="text-center text-gray-400 mb-2 max-w-md mx-auto">
          Наведите камеру на QR-код для сканирования
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