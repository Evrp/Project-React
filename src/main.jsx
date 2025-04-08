import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from "./firebase/Authcontext";
// import App from './Log/NewLogin.jsx'
// import App from './test/test2.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <BrowserRouter>
    <AuthProvider> 
      <App />
    </AuthProvider>
  </BrowserRouter>
</React.StrictMode>
)
