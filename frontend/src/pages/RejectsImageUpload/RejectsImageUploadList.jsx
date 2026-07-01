import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DateInput from '../../components/DateInput';
import DataTable from '../../components/DataTable';

const TODAY = new Date().toISOString().split('T')[0];
const FIRST_OF_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

export default function RejectsImageUploadList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ 
    from_date: FIRST_OF_MONTH, 
    to_date: TODAY
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const payload = new URLSearchParams({ action: 'delete', unique_id: id });
      const res = await client.post('folders/rejects_image_upload/crud.php', payload);
      if (res.data.status === 'Success') {
        window.location.reload(); // Refresh datatable
      } else {
        alert(res.data.message || 'Error deleting record');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const columns = [
    { label: 'S.No' },
    { label: 'Date' },
    { label: 'Ticket' },
    { label: 'Weigh Date' },
    { label: 'Vehicle Number' },
    { label: 'Net Weight (Tons)' },
    { 
      label: 'Image', 
      className: 'text-center',
      render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> 
    },
    { 
      label: 'Action', 
      className: 'text-center',
      render: (val, row) => {
        if (!val) return null;
        const editMatch = val.match(/get_model_load\(['"]([^'"]+)['"]/);
        const delMatch = val.match(/trash_data\(['"]([^'"]+)['"]/);
        
        return (
          <div className="d-flex justify-content-center gap-2">
            {editMatch && (
              <button 
                className="btn btn-sm btn-ghost-primary waves-effect waves-light" 
                onClick={() => navigate(`/rejects_image_upload/form?unique_id=${editMatch[1]}`)}
              >
                <i className="ri-pencil-line fs-15"></i>
              </button>
            )}
            {delMatch && (
              <button 
                className="btn btn-sm btn-ghost-danger waves-effect waves-light" 
                onClick={() => handleDelete(delMatch[1])}
              >
                <i className="ri-delete-bin-line fs-15"></i>
              </button>
            )}
            {(!editMatch && !delMatch) && <span dangerouslySetInnerHTML={{ __html: val }} />}
          </div>
        );
      }
    }
  ];

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Rejects Image Upload List</h5>
              </div>
              <div className="col-auto ms-auto">
                <button className="btn btn-primary btn-sm waves-effect waves-light" onClick={() => navigate('/rejects_image_upload/form')}>
                  <i className="ri-add-line me-1"></i> Add Image Upload
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="row mt-2 g-2">
              <div className="col-md-2">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>From Date</label>
                <input type="date" name="from_date" className="form-control form-control-sm" 
                  value={filters.from_date} onChange={handleFilterChange} />
              </div>
              <div className="col-md-2">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>To Date</label>
                <input type="date" name="to_date" className="form-control form-control-sm" 
                  value={filters.to_date} onChange={handleFilterChange} />
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/rejects_image_upload/crud.php"
              columns={columns}
              extraParams={filters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
