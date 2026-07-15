import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import DateInput from '../../components/DateInput';

const TODAY = new Date().toISOString().split('T')[0];
const FIRST_OF_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

export default function RejectsReportList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    from_date: FIRST_OF_MONTH,
    to_date: TODAY,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = (ticketNo) => {
    window.open(
      `/rejects_report/print?ticket_no=${encodeURIComponent(ticketNo)}`,
      '_blank',
      'height=550,width=950,resizable=no,toolbar=no,location=no,status=no,menubar=no'
    );
  };

  const handleImageUpload = (ticketNo) => {
    navigate(`/rejects_image_upload/form?ticket_no=${encodeURIComponent(ticketNo)}`);
  };

  const handleOverallPrint = () => {
    if (!filters.from_date || !filters.to_date) {
      alert('Please select both From Date and To Date');
      return;
    }
    window.open(
      `/rejects_report/print_overall?from_date=${filters.from_date}&to_date=${filters.to_date}`,
      '_blank',
      'height=550,width=950,resizable=no,toolbar=no,location=no,status=no,menubar=no'
    );
  };

  const columns = [
    { label: 'S.No', sno: true },
    { label: 'Ticket No', key: 'ticket_no' },
    { label: 'Vehicle No', key: 'vehicle_no' },
    { label: 'Vendor', key: 'vendor' },
    { label: 'Date', key: 'date', render: (val) => formatDate(val) },
    { label: 'Time', key: 'time' },
    { label: 'Empty Weight (Tons)', key: 'empty_weight', className: 'text-center' },
    { label: 'Loaded Weight (Tons)', key: 'loaded_weight', className: 'text-center' },
    { label: 'Net Weight (Tons)', key: 'net_weight', className: 'text-center' },
    {
      label: 'Print',
      key: 'ticket_no',
      render: (val) => (
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => handlePrint(val)}
          title="Print Ticket"
        >
          <i className="ri-printer-line"></i>
        </button>
      ),
    },
    {
      label: 'Image',
      key: 'ticket_no',
      render: (val, row) => row.has_image
        ? <span className="badge bg-success-subtle text-success">Uploaded</span>
        : <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleImageUpload(val)}
            title="Upload Image"
          >
            <i className="ri-upload-2-line"></i>
          </button>,
    },
  ];

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Rejects Report List</h5>
              <button
                type="button"
                className="btn btn-success btn-sm waves-effect waves-light"
                onClick={handleOverallPrint}
                title="Print all tickets in date range"
              >
                <i className="ri-printer-line me-1"></i> Overall Print
              </button>
            </div>

            {/* Filters */}
            <div className="row mt-2 g-3">
              <div className="col-md-3">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>From Date</label>
                <DateInput name="from_date" className="form-control form-control-sm"
                  value={filters.from_date} onChange={handleFilterChange} />
              </div>
              <div className="col-md-3">
                <label className="form-label mb-1" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>To Date</label>
                <DateInput name="to_date" className="form-control form-control-sm"
                  value={filters.to_date} onChange={handleFilterChange} />
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              mode="django"
              ajaxUrl="/rejects-report"
              columns={columns}
              extraParams={extraParams}
              showActiveFilter={false}
              showExportButtons
              exportTitle="Rejects Report"
              exportFilename="rejects_report"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
