import React, { useState } from 'react';
import QRScanner from './QRScanner';

/**
 * Пример компонента, демонстрирующего использование QRScanner
 */
function QRScannerExample() {
  // Состояние для управления видимостью сканера
  const [isScannerOpen, setScannerOpen] = useState(false);
  // Состояние для хранения результата сканирования
  const [scanResult, setScanResult] = useState(null);

  // Обработчик успешного сканирования
  const handleScanSuccess = (data) => {
    console.log('Отсканированные данные:', data);
    setScanResult(data);
    // Здесь можно обрабатывать данные QR-кода
    // Например, распарсить JSON, выполнить запрос API и т.д.
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Пример сканера QR-кодов</h1>
      
      {/* Кнопка для открытия сканера */}
      <button
        onClick={() => setScannerOpen(true)}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Открыть сканер QR-кода
      </button>
      
      {/* Отображение результата сканирования, если есть */}
      {scanResult && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Результат сканирования:</h2>
          <pre className="whitespace-pre-wrap break-all bg-white p-3 rounded border">
            {scanResult}
          </pre>
        </div>
      )}
      
      {/* Компонент сканера QR-кодов */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}

export default QRScannerExample; 