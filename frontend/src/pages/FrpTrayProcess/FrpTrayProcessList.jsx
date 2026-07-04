import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

const BATCH_STATUS_LABELS = { pending: 'Pending', in_process: 'In Process' };

export default function FrpTrayProcessList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Entry Date', key: 'entry_date' },
    { label: 'Egg Batch Id', key: 'batch.batch_id' },
    { label: 'FRP Tray Qty', key: 'frp_tray_count' },
    { label: 'Tray Name', key: 'trays', render: (trays) => (trays || []).map((t) => t.bin_name).join(', ') },
    { label: 'Batch Status', key: 'batch_status', render: (v) => BATCH_STATUS_LABELS[v] || v },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => navigate(`/frp_tray_process/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await djangoClient.delete(`/frp-tray-process/${uniqueId}`);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting FRP Tray Process', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">FRP Tray Process List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/frp_tray_process/form')} className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="/frp-tray-process"
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
