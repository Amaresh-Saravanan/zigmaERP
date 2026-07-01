import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import DateInput from '../../components/DateInput';

const TODAY = new Date().toISOString().split('T')[0];
const FIRST_OF_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

export default function RejectsReportList() {
  const [filters, setFilters] = useState({ 
    from_date: FIRST_OF_MONTH, 
    to_date: TODAY
  });
  
  useEffect(() => {
    // Define global functions for legacy inline onclick handlers from PHP
    window.new_external_window_print = function(e, url, ticket) {
      e.preventDefault();
      window.open(`${url}?ticket_no=${ticket}`, '_blank', 'height=550,width=950,resizable=no,left=200,top=150');
    };

    window.new_external_window_upload = function(e, url, ticket) {
      e.preventDefault();
      window.open(`${url}?ticket_no=${ticket}`, '_blank', 'height=550,width=950,resizable=no,left=200,top=150');
    };

    return () => {
      delete window.new_external_window_print;
      delete window.new_external_window_upload;
    };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePrintOverall = () => {
    const { from_date, to_date } = filters;
    if (from_date && to_date) {
      window.open(
        `folders/rejects_report/print_overall.php?from_date=${from_date}&to_date=${to_date}`,
        '_blank',
        'height=550,width=950,resizable=no,left=200,top=150'
      );
    } else {
      alert("Please select both From Date and To Date");
    }
  };

  const columns = [
    { label: 'S.No' },
    { label: 'Ticket No' },
    { label: 'Vehicle No' },
    { label: 'Vendor' },
    { label: 'Date' },
    { label: 'Time' },
    { label: 'Empty Weight(Tons)' },
    { label: 'Loaded Weight(Tons)' },
    { label: 'Net Weight(Tons)' },
    { 
      label: 'Print', 
      className: 'text-center',
      render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> 
    },
    { 
      label: 'Uploaded Image', 
      className: 'text-center',
      render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} /> 
    }
  ];

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
              <div className="col-md-8 align-self-end text-end">
                <button 
                  type="button" 
                  className="btn btn-success btn-sm waves-effect waves-light" 
                  onClick={handlePrintOverall}
                >
                  <i className="ri-printer-line me-1"></i> Print Overall
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/rejects_report/crud.php"
              columns={columns}
              extraParams={filters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
