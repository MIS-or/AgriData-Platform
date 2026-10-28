/**
 * Frontend Runtime Environment Accessor
 * Loaded by Vite from the single repository root `/.env` (`envDir: '../../'`).
 * Only `VITE_*` non-secret variables are exposed to the client bundle.
 */
export const WEB_ENV = {
  apiBaseUrl: ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) || '',
};

