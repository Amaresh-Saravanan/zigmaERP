import React from 'react';
import { useNavigate } from 'react-router-dom';

import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

export default function UnitCreationList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Unit Name', key: 'unit_name' },
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
    navigate(`/unit_creation/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    try {
      const res = await djangoClient.delete(`/units/${uniqueId}`);
      if (res.data?.msg === 'success_delete') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error deleting unit', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Unit Creation List</h5>
              </div>
              <div className="col-auto align-self-center">
                <button
                  onClick={() => navigate('/unit_creation/form')}
                  className="btn btn-primary btn-sm"
                >
                  Create New Unit
                </button>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/units"
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
