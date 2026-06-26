// ponytail: base axios client with swal2 feedback mapping
import axios from 'axios';
import Swal from 'sweetalert2';

const client = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  withCredentials: true,
});

const toastMap = {
  create: { icon: 'success', title: 'Successfully Saved' },
  update: { icon: 'success', title: 'Successfully Updated' },
  success_delete: { icon: 'success', title: 'Deleted!' },
  already: { icon: 'warning', title: 'Already Exist' },
  error: { icon: 'error', title: 'Error Occured' },
  approve: { icon: 'success', title: 'Successfully Approved' },
  convert: { icon: 'success', title: 'Successfully Converted' },
};

client.interceptors.response.use(
  (response) => {
    const msg = response.data?.msg;
    if (msg && toastMap[msg]) {
      const { icon, title } = toastMap[msg];
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        icon,
        title,
      });
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      Swal.fire({ icon: 'error', title: 'Network Error', text: 'Cannot connect to server.' });
    } else if (error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
