import React from 'react';
import Chart from 'react-apexcharts';

export default function OverallStatusChart({ data }) {
  if (!data) return null;

  const labels = [
    'Inward (mt)', 
    'Inward Rejects (mt)', 
    'Organic Waste (mt)', 
    'Egg Purchasing (kg)', 
    'Egg Hatching (kg)', 
    'Larvae Harvested (mt)', 
    'Manure (mt)', 
    'Rejects (mt)'
  ];
  
  const series = [
    data.inward || 0,
    data.inward_rejects || 0,
    data.organic_waste || 0,
    data.egg_purchasing || 0,
    data.egg_hatching || 0,
    data.larvae_harvested || 0,
    data.manure || 0,
    data.processing_rejects || 0
  ];

  const colors = ['#00008B', '#E89B9B', '#999900', '#008000', '#ff69b4', '#808080', '#00BFFF', '#FF8C00'];

  const options = {
    chart: { type: 'donut', height: 350 },
    labels: labels,
    colors: colors,
    legend: { show: false },
    dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + "%" }
  };

  return (
    <div className="card card-height-100">
      <div className="card-header align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">Overall Status</h4>
      </div>
      <div className="card-body">
        <Chart options={options} series={series} type="donut" height={250} />
        
        <div className="table-responsive mt-3">
          <table className="table table-borderless table-sm table-centered align-middle table-nowrap mb-0">
            <tbody className="border-0">
              {labels.map((label, i) => (
                <tr key={i}>
                  <td>
                    <h4 className="text-truncate fs-14 fs-medium mb-0">
                      <i className="ri-stop-fill align-middle fs-18 me-1" style={{ color: colors[i] }}></i>
                      {label.split(' (')[0]}
                    </h4>
                  </td>
                  <td className="text-end">
                    <p className="fw-medium fs-12 mb-0" style={{ color: colors[i] }}>
                      {series[i]} {label.split(' ')[label.split(' ').length - 1]}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
