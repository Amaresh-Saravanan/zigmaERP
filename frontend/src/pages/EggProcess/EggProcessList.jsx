import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

export default function EggProcessList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Entry Date', key: 'entry_date' },
    { label: 'Entry No', key: 'entry_no' },
    { label: 'Batch Id', key: 'batch.batch_id' },
    { label: 'Supplier Name', key: 'supplier.supplier_name' },
    { label: 'Total Quantity(Grams)', key: 'tot_qty' },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => {
    navigate(`/egg_process/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this process?')) return;
    try {
      const res = await djangoClient.delete(`/egg-process/${uniqueId}`);
      if (res.data?.msg === 'success_delete') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error deleting egg process', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Egg Process List</h5>
              </div>
              <div className="col-auto align-self-center">
                <button
                  onClick={() => navigate('/egg_process/form')}
                  className="btn btn-primary btn-sm"
                >
                  Create New
                </button>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/egg-process"
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
