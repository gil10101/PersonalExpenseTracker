import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './App.css'
import { Amplify } from 'aws-amplify'
import { configureAmplify } from './utils/amplifyConfig.js'

// Configure Amplify
const client = configureAmplify();

// Log configuration for debugging
console.log('Amplify configuration loaded and client initialized');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
