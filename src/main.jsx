import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import SpriteProvider from './context/SpriteProvider.jsx';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SpriteProvider>
      <App />
    </SpriteProvider>
  </StrictMode>
);
