import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock login function - replaces AWS Cognito authentication
  const login = useCallback((username, password) => {
    setLoading(true);
    
    try {
      // Simple mock authentication - in a real app you would validate against a backend
      if (username && password) {
        const userData = {
          id: '1',
          username,
          email: `${username}@example.com`
        };
        
        // Store user in localStorage to persist across refreshes
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return Promise.resolve();
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (err) {
      setError(err.message);
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock signup function
  const signup = useCallback((username, email, password) => {
    setLoading(true);
    
    try {
      // In a real app, you would send this data to your backend
      const userData = {
        id: '1',
        username,
        email
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return Promise.resolve();
    } catch (err) {
      setError(err.message);
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication state
  const checkAuthState = useCallback(() => {
    setLoading(true);
    
    try {
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error checking auth state:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
    
    return Promise.resolve();
  }, []);

  // Run checkAuthState once on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  // Function to handle sign out
  const handleSignOut = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    return Promise.resolve();
  }, []);

  // Value to be provided to consumers
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    checkAuthState,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 