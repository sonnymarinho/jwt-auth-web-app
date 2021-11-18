import axios, { AxiosError, AxiosInstance } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { CookieKeys } from '../../config/cookie';
import { HttpStatus } from '../../config/httpSatus';
import { signOut } from '../../contexts/AuthContext';
import { getCookie, setCookie } from '../../utils/cookies';

let isRefreshing = false;
let failedRequestsQueue: any[] = [];

export const setupAPIClient = (ctx: GetServerSidePropsContext | undefined = undefined): AxiosInstance => {
  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${getCookie(CookieKeys.TOKEN, ctx)}`,
    },
  });

  api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      const code = error.response?.data?.code;

      if (status === HttpStatus.UNAUTHORIZED) {
        if (code === 'token.expired') {
          const originalConfig = error.config;
          const refreshToken = getCookie(CookieKeys.REFRESH_TOKEN, ctx);

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post('/refresh', { refreshToken })
              .then(response => {
                const { token, refreshToken: newRefreshToken } = response.data;

                setCookie({ ctx, name: CookieKeys.TOKEN, value: token });

                setCookie({ ctx, name: CookieKeys.REFRESH_TOKEN, value: newRefreshToken });

                (api.defaults.headers as any)['Authorization'] = `Bearer ${token}`;

                failedRequestsQueue.forEach(request => request.onSuccess(token));
              })
              .catch(error => {
                failedRequestsQueue.forEach(request => request.onError(error));
                console.error(error);
                signOut();
              })
              .finally(() => {
                isRefreshing = false;
                failedRequestsQueue = [];
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                (originalConfig.headers as any)['Authorization'] = `Bearer ${token}`;

                resolve(api(originalConfig));
              },

              onError: (error: AxiosError) => {
                console.error(error);
                reject(error);
              },
            });
          });
        } else {
          signOut();
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};
