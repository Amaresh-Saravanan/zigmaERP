import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import DataTable from '../../components/DataTable';

const TODAY = new Date().toISOString().split('T')[0];
const FIRST_OF_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

export default function PitStatusReportList() {
  const [filters, setFilters] = useState({ 
    from_date: FIRST_OF_MONTH, 
    to_date: TODAY, 
    pit_id: '', 
    harvest_comp: '' 
  });
  
  const [pitOptions, setPitOptions] = useState([]);
  const [harvestOptions, setHarvestOptions] = useState([]);

  useEffect(() => {
    // Fetch dropdown options from PHP via DOM parsing
    client.get('folders/pit_status_report/list.php', { responseType: 'text' })
      .then(res => {
        const doc = new DOMParser().parseFromString(res.data, 'text/html');
        
        const pitSelect = doc.querySelector('#pit_id');
        if (pitSelect) {
          setPitOptions(Array.from(pitSelect.options).map(o => ({ value: o.value, label: o.text })));
        }

        const harvestSelect = doc.querySelector('#harvest_comp');
        if (harvestSelect) {
          setHarvestOptions(Array.from(harvestSelect.options).map(o => ({ value: o.value, label: o.text })));
        }
      })
      .catch(err => console.error("Could not fetch filter options", err));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExportExcel = () => {
    const { from_date, to_date, pit_id, harvest_comp } = filters;
    window.location.href = `folders/pit_status_report/overall_excel.php?from_date=${from_date}&to_date=${to_date}&pit_id=${pit_id}&harvest_comp=${harvest_comp}`;
  };

  const columns = [
    { label: 'S.No' },
    { label: 'Pit Number' },
    { label: 'Batch Id' },
    { label: 'Process Start / End Date', render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> },
    { label: 'Baby Larvae added', render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> },
    { label: 'Feeding Qty(Tons)' },
    { label: 'Tippi Qty(Kg)' },
    { label: 'Qty of Live Larvae(kg)' },
    { label: 'Manure(-4mm/+4mm)/Rejects(Kg)', render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> },
    { 
      label: 'Harvest Status',
      render: (val) => {
        if (!val) return null;
        if (val.includes('Progressing')) {
          return <span className="badge bg-danger">Progressing</span>;
        } else if (val.includes('Completed')) {
          return <span className="badge bg-success">Completed</span>;
        }
        return <span dangerouslySetInnerHTML={{ __html: val }} />;
      }
    },
    { 
      label: 'View', 
      className: 'text-center',
      render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> 
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
                <h5 className="d-flex align-items-center">Pit Status Report List</h5>
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
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Pit Number</label>
                <select name="pit_id" className="form-select form-select-sm" value={filters.pit_id} onChange={handleFilterChange}>
                  {pitOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label mb-0" style={{fontSize: '12px'}}>Harvest Status</label>
                <select name="harvest_comp" className="form-select form-select-sm" value={filters.harvest_comp} onChange={handleFilterChange}>
                  {harvestOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-2 align-self-end text-end">
                <button 
                  type="button" 
                  className="btn btn-success btn-sm waves-effect waves-light" 
                  onClick={handleExportExcel}
                  title="Log Sheet Export"
                >
                  <i className="ri-file-excel-2-line me-1"></i> Excel Export
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/pit_status_report/crud.php"
              columns={columns}
              extraParams={extraParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
