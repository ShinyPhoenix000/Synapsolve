import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider, ThemeProvider } from './context';
import { validateEnv } from './config/env';
import { BrowserRouter } from 'react-router-dom';

// Validate environment variables before starting the app
try {
  validateEnv();
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  // You could show an error page here instead of crashing
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);