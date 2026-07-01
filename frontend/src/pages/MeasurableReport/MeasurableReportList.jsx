import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const FIRST_DAY_OF_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const LOCATIONS = [
  { value: "1", label: "Weight Bridge Side" },
  { value: "2", label: "Solar Side" }
];

export default function MeasurableReportList() {
  const [filters, setFilters] = useState({ from_date: FIRST_DAY_OF_MONTH, to_date: TODAY, location: '', pit_name: '' });
  const [pitOptions, setPitOptions] = useState([]);

  useEffect(() => {
    // Fetch pit options from pit_status form.php since it has a convenient select element
    client.get('folders/pit_status/form.php', { responseType: 'text' })
      .then(res => {
        const doc = new DOMParser().parseFromString(res.data, 'text/html');
        const pitSelect = doc.querySelector('#pit_id');
        if (pitSelect) {
          const opts = Array.from(pitSelect.options).map(o => ({ value: o.value, label: o.text }));
          setPitOptions(opts.filter(o => o.value !== ''));
        }
      })
      .catch(err => console.error("Could not fetch pit options", err));
  }, []);

  const columns = [
    { label: 'S.No' },
    { label: 'Entry Date' },
    { label: 'Pit ID' },
    { label: 'Temperature (Start-Mid-End)' },
    { label: 'Humidity (Start-Mid-End)' },
    { label: 'Location' },
    { label: 'Temperature (outside)' },
    { label: 'Humidity (outside)' },
    { label: 'Remarks' },
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
            <div className="row mt-2 g-2 align-items-end">
              <div className="col-6 col-md-2">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>From Date</label>
                <input type="date" name="from_date" className="form-control form-control-sm"
                  value={filters.from_date} onChange={handleFilterChange} />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>To Date</label>
                <input type="date" name="to_date" className="form-control form-control-sm"
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
                <select name="pit_name" className="form-select form-select-sm" value={filters.pit_name} onChange={handleFilterChange}>
                  <option value="">All Pits</option>
                  {pitOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/measurable_report/crud.php"
              columns={columns}
              extraParams={extraParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
