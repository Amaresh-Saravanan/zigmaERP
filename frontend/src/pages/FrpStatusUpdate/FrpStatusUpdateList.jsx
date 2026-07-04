import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

const HATCHING_LABELS = { pending: 'Pending', progressing: 'Progressing', completed: 'Completed' };

export default function FrpStatusUpdateList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Entry Date', key: 'entry_date' },
    { label: 'Batch Id', key: 'batch.batch.batch_id' },
    { label: 'Day', key: 'day' },
    { label: 'Hatching Status', key: 'hatching_status', render: (v) => HATCHING_LABELS[v] || v },
    { label: 'Entry Person', key: 'staff.user_name' },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => navigate(`/frp_status_update/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await djangoClient.delete(`/frp-status-update/${uniqueId}`);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting FRP Status Update', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">FRP Status Update List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/frp_status_update/form')} className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="/frp-status-update"
              mode="django"
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
