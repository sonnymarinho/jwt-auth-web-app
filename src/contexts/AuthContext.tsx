import { createContext, useContext, useState } from 'react';
import Router from 'next/router';
import { api } from '../services/api';
import { setCookie } from 'nookies';
import { DEFAULT_COOKIE_OPTIONS } from '../config/cookie';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

interface AuthContextData {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user?: User;
}

const AuthContext = createContext({} as AuthContextData);

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();

  const isAuthenticated = !!user;

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const { data } = await api.post('/sessions', {
        email,
        password,
      });

      const { permissions, roles, refreshToken, token } = data;

      setUser({
        email,
        permissions,
        roles,
      });

      setCookie(undefined, '@jwt-auth-web-app:token', token, DEFAULT_COOKIE_OPTIONS);

      setCookie(undefined, '@jwt-auth-web-app:refreshToken', refreshToken, DEFAULT_COOKIE_OPTIONS);

      Router.push('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        isAuthenticated,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
