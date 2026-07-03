import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

export default function UserPermissionList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'User Type', key: 'type_name' },
    { label: 'Screens Granted', render: (_val, row) => (row.screens ? row.screens.split(',').filter(Boolean).length : 0) },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => {
    navigate(`/user_permission/form?unique_id=${uniqueId}`);
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">User Permission List</h5>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/user-types"
              columns={columns}
              showActiveFilter={false}
              onEdit={handleEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
