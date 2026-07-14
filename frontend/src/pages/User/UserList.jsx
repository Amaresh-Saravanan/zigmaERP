import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

export default function UserList() {
  const navigate = useNavigate();

  const columns = [
    { label: '#', sno: true },
    { label: 'User Type', key: 'user_type.type_name' },
    { label: 'User Name', key: 'user_name' },
    { label: 'Password', render: () => '••••••••' }, // ponytail: password_hash is write-only on the backend and never returned by the API — masked placeholder is the only correct display
    { label: 'First Name', key: 'first_name' },
    { label: 'Emp Id', key: 'emp_id' },
    {
      label: 'Status',
      key: 'is_active',
      render: (isActive) => (
        <span className={`badge ${isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => {
    navigate(`/user/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await djangoClient.delete(`/users/${uniqueId}`);
      if (res.data?.msg === 'success_delete') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error deleting user', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">User List</h5>
              </div>
              <div className="col-auto align-self-center">
                <button
                  onClick={() => navigate('/user/form')}
                  className="btn btn-primary btn-sm"
                >
                  Create New User
                </button>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/users"
              columns={columns}
              showActiveFilter={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
