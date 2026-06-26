import React from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

export default function ScreeningProcessList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No' },
    { label: 'Entry Date' },
    { label: 'Pit Number' },
    { label: 'Pit Batch Id' },
    { label: 'Action', className: 'text-end' },
  ];

  const handleEdit = (uniqueId) => {
    navigate(`/screening_process/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this process?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      const res = await client.post('folders/screening_process/crud.php', params);
      if (res.data?.msg === 'success_delete') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error deleting screening process', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-md-12 col-xxl-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Screening Process List</h5>
              </div>
              <div className="col-auto align-self-center">
                <button
                  onClick={() => navigate('/screening_process/form')}
                  className="btn btn-primary btn-sm"
                >
                  Create New
                </button>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/screening_process/crud.php"
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
