// Talks to the new Django REST backend (JSON + token auth), separate from
// client.js's PHP crud.php calls — both run side by side during TASK-B10's
// module-by-module cutover.
import axios from 'axios';
import { attachFeedbackInterceptors } from './interceptors';

const djangoClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

djangoClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('django_token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// redirectOn401: false — a missing/invalid Django token doesn't mean the user is
// logged out of the app (PHP session auth is still the source of truth until every
// module is cut over), so a 401 here should surface as a permission error in the
// UI, not bounce the user back to /login.
attachFeedbackInterceptors(djangoClient, { redirectOn401: false });

export default djangoClient;
