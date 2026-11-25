import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

export default function () {
  // Champs attendus par creerAnnonce (POST /api/annonces est public)
  const payload = JSON.stringify({
    nomEmployeur: `Employeur Test k6 VU-${__VU}`,
    emailEmployeur: `test-k6-vu${__VU}@example.com`,
    telephoneEmployeur: '+2250102030405',
    titre: `Demande test k6 VU-${__VU}-${__ITER}`,
    description: 'Annonce temporaire de test de charge ecriture',
    localisation: 'Cocody',
  });

  const createRes = http.post(`${API_URL}/annonces`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'annonce_create' },
  });

  const createdOk = check(createRes, {
    'POST /api/annonces -> 201': (r) => r.status === 201,
  });

  if (!createdOk) {
    console.error(`Echec POST /api/annonces (${createRes.status}) : ${createRes.body}`);
  }

  sleep(1);
}