import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ORG_STATUS_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: '1', label: 'Organic Waste Added' },
  { value: '2', label: 'Baby Larvae Added' },
  { value: '3', label: 'Aeration Process' },
  { value: '4', label: 'Measurement' },
  { value: '5', label: 'Harvesting' },
  { value: '7', label: 'Tippi' },
];

const STATUS_BADGES = {
  completed: <span className="badge bg-success">Completed</span>,
  pending: <span className="badge bg-warning text-dark">Pending</span>,
};

// ponytail: rewired from PHP crud.php to Django REST endpoint
export default function PitStatusReportList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    from_date: FIRST_OF_MONTH,
    to_date: TODAY,
    pit_id: '',
    harvest_comp: '',
    org_status: '',
  });

  const [pitOptions, setPitOptions] = useState([]);

  useEffect(() => {
    djangoClient.get('/pits', { params: { page_size: 100 } })
      .then(res => {
        const pits = res.data.data.results || [];
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

  const handleView = (batchId) => {
    navigate(`/pit_status_report/print?batch_id=${encodeURIComponent(batchId)}`);
  };

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Pit Number', key: 'pit_name' },
    { label: 'Batch Id', key: 'batch_id' },
    { label: 'Start / End Date', key: 'process_dates' },
    { label: 'Days', key: 'tot_days' },
    { label: 'Egg Added (g)', key: 'egg_add' },
    { label: 'Baby Larvae (kg)', key: 'larvae_added' },
    { label: 'Feed (Tons)', key: 'feed_qty' },
    { label: 'Tippi (Kg)', key: 'tippi_qty' },
    { label: 'Live Larvae (Kg)', key: 'larvae_harvested' },
    { label: '-4mm / +4mm / Rejects (Kg)', key: 'manure_rejects' },
    { label: 'In Temp', key: 'in_temp_avg' },
    { label: 'Out Temp', key: 'out_temp_avg' },
    { label: 'In Humi', key: 'in_humi_avg' },
    { label: 'Out Humi', key: 'out_humi_avg' },
    {
      label: 'Harvest',
      key: 'harvest_status',
      render: (val) => STATUS_BADGES[val] || val,
    },
    {
      label: 'View',
      key: 'batch_id',
      render: (val) => (
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleView(val)}
          title="Print Report"
        >
          <i className="ri-printer-line"></i>
        </button>
      ),
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
              <div className="col-md-2">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Pit Number</label>
                <select name="pit_id" className="form-select form-select-sm" value={filters.pit_id} onChange={handleFilterChange}>
                  {pitOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Status Type</label>
                <select name="org_status" className="form-select form-select-sm" value={filters.org_status} onChange={handleFilterChange}>
                  {ORG_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Harvest Status</label>
                <select name="harvest_comp" className="form-select form-select-sm" value={filters.harvest_comp} onChange={handleFilterChange}>
                  {HARVEST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
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
              showExportButtons
              exportTitle="Pit Status Report"
              exportFilename="pit_status_report"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
