import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DateInput from '../../components/DateInput';
import DataTable from '../../components/DataTable';
import DateInput from '../../components/DateInput';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const FIRST_DAY_OF_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export default function StatusUpdateList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ from_date: FIRST_DAY_OF_MONTH, to_date: TODAY });

  const handleEdit = (uniqueId) => {
    navigate(`/status_update/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId, batchId1) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      params.append('batch_id1', batchId1);
      const res = await client.post('folders/status_update/crud.php', params);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting status update', err);
    }
  };

  const columns = [
    { label: 'S.No' },
    { label: 'Entry Date' },
    { label: 'Batch Id' },
    { label: 'Day' },
    { label: 'Processing started Day' },
    { label: 'Hatching Status' },
    { label: 'Upload' },
    { label: 'Entry Person' },
    { 
      label: 'Action', 
      className: 'text-end',
      render: (val, row) => {
        // Backend returns HTML string in val (row[8]) if buttons should be shown.
        // It's empty if buttons should be hidden (based on date/FRP rules).
        if (!val) return null;
        
        // Extract unique_id from the href or onclick inside the HTML string
        const uniqueIdMatch = val.match(/unique_id=([^"&'\s>]+)/) || val.match(/_delete\(['"]([^'"]+)['"]/);
        const uniqueId = uniqueIdMatch ? uniqueIdMatch[1] : null;
        
        // batch_id1 is at row[9] based on backend datatable columns
        const batchId1 = row[9];

        return (
          <div className="hstack gap-2 flex-wrap justify-content-end">
            {val.includes('unique_id=') && (
              <button onClick={() => handleEdit(uniqueId)} className="btn btn-sm btn-ghost-success waves-effect waves-light">
                <i className="ri-edit-2-line fs-15"></i>
              </button>
            )}
            {val.includes('_delete') && (
              <button onClick={() => handleDelete(uniqueId, batchId1)} className="btn btn-sm btn-ghost-danger waves-effect waves-light">
                <i className="ri-delete-bin-line fs-15"></i>
              </button>
            )}
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
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Status Update List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/status_update/form')} className="btn btn-primary btn-sm">
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
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/status_update/crud.php"
              columns={columns}
              extraParams={extraParams}
              // We rely on the custom render function for action column, so we omit global onEdit/onDelete
            />
          </div>
        </div>
      </div>
    </div>
  );
}
