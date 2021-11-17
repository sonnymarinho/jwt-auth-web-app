export enum CookieKeys {
  TOKEN = 'token',
  REFRESH_TOKEN = 'refreshToken',
}

export const DEFAULT_COOKIE_OPTIONS = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  path: '/',
};
