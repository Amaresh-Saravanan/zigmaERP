import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

export default function OvenProcessList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'Date', key: 'entry_date' },
    { label: 'Start Time', key: 'starting_time' },
    { label: 'Close Time', key: 'closing_time' },
    { label: 'Total Run Hours', key: 'running_hours' },
    { label: 'Diesel Top-Up', key: 'diesel_topup' },
    { label: 'Raw Larvae Process', key: 'raw_larvae_process' },
    { label: 'Dried Larvae Production', key: 'dried_larvae_production' },
    { label: 'Dried Larvae Stock', key: 'dried_larvae_stock' },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => navigate(`/oven_process/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await djangoClient.delete(`/oven-process/${uniqueId}`);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting oven process', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Oven Process List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/oven_process/form')} className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/oven-process"
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
