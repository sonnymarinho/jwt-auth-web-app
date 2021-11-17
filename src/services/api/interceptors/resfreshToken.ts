import { AxiosError } from "axios";
import { api } from "..";
import { CookieKeys } from "../../../config/cookie";
import { HttpStatus } from "../../../config/httpSatus";
import { signOut } from "../../../contexts/AuthContext";
import { getCookie, setCookie } from "../../../utils/cookies";

let isRefreshing = false;
let failedRequestsQueue: any[] = [];

/**
 * Executes the refresh token strategy, renewing the token and the refresh token
 * in the cookies and in api services.
 *
 * @param data object containing the new token and the refresh token
 */
function renewToken(data: any) {
  const { token, refreshToken: newRefreshToken } = data;

  setCookie({ name: CookieKeys.TOKEN, value: token });

  setCookie({ name: CookieKeys.REFRESH_TOKEN, value: newRefreshToken });

  (api.defaults.headers as any)["Authorization"] = `Bearer ${token}`;
}

function resumeQueries(token: string) {
  failedRequestsQueue.forEach((request) => request.onSuccess(token));
}

/**
 * Requests the new token and resolves the queries that were waiting for the token to be refreshed.
 *
 * @param refreshToken string containing the refresh token.
 */
function requestNewTokenAndResolveQueries(refreshToken: string) {
  isRefreshing = true;

  api
    .post("/refresh", { refreshToken })
    .then(({ data }) => {
      renewToken(data);
      resumeQueries(data.token);
    })
    .catch((error) => {
      failedRequestsQueue.forEach((request) => request.onError(error));
    })
    .finally(() => {
      isRefreshing = false;
      failedRequestsQueue = [];
    });
}

/**
 * Catch all the queries that have failed while the token was being refreshed.
 *
 * @param error AxiosError with the error configuration data
 * @returns Promise resolution populating the {@link failedRequestsQueue} with the failed requests
 */
function getQueryPromisesAtRuntime(error: AxiosError) {
  const originalConfig = error.config;

  return new Promise((resolve, reject) => {
    failedRequestsQueue.push({
      onSuccess: (token: string) => {
        (originalConfig.headers as any)["Authorization"] = `Bearer ${token}`;

        resolve(api(originalConfig));
      },

      onError: (error: AxiosError) => {
        reject(error);
      },
    });
  });
}

function executeRefreshTokenStrategy(error: AxiosError) {
  const refreshToken = getCookie(CookieKeys.REFRESH_TOKEN);

  if (!isRefreshing) {
    requestNewTokenAndResolveQueries(refreshToken);
  }

  return getQueryPromisesAtRuntime(error);
}
/**
 * Execute the refresh token strategy: renew the token and the refresh token in the cookies and in api services.
 * If the error code is not "token.expired" sign out the user and redirect to the login page.
 *
 * @param error AxiosError with the error configuration data
 */
export function handleRefreshTokenStrategy(error: AxiosError) {
  {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === HttpStatus.UNAUTHORIZED) {
      if (code === "token.expired") {
        executeRefreshTokenStrategy(error);
      } else {
        signOut();
      }
    }

    return Promise.reject(error);
  }
}
