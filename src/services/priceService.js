// API для получения курсов криптовалют
// Можно использовать CoinGecko, Binance, CryptoCompare и другие

// Маппинг символов криптовалют на ID для CoinGecko API
const coinIdMap = {
  'TON': 'the-open-network',
  'USDT': 'tether',
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  // Добавьте другие монеты по необходимости
};

// Получение текущей цены криптовалюты
export const getCurrentPrice = async (symbol) => {
  try {
    const coinId = coinIdMap[symbol.toUpperCase()] || 'the-open-network';
    
    // В реальном приложении здесь будет вызов API
    // const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    // const data = await response.json();
    // return data[coinId].usd;
    
    // Для демо возвращаем случайную цену
    const mockPrices = {
      'the-open-network': 2.5 + (Math.random() - 0.5) * 0.1,
      'tether': 1.0 + (Math.random() - 0.5) * 0.001,
      'bitcoin': 50000 + (Math.random() - 0.5) * 1000,
      'ethereum': 3000 + (Math.random() - 0.5) * 100
    };
    
    return mockPrices[coinId];
  } catch (error) {
    console.error('Ошибка при получении текущей цены:', error);
    return 0; // Возвращаем 0 в случае ошибки
  }
};

// Получение процентного изменения цены за последние 24 часа
export const getPriceChange24h = async (symbol) => {
  try {
    const coinId = coinIdMap[symbol.toUpperCase()] || 'the-open-network';
    
    // В реальном приложении здесь будет вызов API
    // const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    // const data = await response.json();
    // return data.market_data.price_change_percentage_24h;
    
    // Для демо возвращаем случайное изменение
    return (Math.random() * 10 - 5).toFixed(2); // От -5% до +5%
  } catch (error) {
    console.error('Ошибка при получении изменения цены:', error);
    return 0; // Возвращаем 0 в случае ошибки
  }
};

// Получение исторических данных для графика
export const getPriceHistory = async (symbol, days = 1) => {
  try {
    const coinId = coinIdMap[symbol.toUpperCase()] || 'the-open-network';
    
    // В реальном приложении здесь будет вызов API
    // const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
    // const data = await response.json();
    // return data.prices;
    
    // Для демо генерируем случайные данные
    return generateMockPriceData(days);
  } catch (error) {
    console.error('Ошибка при получении исторических данных:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
};

// Генерация тестовых данных для графика
const generateMockPriceData = (days) => {
  const data = [];
  const now = Date.now();
  const intervalHours = 1; // Интервал в часах между точками
  const interval = (24 * 60 * 60 * 1000) / (24 / intervalHours); // Интервал в миллисекундах
  const points = days * 24 / intervalHours; // Количество точек
  
  let lastPrice = 2.5; // Начальная цена
  
  for (let i = 0; i < points; i++) {
    // Генерируем случайное изменение цены
    const change = (Math.random() - 0.5) * 0.03; // Случайное изменение в пределах ±1.5%
    lastPrice = Math.max(0.1, lastPrice + lastPrice * change); // Цена не должна быть меньше 0.1
    
    // Добавляем точку [timestamp, price]
    data.push([now - (points - i) * interval, lastPrice]);
  }
  
  return data;
};

// Получение всех необходимых данных о цене для токена
export const getTokenPriceData = async (symbol) => {
  const price = await getCurrentPrice(symbol);
  const change24h = await getPriceChange24h(symbol);
  
  return {
    price,
    change24h
  };
}; 