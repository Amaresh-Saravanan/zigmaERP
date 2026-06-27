import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import KPICard from './KPICard';
import PitStatusChart from './PitStatusChart';
import TrayStatusWidget from './TrayStatusWidget';
import OverallStatusChart from './OverallStatusChart';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const CURRENT_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

export default function Dashboard() {
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [data, setData] = useState({
    kpi: {},
    overall: {},
    pit_chart: { categories: [], data: [], feed_qty: [], batch_ids: [] },
    tray_status: [],
    unutilized_trays: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [month]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await client.post('folders/dashboard/api.php', new URLSearchParams({ month }));
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openDrillDown = (type) => {
    window.open(`folders/dashboard/organic.php?month=${month}&type=${type}`, '_blank');
  };

  return (
    <div className="container-fluid px-0">
      <div className="row mb-3">
        <div className="col-12 col-md-3 ms-auto">
          <div className="input-group">
            <input 
              type="month" 
              className="form-control" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
            />
            <button 
              type="button" 
              className="btn rounded-end text-white" 
              style={{ backgroundColor: '#1E3A5F' }}
              onClick={fetchDashboardData}
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="card crm-widget mb-4">
            <div className="card-body p-0">
              <div className="row row-cols-xxl-6 row-cols-md-3 row-cols-2 g-0">
                <KPICard title="Inward" value={data.kpi.inward} unit="Metric-Tons" icon="ri-space-ship-line" colorClass="text-muted" onClick={() => openDrillDown('inward')} />
                <KPICard title="Inward Rejects" value={data.kpi.inward_rejects} unit="Metric-Tons" icon="ri-space-ship-line" colorClass="text-muted" onClick={() => openDrillDown('inward-rejects')} />
                <KPICard title="Organic Waste in Pit" value={data.kpi.organic_waste} unit="Metric-Tons" icon="ri-leaf-fill" colorClass="text-success" onClick={() => openDrillDown('organic')} />
                <KPICard title="Egg Purchasing" value={data.kpi.egg_purchasing} unit="Kilo-Gram" icon="ri-outlet-2-line" colorClass="text-primary" onClick={() => openDrillDown('purchasing')} />
                <KPICard title="Egg Hatching" value={data.kpi.egg_hatching} unit="Kilo-Gram" icon="ri-outlet-2-line" colorClass="text-primary" onClick={() => openDrillDown('hatching')} />
                <KPICard title="Larvae Harvested" value={data.kpi.larvae_harvested} unit="Metric-Tons" icon="ri-slack-line" colorClass="text-info" onClick={() => openDrillDown('larvae_harvested')} />
                <KPICard title="Manure" value={data.kpi.manure} unit="Metric-Tons" icon="ri-loader-2-fill" colorClass="text-warning" onClick={() => openDrillDown('manure')} />
                <KPICard title="Processing Rejects" value={data.kpi.processing_rejects} unit="Metric-Tons" icon="ri-uninstall-line" colorClass="text-danger" onClick={() => openDrillDown('processing-rejects')} />
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-xl-8">
              <PitStatusChart data={data.pit_chart} />
            </div>
            <div className="col-xl-4">
              <TrayStatusWidget data={data.tray_status} unutilizedTrays={data.unutilized_trays} />
            </div>
          </div>

          <div className="row mt-4 mb-4">
            <div className="col-xl-4">
              <OverallStatusChart data={data.overall} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
