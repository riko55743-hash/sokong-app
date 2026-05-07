import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import App from './App.jsx'
import { WalletContextProvider } from './components/WalletContextProvider.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

config.autoAddCss = false;  

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletContextProvider>
      <AuthProvider>        
        <App />
      </AuthProvider>       
    </WalletContextProvider>
  </StrictMode>,
)