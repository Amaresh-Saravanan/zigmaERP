import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

const TYPE_OPTIONS = [{ value: '1', label: 'Input' }, { value: '2', label: 'Output' }];
const METHOD_OPTIONS = [{ value: '1', label: 'Solar' }, { value: '2', label: 'Electric' }];

export default function DryProcessList() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ from_date: '', to_date: '', type: '', drying_method: '' });

  const columns = [
    { label: 'Date' },
    { label: 'Type' },
    { label: 'Drying Method' },
    { label: 'Quantity' },
    { label: 'Image' },
    { label: 'Entry Person' },
    { label: 'Action', className: 'text-end' },
  ];

  const handleEdit = (uniqueId) => navigate(`/dry_process/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      const res = await client.post('folders/dry_process/crud.php', params);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting dry process', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  return (
    <div className="row g-3 mb-3">
      <div className="col-md-12 col-xxl-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Dry Process List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/dry_process/form')} className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="row mt-2 g-2">
              <div className="col-md-2">
                <input type="date" name="from_date" className="form-control form-control-sm" placeholder="From Date"
                  value={filters.from_date} onChange={handleFilterChange} />
              </div>
              <div className="col-md-2">
                <input type="date" name="to_date" className="form-control form-control-sm" placeholder="To Date"
                  value={filters.to_date} onChange={handleFilterChange} />
              </div>
              <div className="col-md-2">
                <select name="type" className="form-control form-control-sm" value={filters.type} onChange={handleFilterChange}>
                  <option value="">All Types</option>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <select name="drying_method" className="form-control form-control-sm" value={filters.drying_method} onChange={handleFilterChange}>
                  <option value="">All Drying Methods</option>
                  {METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/dry_process/crud.php"
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
