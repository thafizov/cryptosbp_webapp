import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { TelegramProvider } from './contexts/TelegramContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Получаем basename из homepage в package.json для GitHub Pages
const basename = process.env.PUBLIC_URL;

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <TelegramProvider>
        <App />
      </TelegramProvider>
    </BrowserRouter>
  </React.StrictMode>
); 