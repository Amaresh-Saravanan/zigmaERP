import React from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';

const SHIFT_LABELS = { '1': 'Day', '2': 'Night', '3': 'General' };
const CYLINDER_LABELS = { '1': 'O2', '2': 'LPG', '3': 'Other' };
const WORK_DONE_LABELS = { '1': 'Cutting', '2': 'Heating', '3': 'Others' };

export default function CullingProcessList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'Work Date', key: 'entry_date' },
    { label: 'Shift Type', key: 'shift_type', render: (v) => SHIFT_LABELS[v] || v },
    { label: 'Cylinder Type', key: 'cylinder_type', render: (v) => CYLINDER_LABELS[v] || v },
    { label: 'Cylinder No', key: 'cylinder_no' },
    { label: 'Starting Weight', key: 'starting_weight' },
    { label: 'Final Weight', key: 'ending_weight' },
    { label: 'Fuel Consumption', key: 'fuel_consumption' },
    { label: 'Raw Material', key: 'raw_material_weight' },
    { label: 'Final Larvae', key: 'final_larvae_weight' },
    { label: 'Work Done', key: 'work_done', render: (v) => WORK_DONE_LABELS[v] || v },
    { label: 'Others Remarks', key: 'others_remarks' },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleEdit = (uniqueId) => navigate(`/culling_process/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await djangoClient.delete(`/culling-process/${uniqueId}`);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting culling process', err);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Culling Process List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/culling_process/form')} className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/culling-process"
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
