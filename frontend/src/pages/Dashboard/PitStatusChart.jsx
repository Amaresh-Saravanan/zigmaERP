import React from 'react';
import Chart from 'react-apexcharts';

export default function PitStatusChart({ data }) {
  if (!data || !data.categories) return null;

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 3
    },
    plotOptions: {
      bar: { horizontal: true, barHeight: '50%', dataLabels: { position: 'top' } }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        const feed = data.feed_qty[opts.dataPointIndex] || 0;
        return `${val} Days - ${feed} Tons`;
      },
      style: { colors: ['#333'] },
      offsetX: 20
    },
    colors: ['#49c1bf'],
    xaxis: {
      categories: data.categories,
      title: { text: 'Batch Age (days)' }
    },
    yaxis: { title: { text: 'Pit Name' } },
    tooltip: {
      y: {
        formatter: function (val, opts) {
          const feed = data.feed_qty[opts.dataPointIndex] || 0;
          return `${val} Days (${feed} Tons Feed)`;
        }
      }
    }
  };

  const series = [{ name: 'Batch Age', data: data.data }];

  return (
    <div className="card card-big">
      <div className="card-header align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">Pit Status</h4>
      </div>
      <div className="card-body p-0">
        <Chart options={options} series={series} type="bar" height={350} />
      </div>
    </div>
  );
}
