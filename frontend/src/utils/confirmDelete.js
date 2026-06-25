// ponytail: standard delete confirmation wrapper using swal2
import Swal from 'sweetalert2';

export default function confirmDelete(onConfirm) {
  return Swal.fire({
    title: 'Are you sure?',
    text: " You wont be able to revert this!\,
 icon: 'warning',
 showCancelButton: true,
 confirmButtonColor: '#3085d6',
 cancelButtonColor: '#d33',
 confirmButtonText: 'Yes, delete it!'
 }).then((result) => {
 if (result.isConfirmed) {
 onConfirm();
 }
 });
}
