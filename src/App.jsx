// App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Import components
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Header from './components/Header';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './utils/AuthContext';

function App() {
  // Add a global style to fix icon sizing
  useEffect(() => {
    const iconStyle = document.createElement('style');
    iconStyle.innerHTML = `
      /* Bootstrap icons fix */
      i.bi {
        font-size: inherit !important;
        width: 1em !important;
        height: 1em !important;
        vertical-align: -0.125em !important;
        display: inline-block !important;
        overflow: visible !important;
        flex-shrink: 0 !important;
        max-width: none !important;
      }
      
      button i.bi, a i.bi, .icon-container i.bi {
        font-size: 1rem !important;
      }
      
      /* Fix for Bootstrap icons taking up too much width */
      .bi {
        max-width: fit-content !important;
      }
      
      /* Fix for Tabler Icons and other SVG icons */
      svg:not(.not-icon) {
        width: var(--icon-sm) !important;
        height: var(--icon-sm) !important;
        flex-shrink: 0 !important;
      }
      
      /* Allow specific sizing classes to override the default */
      .tabler-icon-xs, .icon-xs, .icon-xs svg, svg.icon-xs {
        width: var(--icon-xs) !important;
        height: var(--icon-xs) !important;
      }
      
      .tabler-icon-sm, .icon-sm, .icon-sm svg, svg.icon-sm {
        width: var(--icon-sm) !important;
        height: var(--icon-sm) !important;
      }
      
      .tabler-icon-md, .icon-md, .icon-md svg, svg.icon-md {
        width: var(--icon-md) !important;
        height: var(--icon-md) !important;
      }
      
      .tabler-icon-lg, .icon-lg, .icon-lg svg, svg.icon-lg {
        width: var(--icon-lg) !important;
        height: var(--icon-lg) !important;
      }
      
      .tabler-icon-xl, .icon-xl, .icon-xl svg, svg.icon-xl {
        width: var(--icon-xl) !important;
        height: var(--icon-xl) !important;
      }
    `;
    document.head.appendChild(iconStyle);
    
    return () => {
      document.head.removeChild(iconStyle);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />
      
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/add-expense" element={<ExpenseForm />} />
            <Route path="/edit-expense/:id" element={<ExpenseForm />} />
          </Route>

          {/* 404 Not Found Route */}
          <Route path="/not-found" element={<NotFound />} />
          
          {/* Catch all route - redirect to dashboard, login, or not found */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Navigate to="/not-found" replace />
            } 
          />
        </Routes>
      </main>

      <footer className="py-6 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm text-[hsl(var(--muted-foreground))]">
          <p>&copy; {new Date().getFullYear()} Personal Expense Tracker</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Terms</a>
            <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
      
      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
