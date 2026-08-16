import axios from 'axios';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || '/api';
const TICKET_URL = import.meta.env.VITE_TICKET_URL || '/api';
const USER_URL = import.meta.env.VITE_USER_URL || '/api';
const NOTIFICATION_URL = import.meta.env.VITE_NOTIFICATION_URL || '/api';
const FILE_URL = import.meta.env.VITE_FILE_URL || '/api';

function createClient(baseURL: string) {
  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export const authApi = createClient(AUTH_URL);
export const ticketApi = createClient(TICKET_URL);
export const userApi = createClient(USER_URL);
export const notificationApi = createClient(NOTIFICATION_URL);
export const fileApi = createClient(FILE_URL);
