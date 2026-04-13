import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL } from '@env';

type RequestConfigWithRetry = InternalAxiosRequestConfig & {
  __retryCount?: number;
};

function extractApiErrorMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }
  const record = data as Record<string, unknown>;
  const statusMessage = record.status_message;
  if (typeof statusMessage === 'string' && statusMessage.length > 0) {
    return statusMessage;
  }
  const message = record.message;
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }
  return undefined;
}

function normalizeAxiosError(error: unknown): { message: string; status: number } {
  if (!axios.isAxiosError(error)) {
    return { message: 'Unknown error', status: 0 };
  }
  const status = error.response?.status ?? 0;
  const fromBody = error.response?.data
    ? extractApiErrorMessage(error.response.data)
    : undefined;
  const message =
    fromBody ??
    (typeof error.message === 'string' && error.message.length > 0
      ? error.message
      : 'Request failed');
  return { message, status };
}

function isRetriableNetworkError(error: AxiosError): boolean {
  if (error.response !== undefined) {
    return false;
  }
  const code = error.code;
  if (code === 'ECONNABORTED' || code === 'ETIMEDOUT' || code === 'ERR_NETWORK') {
    return true;
  }
  return Boolean(error.request);
}

const client = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 30_000,
});

client.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${TMDB_ACCESS_TOKEN}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const config = error.config as RequestConfigWithRetry | undefined;
    if (!config) {
      return Promise.reject(normalizeAxiosError(error));
    }
    const retryCount = config.__retryCount ?? 0;
    if (retryCount < 1 && isRetriableNetworkError(error)) {
      config.__retryCount = retryCount + 1;
      return client.request(config);
    }
    return Promise.reject(normalizeAxiosError(error));
  },
);

export default client;
