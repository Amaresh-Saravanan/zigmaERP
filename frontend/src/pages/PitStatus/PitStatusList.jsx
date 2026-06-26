import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const FIRST_DAY_OF_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export default function PitStatusList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ from_date: FIRST_DAY_OF_MONTH, to_date: TODAY, pit_name: '', status_type: '' });

  const handleEdit = (uniqueId) => navigate(`/pit_status/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId, batchId, trayNo, screenUniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      params.append('batch_id', batchId);
      params.append('tray_no', trayNo);
      params.append('screen_unique_id', screenUniqueId);
      const res = await client.post('folders/pit_status/crud.php', params);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting Pit Status', err);
    }
  };

  const columns = [
    { label: 'S.No' },
    { label: 'Entry Date' },
    { label: 'Pit Number' },
    { label: 'Pit Batch Id' },
    { label: 'Status', render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> },
    { label: 'Egg Batch Id' },
    { label: 'Organic Qty' },
    { label: 'Tippi Qty' },
    { label: 'Live Larvae' },
    { label: 'Harvesting Status', render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> },
    { label: 'Entry Person' },
    { 
      label: 'Action', 
      className: 'text-end',
      render: (val, row) => {
        // Backend returns the action buttons HTML string. We need to parse it to handle edit/delete safely in React.
        if (!val || val === '') return null;
        
        const updateMatch = val.match(/unique_id=([^&'"]+)/);
        const deleteMatch = val.match(/_delete_pit\(['"]([^'"]+)['"],\s*['"]([^'"]*)['"],\s*['"]([^'"]*)['"],\s*['"]([^'"]*)['"]/);
        
        const uniqueId = updateMatch ? updateMatch[1] : (deleteMatch ? deleteMatch[1] : null);
        if (!uniqueId) return <span dangerouslySetInnerHTML={{ __html: val }} />; // Fallback

        return (
          <div className="hstack gap-2 flex-wrap justify-content-end">
            {val.includes('btn_update') || val.includes('mdi-square-edit-outline') ? (
              <button onClick={() => handleEdit(uniqueId)} className="btn btn-sm btn-ghost-success waves-effect waves-light">
                <i className="ri-edit-2-line fs-15"></i>
              </button>
            ) : null}
            {deleteMatch ? (
              <button onClick={() => handleDelete(deleteMatch[1], deleteMatch[2], deleteMatch[3], deleteMatch[4])} className="btn btn-sm btn-ghost-danger waves-effect waves-light">
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
                <h5 className="d-flex align-items-center">Pit Status List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/pit_status/form')} className="btn btn-primary btn-sm">
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
                <select name="status_type" className="form-control form-control-sm" value={filters.status_type} onChange={handleFilterChange}>
                  <option value="">All Statuses</option>
                  <option value="1">Organic Waste Added in Pit</option>
                  <option value="2">Baby Larvae Added</option>
                  <option value="3">Aeration Process</option>
                  <option value="4">Measurement</option>
                  <option value="5">Harvesting</option>
                  <option value="7">Tippi</option>
                </select>
              </div>
              <div className="col-md-2">
                {/* Normally we'd fetch pit options here, but for simplicity we let DataTable handle text search */}
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/pit_status/crud.php"
              columns={columns}
              extraParams={extraParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
