import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { CookieKeys } from '../config/cookie';
import { getCookie } from './cookies';

export function withSSRAuth<T>(func: GetServerSideProps<T>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const token = getCookie(CookieKeys.TOKEN, ctx);

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return func(ctx);
  };
}
