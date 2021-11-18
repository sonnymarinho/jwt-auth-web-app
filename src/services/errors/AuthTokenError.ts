export class AuthTokenError extends Error {
  constructor(message?: string) {
    super(message ?? 'Error with authentication token.');
  }
}
