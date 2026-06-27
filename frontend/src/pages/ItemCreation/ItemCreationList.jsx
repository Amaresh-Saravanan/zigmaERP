import React from 'react';
import { useNavigate } from 'react-router-dom';

import client from '../../api/client';
import DataTable from '../../components/DataTable';

export default function ItemCreationList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No' },
    { label: 'Item Code' },
    { label: 'Item Name' },
    { label: 'Unit' },
    { label: 'Status' },
    { label: 'Action', className: 'text-end' },
  ];

  const handleEdit = (uniqueId) => {
    navigate(`/item_creation/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      const res = await client.post('folders/item_creation/crud.php', params);
      if (res.data?.msg === 'success_delete') {
        window.location.reload(); 
      }
    } catch (err) {
      console.error('Error deleting item', err);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row">
        <div className="col-12 col-sm-6 col-md-3 col-lg-2 mb-3">
          <label htmlFor="is_active">Active Status </label>
          <select name="active_status" id="active_status" className="form-control" required>
            <option value="">Select Status Type</option>
            <option value="all">All</option>
            <option value="1">Active</option>
            <option value="0">In Active</option>
          </select>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="card h-md-100 ecommerce-card-min-width">
            <div className="card-header pt-3 pb-2">
              <div className="row flex-between-end">
                <div className="col-auto align-self-center">
                  <h5 className="d-flex align-items-center">Item creation List</h5>
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
                ajaxUrl="folders/item_creation/crud.php"
                columns={columns}
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
