import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { TelegramProvider } from './contexts/TelegramContext';

// Компонент ErrorBoundary для перехвата ошибок
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Обновляем состояние, чтобы следующий рендер показал fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Можно логировать ошибку в аналитику
    console.error('Перехвачена ошибка:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Показываем запасной UI - можно настроить под ваш стиль
      return this.props.fallback || this.props.children;
    }

    return this.props.children;
  }
}

// Глобальный обработчик неперехваченных ошибок
window.addEventListener('error', (event) => {
  console.error('Глобальная ошибка:', event.error);
  // Предотвращаем стандартное поведение браузера
  event.preventDefault();
});

// Глобальный обработчик отклоненных промисов
window.addEventListener('unhandledrejection', (event) => {
  console.error('Неперехваченное отклонение промиса:', event.reason);
  // Предотвращаем стандартное поведение браузера
  event.preventDefault();
});

const root = ReactDOM.createRoot(document.getElementById('root'));
// Получаем basename из homepage в package.json для GitHub Pages
const basename = process.env.PUBLIC_URL;

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <TelegramProvider>
          <App />
        </TelegramProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
); 