import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
// ✅ Redux Imports
import { Provider } from 'react-redux';
import { store } from './redux/store'; 
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> 
      <HelmetProvider>
      <App />
      </HelmetProvider>
    </Provider>
  </StrictMode>
);