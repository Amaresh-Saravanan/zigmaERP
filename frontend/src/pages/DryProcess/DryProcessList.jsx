import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

const TYPE_LABELS = { '1': 'Input', '2': 'Output' };
const METHOD_LABELS = { '1': 'Solar', '2': 'Electric' };

export default function DryProcessList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'Date', key: 'date' },
    { label: 'Type', key: 'type', render: (v) => TYPE_LABELS[v] || v },
    { label: 'Drying Method', key: 'drying_method', render: (v) => METHOD_LABELS[v] || v },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Qty Manure', key: 'qty_manure' },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => navigate(`/dry_process/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await djangoClient.delete(`/dry-process/${uniqueId}`);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting dry process', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Dry Process List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/dry_process/form')} className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/dry-process"
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
