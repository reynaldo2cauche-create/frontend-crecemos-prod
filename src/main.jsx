import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'

// PRIMERO Bootstrap (antes de TODO)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap-icons/font/bootstrap-icons.css';

// DESPUÉS tus estilos (para que sobrescriban Bootstrap)

import "./styles/global.css";
import './styles/intranet.css'; 

// Fuentes
import '@fontsource/open-sans/300.css'
import '@fontsource/open-sans/400.css'
import '@fontsource/open-sans/500.css'
import '@fontsource/open-sans/600.css'
import '@fontsource/open-sans/700.css'
import '@fontsource/open-sans/800.css'

import { AppRouter } from './routes/AppRouter'
import { DEFAULT_THEME } from './theme/theme'

// Bloquear copia
document.addEventListener('copy', function(e) {
  e.preventDefault();
  return false;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={DEFAULT_THEME}>
        <AppRouter />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)