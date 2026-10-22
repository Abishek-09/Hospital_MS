import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const ADMIN_STORAGE_KEY = 'scc_admin_session_v1';
const USER_STORAGE_KEY = 'scc_user_session_v1';

export function AuthProvider({ children }) {
  const [adminSession, setAdminSession] = useState(null);
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore independent sessions on mount
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (storedAdmin) {
        setAdminSession(JSON.parse(storedAdmin));
      }
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUserSession(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse portal sessions", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin / Doctor Auth Actions
  const loginAdmin = (username = '', password = '') => {
    const session = {
      role: 'admin',
      username: username || 'doctor',
      name: 'Dr. B. Sivakumar',
      degrees: 'M.B.B.S., M.D., (PEDS)',
      title: 'Consultant Pediatrician',
      loggedInAt: new Date().toISOString()
    };
    setAdminSession(session);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
    return { success: true, session };
  };

  const logoutAdmin = () => {
    setAdminSession(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  // User / Receptionist Auth Actions
  const loginUser = (username = '', password = '') => {
    const session = {
      role: 'user',
      username: username || 'reception',
      name: 'Front Desk Reception',
      title: 'System Controller',
      loggedInAt: new Date().toISOString()
    };
    setUserSession(session);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session));
    return { success: true, session };
  };

  const logoutUser = () => {
    setUserSession(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const isAdminAuthenticated = !!adminSession;
  const isUserAuthenticated = !!userSession;

  return (
    <AuthContext.Provider
      value={{
        adminSession,
        userSession,
        isAdminAuthenticated,
        isUserAuthenticated,
        loginAdmin,
        logoutAdmin,
        loginUser,
        logoutUser,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
