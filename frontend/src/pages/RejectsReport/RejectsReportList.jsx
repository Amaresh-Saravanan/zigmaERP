import React, { useState } from 'react';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';
import DateInput from '../../components/DateInput';

const TODAY = new Date().toISOString().split('T')[0];
const FIRST_OF_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

// ponytail: rewired from PHP crud.php to Django REST endpoint
export default function RejectsReportList() {
  const [filters, setFilters] = useState({
    from_date: FIRST_OF_MONTH,
    to_date: TODAY,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Ticket No', key: 'ticket_no' },
    { label: 'Vehicle No', key: 'vehicle_no' },
    { label: 'Vendor', key: 'vendor' },
    { label: 'Date', key: 'date' },
    { label: 'Time', key: 'time' },
    { label: 'Empty Weight (Tons)', key: 'empty_weight' },
    { label: 'Loaded Weight (Tons)', key: 'loaded_weight' },
    { label: 'Net Weight (Tons)', key: 'net_weight' },
    {
      label: 'Image',
      key: 'has_image',
      render: (val) => val
        ? <span className="badge bg-success-subtle text-success">Uploaded</span>
        : <span className="badge bg-secondary-subtle text-secondary">None</span>,
    },
  ];

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Rejects Report List</h5>
              </div>
            </div>

            {/* Filters */}
            <div className="row mt-2 g-2">
              <div className="col-md-2">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>From Date</label>
                <DateInput name="from_date" className="form-control form-control-sm"
                  value={filters.from_date} onChange={handleFilterChange} />
              </div>
              <div className="col-md-2">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>To Date</label>
                <DateInput name="to_date" className="form-control form-control-sm"
                  value={filters.to_date} onChange={handleFilterChange} />
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/rejects-report"
              columns={columns}
              extraParams={extraParams}
              showActiveFilter={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
