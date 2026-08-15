import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // montée progressive à 10 utilisateurs virtuels
    { duration: '1m', target: 20 },    // montée à 20
    { duration: '1m', target: 20 },    // maintien à 20 (charge soutenue)
    { duration: '30s', target: 0 },    // redescente
  ],
  thresholds: {
    http_req_duration: ['p(95)<2500'], // 95% des requêtes doivent répondre en moins de 1s
    http_req_failed: ['rate<0.05'],    // moins de 5% d'erreurs tolérées
  },
};

const BASE_URL = 'http://localhost:8080/api';

export default function () {
  // 1. Inscription (email unique par VU pour éviter les doublons)
  const email = `loadtest_${Date.now()}_${__VU}_${__ITER}@example.com`;
  const registerRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({ email, password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(registerRes, {
    'inscription réussie': (r) => r.status === 201,
  });

  const token = registerRes.json('access_token');
  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  sleep(1);

  // 2. Créer un ticket
  const ticketRes = http.post(
    `${BASE_URL}/tickets`,
    JSON.stringify({
      title: `Ticket de test ${__ITER}`,
      description: 'Généré par le test de charge k6',
      priority: 'MEDIUM',
      category: 'Test',
    }),
    authHeaders,
  );

  check(ticketRes, {
    'création ticket réussie': (r) => r.status === 201,
  });

  sleep(1);

  // 3. Lister les tickets
  const listRes = http.get(`${BASE_URL}/tickets`, authHeaders);

  check(listRes, {
    'liste tickets réussie': (r) => r.status === 200,
  });

  sleep(1);
}
