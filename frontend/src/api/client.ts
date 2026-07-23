import axios from 'axios';

// En dev local, chaque service tourne sur un port différent.
// Plus tard (Kubernetes + Ingress), on passera tout par une seule URL de Gateway.
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3001';
const TICKET_URL = import.meta.env.VITE_TICKET_URL || 'http://localhost:3002';
const USER_URL = import.meta.env.VITE_USER_URL || 'http://localhost:3003';
const NOTIFICATION_URL = import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3004';

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
