import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import DataTable from '../../components/DataTable';

const TODAY = new Date().toISOString().split('T')[0];
const FIRST_OF_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

// ponytail: rewired from PHP crud.php to Django REST endpoint
export default function RejectsImageUploadList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    from_date: FIRST_OF_MONTH,
    to_date: TODAY,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (uniqueId) => navigate(`/rejects_image_upload/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await djangoClient.delete(`/reject-images/${uniqueId}`);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Upload Date', key: 'upload_date' },
    { label: 'Ticket', key: 'ticket_no' },
    { label: 'Weigh Date', key: 'weigh_date' },
    { label: 'Vehicle Number', key: 'vehicle_no' },
    { label: 'Net Weight (Tons)', key: 'net_weight' },
    {
      label: 'Image',
      key: 'image_path',
      render: (val) => val
        ? <a href={val} target="_blank" rel="noreferrer" className="badge bg-success-subtle text-success">View</a>
        : <span className="text-muted">—</span>,
    },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

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
                <DateInput
                  name="from_date"
                  value={filters.from_date}
                  onChange={handleFilterChange}
                  className="form-control form-control-sm"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>To Date</label>
                <DateInput
                  name="to_date"
                  value={filters.to_date}
                  onChange={handleFilterChange}
                  className="form-control form-control-sm"
                />
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/reject-images"
              columns={columns}
              extraParams={extraParams}
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
