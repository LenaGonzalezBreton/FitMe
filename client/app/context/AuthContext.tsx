import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  birthDate?: string;
  profileType?: string;
  contextType?: string;
  objective?: string;
  sportFrequency?: string;
  isMenopausal?: boolean;
  onboardingCompleted?: boolean;
  experienceLevel?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const storedToken = await SecureStore.getItemAsync('accessToken');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);

        // First try to get user from stored data
        const storedUser = await SecureStore.getItemAsync('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (__DEV__) {
            console.log('AuthContext - Loaded user from storage:', {
              id: parsedUser.id,
              email: parsedUser.email,
              onboardingCompleted: parsedUser.onboardingCompleted
            });
          }
          setUser(parsedUser);
        }

        // Then validate with server and update if needed
        const { data } = await api.get('/auth/profile');
        const raw = data.user;
        const profile: User = {
          id: raw.id,
          email: raw.email,
          firstName: raw.firstName,
          onboardingCompleted: raw.onboardingCompleted,
          experienceLevel: raw.experienceLevel,
          birthDate: raw.birthDate ? raw.birthDate : undefined,
          profileType: raw.profileType,
          contextType: raw.contextType,
          objective: raw.objective,
          sportFrequency: raw.sportFrequency,
          isMenopausal: raw.isMenopausal,
        };
        
        if (__DEV__) {
          console.log('AuthContext - Server profile data:', {
            id: profile.id,
            email: profile.email,
            onboardingCompleted: profile.onboardingCompleted
          });
        }
        
        setUser(profile);
        await SecureStore.setItemAsync('user', JSON.stringify(profile));
      } catch (err: any) {
        console.log('Session validation failed, clearing stored data');
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        setUser(null);
        setToken(null);
        
        // Don't show error to user for session expiration - they'll be redirected to login
        if (err?.name === 'SessionExpired') {
          console.log('Session expired - user will be redirected to login');
        } else {
          console.error('Session validation error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (user: User, accessToken: string, refreshToken: string) => {
    if (__DEV__) {
      console.log('AuthContext login - User onboarding status:', {
        id: user.id,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted
      });
    }
    
    setUser(user);
    setToken(accessToken);
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    
    if (__DEV__) {
      console.log('AuthContext login - User data saved to SecureStore');
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
