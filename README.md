# Криптовалютное веб-приложение для Telegram

Интерактивное веб-приложение для работы с криптовалютами, встраиваемое в Telegram.

## Демо версия

Демонстрационную версию можно посмотреть на [GitHub Pages](https://github.com/pages/[ваш_никнейм]/cryptosbp_webapp).

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Сборка для продакшена
npm run build
```

## Основные функции

- 💰 Управление криптовалютными токенами
- 💱 Отправка и получение криптовалюты
- 📱 Оплата через QR-код
- 📊 Графики курсов и история транзакций
- 🔐 Интеграция с Telegram Mini Apps

## Последние обновления

### Основные улучшения
1. **Улучшенный QR-сканер**:
   - Исправлен конфликт при отказе в доступе к камере
   - Добавлена возможность загрузки QR-кода из файла даже при отключенной камере
   - Улучшенный дизайн сканера с камерой на весь экран и выделенной областью сканирования
   - Стильный интерфейс с затемнением области вокруг рамки сканирования

2. **Визуальные улучшения**:
   - Добавлены эффекты переливания карточки баланса
   - Оптимизированные анимации для плавной работы

### Предыдущие обновления
1. **Улучшения истории транзакций**:
   - Фиксированная адаптивная верстка
   - Группировка транзакций по датам
   - Улучшенная визуализация типов операций с понятными иконками
   - Исправлены проблемы с переносом и отображением сумм

2. **Интеграция графиков токенов**:
   - Добавлены интерактивные графики курсов токенов
   - Поддержка различных периодов (1 день, 1 неделя, 1 месяц, 1 год)
   - Корректное отображение даты и времени на графике

3. **Интеграция с API курсов криптовалют**:
   - Подготовлен сервис для работы с CoinGecko API
   - Для демо режима реализована генерация тестовых данных

4. **Фильтрация транзакций**:
   - В окне токена отображаются только транзакции, связанные с этим токеном

## Структура проекта

- **src/components/** - Основные компоненты приложения
  - **Modals/** - Модальные окна для различных операций
  - **TransactionItem**, **TransactionsList**, **TransactionDetail** - Компоненты для работы с транзакциями
  - **TokenChart** - Компонент для отображения графика курса токена
- **src/contexts/** - React контексты, включая TelegramContext для интеграции с Telegram
- **src/hooks/** - Кастомные React хуки
- **src/utils/** - Утилиты и вспомогательные функции

## Технологии

- React.js
- TailwindCSS
- Telegram Mini Apps API
- Chart.js для графиков
- jsQR для сканирования QR-кодов

## Дополнительная информация

Для работы с графиками и курсами криптовалют рекомендуется интеграция с одним из следующих API:
- CoinGecko API
- Binance API
- CryptoCompare API

## Описание обновлений

### Новые улучшения
1. **Улучшенный QR-сканер**:
   - Исправлен конфликт при отказе в доступе к камере
   - Добавлена возможность загрузки QR-кода из файла даже при отключенной камере
   - Улучшенный дизайн сканера с камерой на весь экран и выделенной областью сканирования
   - Стильный интерфейс с затемнением области вокруг рамки сканирования

2. **Визуальные улучшения**:
   - Добавлены эффекты переливания карточки баланса
   - Оптимизированные анимации для плавной работы

### Предыдущие обновления
1. **Улучшения истории транзакций**:
   - Фиксированная адаптивная верстка
   - Группировка транзакций по датам
   - Улучшенная визуализация типов операций с понятными иконками
   - Исправлены проблемы с переносом и отображением сумм

2. **Интеграция графиков токенов**:
   - Добавлены интерактивные графики курсов токенов
   - Поддержка различных периодов (1 день, 1 неделя, 1 месяц, 1 год)
   - Корректное отображение даты и времени на графике

3. **Интеграция с API курсов криптовалют**:
   - Подготовлен сервис для работы с CoinGecko API
   - Для демо режима реализована генерация тестовых данных

4. **Фильтрация транзакций**:
   - В окне токена отображаются только транзакции, связанные с этим токеном

## Запуск проекта

```bash
npm start
```

## Структура компонентов

- **TransactionItem**: Универсальный компонент для отображения одной транзакции
- **TransactionsList**: Компонент для группировки и отображения списка транзакций
- **TransactionDetail**: Компонент для отображения детальной информации о транзакции
- **TokenChart**: Компонент для отображения графика курса токена
- **priceService**: Сервис для получения данных о курсах криптовалют

## API для курсов криптовалют

Для продакшена рекомендуется использовать одно из следующих API:
- CoinGecko API
- Binance API
- CryptoCompare API

В текущей реализации подготовлены все необходимые методы для интеграции с CoinGecko API.

Для работы с графиками и курсами криптовалют необходимо установить дополнительные зависимости:

```bash
npm install chart.js react-chartjs-2
``` 