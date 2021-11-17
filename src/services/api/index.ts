import axios, { AxiosError } from "axios";
import { CookieKeys } from "../../config/cookie";
import { getCookie } from "../../utils/cookies";
import { ApiInterceptors } from "./interceptors";

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${getCookie(CookieKeys.TOKEN)}`,
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => ApiInterceptors.refreshToken(error)
);
