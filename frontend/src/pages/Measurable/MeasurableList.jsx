import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import DataTable from '../../components/DataTable';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const FIRST_DAY_OF_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const LOCATION_LABELS = { '1': 'Weigh Bridge Side', '2': 'Solar Side' };
const LOCATIONS = [
  { value: '1', label: 'Weigh Bridge Side' },
  { value: '2', label: 'Solar Side' },
];

// ponytail: follows ItemCreationList pattern — djangoClient + mode="django"
export default function MeasurableList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ from_date: FIRST_DAY_OF_MONTH, to_date: TODAY, location: '' });

  const handleEdit = (uniqueId) => navigate(`/measurable/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await djangoClient.delete(`/measurable/${uniqueId}`);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting Measurable', err);
    }
  };

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Entry Date', key: 'entry_date' },
    { label: 'Location', key: 'location', render: (val) => LOCATION_LABELS[val] || val },
    { label: 'Temperature (C)', key: 'temp' },
    { label: 'Humidity (%)', key: 'humi' },
    { label: 'Remarks', key: 'remarks' },
    { label: 'Action', className: 'text-end', actions: true },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Measurable List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/measurable/form')} className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="row mt-2 g-2">
              <div className="col-md-2">
                <DateInput
                  name="from_date"
                  value={filters.from_date}
                  onChange={handleFilterChange}
                  className="form-control form-control-sm"
                  placeholder="From Date"
                />
              </div>
              <div className="col-md-2">
                <DateInput
                  name="to_date"
                  value={filters.to_date}
                  onChange={handleFilterChange}
                  className="form-control form-control-sm"
                  placeholder="To Date"
                />
              </div>
              <div className="col-md-3">
                <select name="location" className="form-select form-select-sm" value={filters.location} onChange={handleFilterChange}>
                  <option value="">All Locations</option>
                  {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/measurable"
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
