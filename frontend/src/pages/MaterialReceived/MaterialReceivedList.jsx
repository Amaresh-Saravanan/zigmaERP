import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

export default function MaterialReceivedList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'Batch Id', key: 'batch_id' },
    { label: 'Date', key: 'date' },
    { label: 'Supplier Name', key: 'supplier.supplier_name' },
    { label: 'Item Name', key: 'item.item_name' },
    { label: 'Qty', key: 'qty' },
    { label: 'Unit', key: 'unit.unit_name' },
    { label: 'Invoice Date', key: 'invoice_date' },
    { label: 'Invoice Number', key: 'invoice_no' },
    {
      label: 'Batch Status',
      key: 'batch_status',
      render: (val) => (
        <span className={`badge ${val === 'used' ? 'bg-secondary-subtle text-secondary' : 'bg-success-subtle text-success'}`}>
          {val === 'used' ? 'Used' : 'Pending'}
        </span>
      ),
    },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => {
    navigate(`/material_received/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await djangoClient.delete(`/material-received/${uniqueId}`);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting material received', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Material Received List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/material_received/form')} className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/material-received"
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
