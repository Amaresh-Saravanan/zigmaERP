import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

export default function OvenProcessList() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ from_date: '', to_date: '' });

  const columns = [
    { label: 'Date' },
    { label: 'Start / Close Time' },
    { label: 'Total Run Hours' },
    { label: 'Diesel Top-Up' },
    { label: 'Raw Larvae Process' },
    { label: 'Dried Larvae Production' },
    { label: 'Dried Larvae Stock' },
    { label: 'Image' },
    { label: 'Action', className: 'text-end' },
  ];

  const handleEdit = (uniqueId) => navigate(`/oven_process/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      const res = await client.post('folders/oven_process/crud.php', params);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting oven process', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

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

            {/* Date range filters */}
            <div className="row mt-2 g-2">
              <div className="col-md-2">
                <input type="date" name="from_date" className="form-control form-control-sm"
                  value={filters.from_date} onChange={handleFilterChange} />
              </div>
              <div className="col-md-2">
                <input type="date" name="to_date" className="form-control form-control-sm"
                  value={filters.to_date} onChange={handleFilterChange} />
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/oven_process/crud.php"
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              extraParams={extraParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
