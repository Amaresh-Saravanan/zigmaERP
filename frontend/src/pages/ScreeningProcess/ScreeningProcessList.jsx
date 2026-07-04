import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

export default function ScreeningProcessList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Entry Date', key: 'entry_date' },
    { label: 'Pit Number', key: 'pit.pit_name' },
    { label: 'Pit Batch Id', key: 'form_batch_id' },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => {
    navigate(`/screening_process/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this process?')) return;
    try {
      const res = await djangoClient.delete(`/pit-status/${uniqueId}`);
      if (res.data?.msg === 'success_delete') {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error deleting screening process', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
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
              ajaxUrl="/pit-status"
              mode="django"
              extraParams={{ org_status: '6' }}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActiveFilter={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
