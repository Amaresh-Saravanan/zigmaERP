// Talks to the new Django REST backend (JSON + token auth), separate from
// client.js's PHP crud.php calls — both run side by side during TASK-B10's
// module-by-module cutover.
import axios from 'axios';
import { attachFeedbackInterceptors } from './interceptors';

const djangoClient = axios.create({
  // Defaults to the same-origin '/api' (dev: Vite proxy → :8000; prod: reverse
  // proxy). Set VITE_API_URL to point at an absolute backend if ever split.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Django serializes users snake_case with a nested user_type; the React app reads
// camelCase (userName/userType/mainScreens/screens) — map once here so login,
// /auth/me and any future consumer stay consistent.
export function mapDjangoUser(u) {
  if (!u) return null;
  return {
    userId: u.unique_id,
    userName: u.user_name,
    userEmail: u.user_email ?? '',
    userType: u.user_type?.unique_id ?? '',
    mainScreens: u.main_screens ?? [],
    screens: u.screens ?? [],
    sections: [],
  };
}

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
