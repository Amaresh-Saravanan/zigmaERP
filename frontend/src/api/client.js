// ponytail: base axios client with swal2 feedback mapping, talks to legacy PHP crud.php endpoints
import axios from 'axios';
import { attachFeedbackInterceptors } from './interceptors';

const client = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  withCredentials: true,
});

attachFeedbackInterceptors(client);

export default client;
