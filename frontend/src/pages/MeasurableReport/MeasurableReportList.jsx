import React, { useState, useEffect } from 'react';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';
import DateInput from '../../components/DateInput';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const FIRST_DAY_OF_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const LOCATIONS = [
  { value: "1", label: "Weight Bridge Side" },
  { value: "2", label: "Solar Side" }
];

export default function MeasurableReportList() {
  const [filters, setFilters] = useState({ from_date: FIRST_DAY_OF_MONTH, to_date: TODAY, location: '', pit_id: '' });
  const [pitOptions, setPitOptions] = useState([]);

  useEffect(() => {
    djangoClient.get('/pits', { params: { page_size: 100 } })
      .then(res => {
        const pits = res.data.data.results || [];
        setPitOptions(pits.map(p => ({ value: p.unique_id, label: p.pit_name })));
      })
      .catch(err => console.error('Could not fetch pit options', err));
  }, []);

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Entry Date', key: 'entry_date' },
    { label: 'Pit', key: 'pit_name' },
    { label: 'Temperature (Start-Mid-End)', key: 'temp_p' },
    { label: 'Humidity (Start-Mid-End)', key: 'humi_p' },
    { label: 'Location', key: 'location' },
    { label: 'Temperature (outside)', key: 'temp' },
    { label: 'Humidity (outside)', key: 'humi' },
    { label: 'Remarks', key: 'remarks' },
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
                <h5 className="d-flex align-items-center">Measurable Report</h5>
              </div>
            </div>

            {/* Filters */}
            <div className="row mt-2 g-3 align-items-end">
              <div className="col-6 col-md-2">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>From Date</label>
                <DateInput name="from_date" className="form-control form-control-sm"
                  value={filters.from_date} onChange={handleFilterChange} />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>To Date</label>
                <DateInput name="to_date" className="form-control form-control-sm"
                  value={filters.to_date} onChange={handleFilterChange} />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>Location</label>
                <select name="location" className="form-select form-select-sm" value={filters.location} onChange={handleFilterChange}>
                  <option value="">All Locations</option>
                  {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>Pit</label>
                <select name="pit_id" className="form-select form-select-sm" value={filters.pit_id} onChange={handleFilterChange}>
                  <option value="">All Pits</option>
                  {pitOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/measurable-report"
              columns={columns}
              extraParams={extraParams}
              showActiveFilter={false}
              showExportButtons
              exportTitle="Measurable Report"
              exportFilename="measurable_report"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
