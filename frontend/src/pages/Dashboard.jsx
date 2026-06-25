import React, { useState } from 'react';
import Chart from 'react-apexcharts';

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState('2026-06');

  // Mock KPI data
  const kpiData = {
    netWeight: '12,450 kg',
    rejectsWeight: '420 kg',
    unutilizedTrays: '184',
    totalLarvaeQty: '2,890 kg'
  };

  // Chart configuration using ApexCharts
  const chartOptions = {
    chart: {
      id: 'zigma-production-chart',
      toolbar: { show: false }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    },
    colors: ['#0ab39c', '#f7b84b'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      }
    },
    dataLabels: {
      enabled: false
    }
  };

  const chartSeries = [
    {
      name: 'Net Weight (kg)',
      data: [8100, 9200, 10500, 11200, 9800, 12450, 13100]
    },
    {
      name: 'Rejects Weight (kg)',
      data: [350, 410, 480, 510, 390, 420, 460]
    }
  ];

  return (
    <div className="container-fluid py-4">
      {/* Header and Filter */}
      <div className="row mb-4 align-items-center">
        <div className="col-sm-6">
          <h4 className="text-primary font-weight-bold">Production Dashboard</h4>
          <p className="text-muted mb-0">Overview of Zigma ERP manufacturing and inventory status.</p>
        </div>
        <div className="col-sm-6 text-sm-end mt-2 mt-sm-0">
          <div className="d-inline-flex align-items-center">
            <label htmlFor="month-select" className="me-2 mb-0 font-weight-medium">Month:</label>
            <input
              type="month"
              id="month-select"
              className="form-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-muted text-uppercase mb-2 font-weight-bold">Net Production Weight</h6>
                  <h3 className="mb-0 text-success">{kpiData.netWeight}</h3>
                </div>
                <div className="avatar-sm rounded-circle bg-light-success p-2">
                  <i className="ri-scales-3-line text-success fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-muted text-uppercase mb-2 font-weight-bold">Rejects Weight</h6>
                  <h3 className="mb-0 text-warning">{kpiData.rejectsWeight}</h3>
                </div>
                <div className="avatar-sm rounded-circle bg-light-warning p-2">
                  <i className="ri-delete-bin-line text-warning fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-muted text-uppercase mb-2 font-weight-bold">Unutilized Trays</h6>
                  <h3 className="mb-0 text-primary">{kpiData.unutilizedTrays}</h3>
                </div>
                <div className="avatar-sm rounded-circle bg-light-primary p-2">
                  <i className="ri-checkbox-multiple-blank-line text-primary fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-info">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-muted text-uppercase mb-2 font-weight-bold">Total Larvae Inflow</h6>
                  <h3 className="mb-0 text-info">{kpiData.totalLarvaeQty}</h3>
                </div>
                <div className="avatar-sm rounded-circle bg-light-info p-2">
                  <i className="ri-temp-hot-line text-info fs-24"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Chart */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="card-title mb-0 font-weight-bold text-dark">Monthly Weight Analysis</h5>
            </div>
            <div className="card-body">
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={350}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
