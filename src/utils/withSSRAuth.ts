import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { CookieKeys } from '../config/cookie';
import { destroyAuthCookies } from '../contexts/AuthContext';
import { AuthTokenError } from '../services/errors/AuthTokenError';
import { getCookie } from './cookies';

export function withSSRAuth<T>(func: GetServerSideProps<T>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T> | undefined> => {
    const token = getCookie(CookieKeys.TOKEN, ctx);

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    try {
      return await func(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyAuthCookies(ctx);

        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }
    }
  };
}
