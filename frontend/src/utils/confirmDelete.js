import Swal from 'sweetalert2';

export default async function confirmDelete() {
  const result = await Swal.fire({
    title: 'Are you sure to Delete?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });
  return result.isConfirmed;
}
