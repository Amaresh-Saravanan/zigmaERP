import React, { useState, useEffect } from 'react';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import DataTable from '../../components/DataTable';

const TODAY = new Date().toISOString().split('T')[0];
const FIRST_OF_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

const STATUS_BADGES = {
  completed: <span className="badge bg-success">Completed</span>,
  progressing: <span className="badge bg-danger">Progressing</span>,
  pending: <span className="badge bg-warning text-dark">Pending</span>,
};

// ponytail: rewired from PHP crud.php to Django REST endpoint
export default function EggProcessReportList() {
  const [filters, setFilters] = useState({
    from_date: FIRST_OF_MONTH,
    to_date: TODAY,
    batch_id: '',
    supplier_name: '',
  });

  const [batchOptions, setBatchOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);

  useEffect(() => {
    // Load dropdown options from Django endpoints
    djangoClient.get('/material-received', { params: { page_size: 100 } })
      .then(res => {
        const batches = res.data.data.results || [];
        setBatchOptions([
          { value: '', label: 'All Batches' },
          ...batches.map(b => ({ value: b.unique_id, label: b.batch_id })),
        ]);
      })
      .catch(err => console.error('Could not fetch batch options', err));

    djangoClient.get('/suppliers', { params: { page_size: 100 } })
      .then(res => {
        const suppliers = res.data.data.results || [];
        setSupplierOptions([
          { value: '', label: 'All Suppliers' },
          ...suppliers.map(s => ({ value: s.supplier_name, label: s.supplier_name })),
        ]);
      })
      .catch(err => console.error('Could not fetch supplier options', err));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Hatching Start / End Date', key: 'hatching_dates' },
    { label: 'Batch ID', key: 'batch_id' },
    { label: 'Egg Qty (g)', key: 'egg_qty' },
    { label: 'Tray Utilized', key: 'tray_utilized' },
    { label: 'Add On Details', key: 'addon_details' },
    { label: 'Egg Cycle (days)', key: 'egg_cycle' },
    { label: 'Pit Number', key: 'pit_names' },
    { label: 'Baby Larvae Qty', key: 'larvae_qty' },
    {
      label: 'Egg Hatching Status',
      key: 'hatching_status',
      render: (val) => STATUS_BADGES[val] || val,
    },
    { label: 'Invoice No', key: 'invoice_image' },
    { label: 'Entry Person', key: 'entry_person' },
  ];

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Egg Process Report List</h5>
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
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Batch Id</label>
                <select name="batch_id" className="form-select form-select-sm" value={filters.batch_id} onChange={handleFilterChange}>
                  {batchOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Supplier Name</label>
                <select name="supplier_name" className="form-select form-select-sm" value={filters.supplier_name} onChange={handleFilterChange}>
                  {supplierOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/egg-process-report"
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
