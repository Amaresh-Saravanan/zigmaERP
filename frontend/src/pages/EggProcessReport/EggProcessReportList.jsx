import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import DateInput from '../../components/DateInput';
import DataTable from '../../components/DataTable';
import DateInput from '../../components/DateInput';

const TODAY = new Date().toISOString().split('T')[0];
const FIRST_OF_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

export default function EggProcessReportList() {
  const [filters, setFilters] = useState({ 
    from_date: FIRST_OF_MONTH, 
    to_date: TODAY, 
    batch_id: '', 
    supplier_name: '' 
  });
  
  const [batchOptions, setBatchOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);

  useEffect(() => {
    // Fetch dropdown options from PHP via DOM parsing
    client.get('folders/egg_process_report/list.php', { responseType: 'text' })
      .then(res => {
        const doc = new DOMParser().parseFromString(res.data, 'text/html');
        
        const batchSelect = doc.querySelector('#batch_id');
        if (batchSelect) {
          setBatchOptions(Array.from(batchSelect.options).map(o => ({ value: o.value, label: o.text })));
        }

        const supplierSelect = doc.querySelector('#supplier_name');
        if (supplierSelect) {
          setSupplierOptions(Array.from(supplierSelect.options).map(o => ({ value: o.value, label: o.text })));
        }
      })
      .catch(err => console.error("Could not fetch filter options", err));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { label: 'S.No' },
    { label: 'Hatching Start / End Date' },
    { label: 'Batch ID' },
    { label: 'Egg Qty (g)' },
    { label: 'Tray Utilized' },
    { label: 'Add On Detials', render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> },
    { label: 'Egg Cycle (days)' },
    { label: 'Pit Number', render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> },
    { label: 'Baby Larvae Qty', render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> },
    { 
      label: 'Invoice Image', 
      render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} />
    },
    { 
      label: 'Egg Hatching Status',
      render: (val) => {
        if (!val) return null;
        if (val.includes('Progressing')) {
          return <span className="badge bg-danger">Progressing</span>;
        } else if (val.includes('Completed')) {
          return <span className="badge bg-success">Completed</span>;
        }
        return <span dangerouslySetInnerHTML={{ __html: val }} />;
      }
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
                <h5 className="d-flex align-items-center">Egg Process Report List</h5>
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
              ajaxUrl="folders/egg_process_report/crud.php"
              columns={columns}
              extraParams={extraParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
