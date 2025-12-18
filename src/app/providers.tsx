'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '@/types';

// Auth Context
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

// Theme Context
interface ThemeState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  cinemaMode: boolean;
}

interface ThemeContextType extends ThemeState {
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleCinemaMode: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeAction = 
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_CINEMA_MODE' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'TOGGLE_CINEMA_MODE':
      return { ...state, cinemaMode: !state.cinemaMode };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    default:
      return state;
  }
};

// Notification Context
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Auth Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('darktube_token');
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const { user } = await response.json();
            dispatch({ type: 'SET_USER', payload: { user, token } });
          } else {
            localStorage.removeItem('darktube_token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('darktube_token');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      localStorage.setItem('darktube_token', data.token);
      dispatch({ type: 'SET_USER', payload: { user: data.user, token: data.token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      localStorage.setItem('darktube_token', data.token);
      dispatch({ type: 'SET_USER', payload: { user: data.user, token: data.token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('darktube_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Theme Provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, {
    theme: 'dark',
    sidebarCollapsed: false,
    cinemaMode: false,
  });

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darktube_theme') as 'dark' | 'light';
    const savedSidebar = localStorage.getItem('darktube_sidebar_collapsed') === 'true';
    
    if (savedTheme && savedTheme !== state.theme) {
      dispatch({ type: 'TOGGLE_THEME' });
    }
    
    if (savedSidebar !== state.sidebarCollapsed) {
      dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: savedSidebar });
    }
  }, []);

  // Save theme changes to localStorage
  useEffect(() => {
    localStorage.setItem('darktube_theme', state.theme);
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  useEffect(() => {
    localStorage.setItem('darktube_sidebar_collapsed', state.sidebarCollapsed.toString());
  }, [state.sidebarCollapsed]);

  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });
  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const toggleCinemaMode = () => dispatch({ type: 'TOGGLE_CINEMA_MODE' });
  const setSidebarCollapsed = (collapsed: boolean) => 
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });

  return (
    <ThemeContext.Provider value={{
      ...state,
      toggleTheme,
      toggleSidebar,
      toggleCinemaMode,
      setSidebarCollapsed,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Notification Provider
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Combined Providers
export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Custom Hooks
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};