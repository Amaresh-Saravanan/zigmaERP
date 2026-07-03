import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

export default function UserScreenList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Main Screen', key: 'main_screen.screen_main_name' },
    { label: 'Screen Name', key: 'screen_name' },
    { label: 'Folder', key: 'folder_name' },
    { label: 'Icon', key: 'icon_name' },
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
    navigate(`/user_screen/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this screen?')) return;
    try {
      const res = await djangoClient.delete(`/screens/${uniqueId}`);
      if (res.data?.msg === 'success_delete') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error deleting screen', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">User Screen List</h5>
              </div>
              <div className="col-auto align-self-center">
                <button
                  onClick={() => navigate('/user_screen/form')}
                  className="btn btn-primary btn-sm"
                >
                  Create New Screen
                </button>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/screens"
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
