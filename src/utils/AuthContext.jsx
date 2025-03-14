import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { fetchUserAttributes } from 'aws-amplify/auth';

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  // Function to check authentication state
  const checkAuthState = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const attributes = await fetchUserAttributes();
        
        // Ensure we're using consistent field names with our database
        // The database uses camelCase (id, username, email, createdAt, updatedAt)
        setUser({
          id: currentUser.userId || attributes.sub, // Use sub as fallback ID
          username: currentUser.username,
          email: attributes.email,
          // We don't set createdAt/updatedAt as those are managed by the database
          ...attributes
        });
        
        console.log('User authenticated:', {
          id: currentUser.userId || attributes.sub,
          username: currentUser.username,
          email: attributes.email
        });
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
  }, []);

  // Function to handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message);
    }
  };

  // Value to be provided to consumers
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
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