import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

const TODAY = new Date().toISOString().split('T')[0];

export default function LoginHistoryList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ from_date: TODAY, to_date: TODAY, staff_name: '' });
  const [staffOptions, setStaffOptions] = useState([]);

  useEffect(() => {
    // Fetch staff options from login_history/list.php via DOM parsing
    client.get('folders/login_history/list.php', { responseType: 'text' })
      .then(res => {
        const doc = new DOMParser().parseFromString(res.data, 'text/html');
        const staffSelect = doc.querySelector('#staff_name');
        if (staffSelect) {
          const opts = Array.from(staffSelect.options).map(o => ({ value: o.value, label: o.text }));
          setStaffOptions(opts);
        }
      })
      .catch(err => console.error("Could not fetch staff options", err));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { label: 'S.No' },
    { label: 'User Name' },
    { label: 'Entry Date' },
    { label: 'Login Time' },
    { label: 'Logout Time' },
    { label: 'User Type' },
    { label: 'Total Worked Hours' },
    { 
      label: 'View',
      className: 'text-center',
      render: (val, row) => {
        if (!val || val === '') return null;
        
        // Extract unique_id and entry_date from the onclick event in the legacy PHP string
        // e.g. onclick="get_model_load('123', '2024-01-01')"
        const match = val.match(/get_model_load\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/);
        if (match) {
          return (
            <button 
              className="btn btn-sm btn-ghost-primary waves-effect waves-light" 
              onClick={() => navigate(`/login_history/view?unique_id=${match[1]}&entry_date=${match[2]}`)}
            >
              <i className="ri-eye-line fs-15"></i>
            </button>
          );
        }
        return <span dangerouslySetInnerHTML={{ __html: val }} />;
      }
    }
  ];

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  return (
    <div className="row g-3 mb-3">
      <div className="col-md-12 col-xxl-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Login History Report</h5>
              </div>
            </div>

            {/* Filters */}
            <div className="row mt-2 g-2">
              <div className="col-md-2">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>From Date</label>
                <input type="date" name="from_date" className="form-control form-control-sm" 
                  value={filters.from_date} onChange={handleFilterChange} />
              </div>
              <div className="col-md-2">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>To Date</label>
                <input type="date" name="to_date" className="form-control form-control-sm" 
                  value={filters.to_date} onChange={handleFilterChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Staff Name</label>
                <select name="staff_name" className="form-select form-select-sm" value={filters.staff_name} onChange={handleFilterChange}>
                  {staffOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/login_history/crud.php"
              columns={columns}
              extraParams={extraParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
