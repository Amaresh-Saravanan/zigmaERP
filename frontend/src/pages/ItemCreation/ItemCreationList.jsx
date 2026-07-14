import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

export default function ItemCreationList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Item Code', key: 'item_code' },
    { label: 'Item Name', key: 'item_name' },
    { label: 'Unit', key: 'unit.unit_name' },
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
    navigate(`/item_creation/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#25a96b',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;

    try {
      const res = await djangoClient.delete(`/items/${uniqueId}`);
      if (res.data?.msg === 'success_delete') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error deleting item', err);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="card h-md-100 ecommerce-card-min-width">
            <div className="card-header pt-3 pb-2">
              <div className="row flex-between-end">
                <div className="col-auto align-self-center">
                  <h5 className="d-flex align-items-center">Item Creation List</h5>
                </div>
                <div className="col-auto ms-auto">
                  <button
                    onClick={() => navigate('/item_creation/form')}
                    className="btn btn-primary btn-sm"
                  >
                    Create New Item
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body d-flex flex-column justify-content-end">
              <DataTable
                mode="django"
                ajaxUrl="/items"
                columns={columns}
                showActiveFilter={false}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
