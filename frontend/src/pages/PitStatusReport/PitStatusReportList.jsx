import React, { useState, useEffect } from 'react';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import DataTable from '../../components/DataTable';

const TODAY = new Date().toISOString().split('T')[0];
const FIRST_OF_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

const HARVEST_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_BADGES = {
  completed: <span className="badge bg-success">Completed</span>,
  pending: <span className="badge bg-warning text-dark">Pending</span>,
};

// ponytail: rewired from PHP crud.php to Django REST endpoint
export default function PitStatusReportList() {
  const [filters, setFilters] = useState({
    from_date: FIRST_OF_MONTH,
    to_date: TODAY,
    pit_id: '',
    harvest_comp: '',
  });

  const [pitOptions, setPitOptions] = useState([]);

  useEffect(() => {
    djangoClient.get('/pits', { params: { page_size: 100 } })
      .then(res => {
        const pits = res.data.results || [];
        setPitOptions([
          { value: '', label: 'All Pits' },
          ...pits.map(p => ({ value: p.unique_id, label: p.pit_name })),
        ]);
      })
      .catch(err => console.error('Could not fetch pit options', err));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExportExcel = async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await djangoClient.get('/pit-status-report', {
        params: { ...params, format: 'excel' },
        responseType: 'blob',
      });
      // ponytail: trigger download from blob
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `pit_status_report_${filters.from_date}_${filters.to_date}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel export error', err);
      alert('Excel export not yet available');
    }
  };

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Pit Number', key: 'pit_name' },
    { label: 'Batch Id', key: 'batch_id' },
    { label: 'Process Start / End Date', key: 'process_dates' },
    { label: 'Baby Larvae Added', key: 'baby_larvae' },
    { label: 'Feeding Qty (Tons)', key: 'feed_qty' },
    { label: 'Tippi Qty (Kg)', key: 'tippi_qty' },
    { label: 'Qty of Live Larvae (kg)', key: 'larvae_harvested' },
    { label: 'Manure(-4mm/+4mm)/Rejects(Kg)', key: 'manure_rejects' },
    {
      label: 'Harvest Status',
      key: 'harvest_status',
      render: (val) => STATUS_BADGES[val] || val,
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
                <h5 className="d-flex align-items-center">Pit Status Report List</h5>
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
              <div className="col-md-3">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Pit Number</label>
                <select name="pit_id" className="form-select form-select-sm" value={filters.pit_id} onChange={handleFilterChange}>
                  {pitOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Harvest Status</label>
                <select name="harvest_comp" className="form-select form-select-sm" value={filters.harvest_comp} onChange={handleFilterChange}>
                  {HARVEST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-2 align-self-end text-end">
                <button
                  type="button"
                  className="btn btn-success btn-sm waves-effect waves-light"
                  onClick={handleExportExcel}
                  title="Excel Export"
                >
                  <i className="ri-file-excel-2-line me-1"></i> Excel Export
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/pit-status-report"
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
