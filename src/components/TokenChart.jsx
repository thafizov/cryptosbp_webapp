import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getPriceHistory } from '../services/priceService';

// Регистрируем необходимые компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Функция для получения данных о ценах
const fetchPriceData = async (symbol, period) => {
  try {
    // Определяем параметры запроса в зависимости от периода
    let days;
    switch (period) {
      case '1d':
        days = 1;
        break;
      case '1w':
        days = 7;
        break;
      case '1m':
        days = 30;
        break;
      case '1y':
        days = 365;
        break;
      default:
        days = 1;
    }
    
    // Получаем данные из сервиса цен
    return await getPriceHistory(symbol, days);
  } catch (error) {
    console.error('Ошибка при получении данных о ценах:', error);
    throw error;
  }
};

// Форматирование данных для Chart.js
const formatChartData = (priceData, period) => {
  // Определяем формат для метки времени в зависимости от периода
  const formatTimeLabel = (timestamp) => {
    const date = new Date(timestamp);
    
    switch (period) {
      case '1d':
        // Для 1 дня показываем только время (часы:минуты)
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      case '1w':
        // Для 1 недели показываем день и месяц
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      case '1m':
        // Для 1 месяца показываем только день месяца
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      case '1y':
        // Для 1 года показываем месяц и год
        return date.toLocaleDateString('ru-RU', { month: '2-digit', year: '2-digit' });
      default:
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
  };
  
  // Форматируем метки времени
  const labels = priceData.map(item => formatTimeLabel(item[0]));
  
  // Форматируем данные цен
  const prices = priceData.map(item => item[1]);
  
  return {
    labels,
    datasets: [
      {
        label: 'Цена',
        data: prices,
        borderColor: 'rgb(163, 230, 53)', // lime-400
        backgroundColor: 'rgba(163, 230, 53, 0.1)',
        tension: 0.2,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };
};

// Опции для графика
const getChartOptions = (symbol) => {
  return {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return `${symbol} Price`;
          },
          label: (context) => {
            return `$${context.parsed.y.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(156, 163, 175, 0.7)',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(156, 163, 175, 0.7)',
          padding: 10,
          callback: (value) => {
            return `$${value.toFixed(2)}`;
          },
        },
      },
    },
  };
};

const TokenChart = ({ symbol, period, onPeriodChange }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const priceData = await fetchPriceData(symbol, period);
        const formattedData = formatChartData(priceData, period);
        setChartData(formattedData);
      } catch (err) {
        console.error('Ошибка при загрузке данных графика:', err);
        setError('Не удалось загрузить данные графика');
      } finally {
        setLoading(false);
      }
    };
    
    loadChartData();
  }, [symbol, period]);
  
  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">График {symbol}</h3>
        <div className="flex space-x-2">
          <button 
            className={`text-xs px-2 py-1 rounded-md ${period === '1d' ? 'bg-lime-400 text-black' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => onPeriodChange && onPeriodChange('1d')}
          >
            1Д
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded-md ${period === '1w' ? 'bg-lime-400 text-black' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => onPeriodChange && onPeriodChange('1w')}
          >
            1Н
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded-md ${period === '1m' ? 'bg-lime-400 text-black' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => onPeriodChange && onPeriodChange('1m')}
          >
            1М
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded-md ${period === '1y' ? 'bg-lime-400 text-black' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => onPeriodChange && onPeriodChange('1y')}
          >
            1Г
          </button>
        </div>
      </div>
      
      <div className="h-48 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span>Загрузка графика...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span>{error}</span>
          </div>
        ) : chartData ? (
          <Line data={chartData} options={getChartOptions(symbol)} height={192} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <span>Нет данных для отображения</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenChart; 