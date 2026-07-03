import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

const ORG_STATUS_LABELS = {
  '1': 'Organic Waste Added',
  '2': 'Baby Larvae Added',
  '3': 'Aeration Process',
  '4': 'Measurement',
  '5': 'Harvest',
  '6': 'Vibro Screen',
  '7': 'Tippi',
};

export default function PitStatusList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Entry Date', key: 'entry_date' },
    { label: 'Pit Number', key: 'pit.pit_name' },
    { label: 'Pit Batch Id', key: 'form_batch_id' },
    { label: 'Status', key: 'org_status', render: (v) => ORG_STATUS_LABELS[v] || v },
    { label: 'Notes', key: 'notes' },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => navigate(`/pit_status/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await djangoClient.delete(`/pit-status/${uniqueId}`);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting Pit Status', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
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
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/pit-status"
              columns={columns}
              showActiveFilter={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
