import React from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

export default function UserTypeList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No' },
    { label: 'User Type' },
    { label: 'Status' },
    { label: 'Action', className: 'text-end' },
  ];

  const handleEdit = (uniqueId) => {
    navigate(`/user_type/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this user type?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      const res = await client.post('folders/user_type/crud.php', params);
      if (res.data?.msg === 'success_delete') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error deleting user type', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">User Type List</h5>
              </div>
              <div className="col-auto align-self-center">
                <button
                  onClick={() => navigate('/user_type/form')}
                  className="btn btn-primary btn-sm"
                >
                  Create New User Type
                </button>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/user_type/crud.php"
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
