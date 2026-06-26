import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

const SHIFT_OPTIONS = [{ value: '1', label: 'Day' }, { value: '2', label: 'Night' }, { value: '3', label: 'General' }];
const CYLINDER_OPTIONS = [{ value: '1', label: 'O2' }, { value: '2', label: 'LPG' }, { value: '3', label: 'Other' }];
const WORK_DONE_OPTIONS = [{ value: '1', label: 'Cutting' }, { value: '2', label: 'Heating' }, { value: '3', label: 'Others' }];

export default function CullingProcessList() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ from_date: '', to_date: '', shift_type: '', cylinder_type: '', work_done: '' });

  const columns = [
    { label: 'Work Date' },
    { label: 'Shift Type' },
    { label: 'Cylinder Type' },
    { label: 'Cylinder No' },
    { label: 'Starting Weight' },
    { label: 'Final Weight' },
    { label: 'Fuel Consumption' },
    { label: 'Raw Material' },
    { label: 'Final Larvae' },
    { label: 'Work Done' },
    { label: 'Others Remarks' },
    { label: 'Image' },
    { label: 'Entry Person' },
    { label: 'Action', className: 'text-end' },
  ];

  const handleEdit = (uniqueId) => navigate(`/culling_process/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      const res = await client.post('folders/culling_process/crud.php', params);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting culling process', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // ponytail: only pass non-empty filter values as extraParams
  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  return (
    <div className="row g-3 mb-3">
      <div className="col-md-12 col-xxl-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Culling Process List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/culling_process/form')} className="btn btn-primary btn-sm">
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
                <select name="shift_type" className="form-control form-control-sm" value={filters.shift_type} onChange={handleFilterChange}>
                  <option value="">All Shifts</option>
                  {SHIFT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <select name="cylinder_type" className="form-control form-control-sm" value={filters.cylinder_type} onChange={handleFilterChange}>
                  <option value="">All Cylinders</option>
                  {CYLINDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <select name="work_done" className="form-control form-control-sm" value={filters.work_done} onChange={handleFilterChange}>
                  <option value="">All Work Done</option>
                  {WORK_DONE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/culling_process/crud.php"
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
