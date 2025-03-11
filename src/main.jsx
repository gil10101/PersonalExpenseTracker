import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/normalize.css'
import './styles/variables.css'
import './styles/typography.css'
import './styles/layout.css'
import './styles/components.css'
import { configureAmplify } from './amplifyconfiguration.js'

// Configure Amplify Gen 2
configureAmplify();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
