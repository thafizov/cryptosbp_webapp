import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { TelegramProvider } from './contexts/TelegramContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <TelegramProvider>
    <App />
  </TelegramProvider>
); 