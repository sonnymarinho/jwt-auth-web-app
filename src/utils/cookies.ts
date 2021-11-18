import { GetServerSidePropsContext, NextPageContext } from 'next';

import { parseCookies, setCookie as setNookie, destroyCookie as destroyNookie } from 'nookies';
import { DEFAULT_COOKIE_OPTIONS } from '../config/cookie';

const APPLICATION_NAME = 'jwt-auth-web-app';

const getCookieKey = (key: string) => `@${APPLICATION_NAME}:${key}`;

export const getCookie = (name: string, ctx?: GetServerSidePropsContext) => {
  return parseCookies(ctx)[getCookieKey(name)];
};

interface setCookieProps {
  ctx?: GetServerSidePropsContext;
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
  setNookie(ctx, getCookieKey(name), value, { ...DEFAULT_COOKIE_OPTIONS, ...options });
};

export const destroyCookie = (name: string, ctx?: GetServerSidePropsContext) => {
  destroyNookie(ctx, getCookieKey(name));
};
