import axios, { AxiosError } from 'axios';
import { CookieKeys } from '../config/cookie';
import { HttpStatus } from '../config/httpSatus';
import { getCookie, setCookie } from '../utils/cookies';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${getCookie(CookieKeys.TOKEN)}`,
  },
});

let isRefreshing = false;
let failedRequestsQueue: any[] = [];

api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === HttpStatus.UNAUTHORIZED) {
      if (code === 'token.expired') {
        const originalConfig = error.config;
        const refreshToken = getCookie(CookieKeys.REFRESH_TOKEN);

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post('/refresh', { refreshToken })
            .then(response => {
              const { token, refreshToken: newRefreshToken } = response.data;

              setCookie({ name: CookieKeys.TOKEN, value: token });

              setCookie({ name: CookieKeys.REFRESH_TOKEN, value: newRefreshToken });

              (api.defaults.headers as any)['Authorization'] = `Bearer ${token}`;

              failedRequestsQueue.forEach(request => request.onSuccess(token));
            })
            .catch(error => {
              failedRequestsQueue.forEach(request => request.onError(error));
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
              reject(error);
            },
          });
        });
      } else {
      }
    }

    return Promise.reject(error);
  }
);
