import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import TagManager from 'react-gtm-module';
// ✅ Redux Imports
import { Provider } from 'react-redux';
import { store } from './redux/store'; // Make sure path is correct


const tagManagerArgs = {
    gtmId: 'GTM-T33CX9NQ' // Your specific ID from the screenshot
};

TagManager.initialize(tagManagerArgs);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> 
      <App />
    </Provider>
  </StrictMode>
);
