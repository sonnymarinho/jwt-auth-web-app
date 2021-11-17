import * as next from 'next';

import { parseCookies, setCookie as setNookie, destroyCookie as destroyNookie } from 'nookies';
import { DEFAULT_COOKIE_OPTIONS } from '../config/cookie';

const APPLICATION_NAME = 'jwt-auth-web-app';

const getKey = (key: string) => `@${APPLICATION_NAME}:${key}`;

export const getCookie = (name: string) => {
  return parseCookies()[getKey(name)];
};

interface setCookieProps {
  ctx?: next.NextPageContext;
  name: string;
  value: string;
  options?: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: boolean;
  };
}

export const setCookie = ({ ctx, name, value, options }: setCookieProps) => {
  setNookie(ctx, getKey(name), value, { ...DEFAULT_COOKIE_OPTIONS, ...options });
};

export const destroyCookie = (name: string) => {
  destroyNookie(undefined, getKey(name));
};
