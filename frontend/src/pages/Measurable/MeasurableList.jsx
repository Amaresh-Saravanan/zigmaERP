import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const FIRST_DAY_OF_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const LOCATIONS = [
  { value: "1", label: "Weight Bridge Side" },
  { value: "2", label: "Solar Side" }
];

export default function MeasurableList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ from_date: FIRST_DAY_OF_MONTH, to_date: TODAY, location: '' });

  const handleEdit = (uniqueId) => navigate(`/measurable/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      const res = await client.post('folders/measurable/crud.php', params);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting Measurable', err);
    }
  };

  const columns = [
    { label: 'S.No' },
    { label: 'Entry Date' },
    { label: 'Location' },
    { label: 'Temperature (C)' },
    { label: 'Humidity (%)' },
    { label: 'Remarks' },
    { label: 'Entry Person' },
    { 
      label: 'Action', 
      className: 'text-end',
      render: (val, row) => {
        if (!val || val === '') return null;
        
        const updateMatch = val.match(/unique_id=([^&'"]+)/);
        const deleteMatch = val.match(/_delete\(['"]([^'"]+)['"]/);
        
        const uniqueId = updateMatch ? updateMatch[1] : (deleteMatch ? deleteMatch[1] : null);
        if (!uniqueId) return <span dangerouslySetInnerHTML={{ __html: val }} />;

        return (
          <div className="hstack gap-2 flex-wrap justify-content-end">
            {val.includes('btn_update') || val.includes('mdi-square-edit-outline') ? (
              <button onClick={() => handleEdit(uniqueId)} className="btn btn-sm btn-ghost-success waves-effect waves-light">
                <i className="ri-edit-2-line fs-15"></i>
              </button>
            ) : null}
            {deleteMatch ? (
              <button onClick={() => handleDelete(deleteMatch[1])} className="btn btn-sm btn-ghost-danger waves-effect waves-light">
                <i className="ri-delete-bin-line fs-15"></i>
              </button>
            ) : null}
          </div>
        );
      }
    },
  ];

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
                <h5 className="d-flex align-items-center">Measurable List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/measurable/form')} className="btn btn-primary btn-sm">
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
              <div className="col-md-3">
                <select name="location" className="form-select form-select-sm" value={filters.location} onChange={handleFilterChange}>
                  <option value="">All Locations</option>
                  {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/measurable/crud.php"
              columns={columns}
              extraParams={extraParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
