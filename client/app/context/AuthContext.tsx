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
        
        await SecureStore.setItemAsync('user', JSON.stringify(profile));
      } catch (err) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (user: User, accessToken: string, refreshToken: string) => {
    setUser(user);
    setToken(accessToken);
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
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
