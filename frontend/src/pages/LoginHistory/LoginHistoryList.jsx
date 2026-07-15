import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DataTable from '../../components/DataTable';
import DateInput from '../../components/DateInput';

const TODAY = new Date().toISOString().split('T')[0];

export default function LoginHistoryList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ from_date: TODAY, to_date: TODAY, staff_name: '' });
  const [staffOptions, setStaffOptions] = useState([]);

  useEffect(() => {
    djangoClient.get('/users', { params: { page_size: 100 } })
      .then(res => {
        const users = res.data.data.results || [];
        setStaffOptions([{ value: '', label: 'All Staff' },
          ...users.map(u => ({ value: u.unique_id, label: u.user_name }))]);
      })
      .catch(err => console.error('Could not fetch staff options', err));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'User Name', key: 'user_name' },
    { label: 'Entry Date', key: 'entry_date' },
    { label: 'Login Time', key: 'login_time' },
    { label: 'Logout Time', key: 'logout_time' },
    { label: 'User Type', key: 'user_type' },
    { label: 'Total Worked Hours', key: 'total_worked_hours' },
    {
      label: 'View',
      className: 'text-center',
      render: (_val, row) => (
        <button
          className="btn btn-sm btn-ghost-primary waves-effect waves-light"
          onClick={() => navigate(`/login_history/view?unique_id=${row.user_id}&entry_date=${row.entry_date}`)}
        >
          <i className="ri-eye-line fs-15"></i>
        </button>
      )
    }
  ];

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Login History Report</h5>
              </div>
            </div>

            {/* Filters */}
            <div className="row mt-2 g-3">
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
              mode="django"
              ajaxUrl="/login-history-report"
              columns={columns}
              extraParams={extraParams}
              showActiveFilter={false}
              showExportButtons={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
