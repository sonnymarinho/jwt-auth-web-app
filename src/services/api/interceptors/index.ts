import { AxiosError } from "axios";
import { handleRefreshTokenStrategy } from "./resfreshToken";

export const ApiInterceptors = {
  refreshToken: (error: AxiosError) => handleRefreshTokenStrategy(error),
};
