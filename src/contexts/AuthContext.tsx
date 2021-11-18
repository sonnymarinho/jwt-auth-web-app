import Router from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import { CookieKeys } from '../config/cookie';
import { api } from '../services/api';
import { destroyCookie, getCookie, setCookie } from '../utils/cookies';

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

export function signOut() {
  if (process.browser) {
    destroyCookie(CookieKeys.TOKEN);
    destroyCookie(CookieKeys.REFRESH_TOKEN);

    (api.defaults.headers as any)['Authorization'] = '';

    Router.push('/');
  }
}

function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    const token = getCookie(CookieKeys.TOKEN);

    if (token) {
      api
        .get('/me')
        .then((response: any) => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => signOut());
    }
  }, []);

  const [user, setUser] = useState<User>();

  const isAuthenticated = !!user;

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const { data } = await api.post('/sessions', {
        email,
        password,
      });

      const { permissions, roles, refreshToken, token } = data;

      setUser({ email, permissions, roles });

      setCookie({ name: CookieKeys.TOKEN, value: token });
      setCookie({ name: CookieKeys.REFRESH_TOKEN, value: refreshToken });

      (api.defaults.headers as any)['Authorization'] = `Bearer ${token}`;

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
