import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';

const STATUS_LABELS = {
  '1': 'Organic Waste Added',
  '2': 'Baby Larvae Added',
  '3': 'Aeration Process',
  '4': 'Measurement',
  '5': 'Harvesting',
  '7': 'Tippi',
};

export default function PitStatusPrintView() {
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get('batch_id');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!batchId) {
      setError('No batch ID provided.');
      setLoading(false);
      return;
    }
    djangoClient.get('/pit-status-detail', { params: { batch_id: batchId } })
      .then(res => {
        if (res.data?.data) setData(res.data.data);
        else setError('No data found.');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load report.');
      })
      .finally(() => setLoading(false));
  }, [batchId]);

  const handlePrint = () => window.print();

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return null;

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center no-print">
            <h5 className="mb-0">Pit Status Report — {data.batch_id}</h5>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <i className="ri-printer-line me-1"></i> Print
            </button>
          </div>
          <div className="card-body">
            {/* Header */}
            <div className="text-center mb-4">
              <h4 className="fw-bold">Pit Status Report</h4>
              <p className="text-muted mb-0">Batch: {data.batch_id}</p>
            </div>

            {/* Summary */}
            <div className="row mb-4">
              <div className="col-md-6">
                <table className="table table-sm table-bordered mb-0">
                  <tbody>
                    <tr><td className="fw-semibold">Pit Name</td><td>{data.pit_name}</td></tr>
                    <tr><td className="fw-semibold">Batch ID</td><td>{data.batch_id}</td></tr>
                    <tr><td className="fw-semibold">Start Date</td><td>{data.start_date}</td></tr>
                    <tr><td className="fw-semibold">End Date</td><td>{data.end_date || 'In Progress'}</td></tr>
                    <tr><td className="fw-semibold">Processing Days</td><td>{data.tot_days}</td></tr>
                    <tr><td className="fw-semibold">Harvest Status</td><td>{data.harvest_status}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <table className="table table-sm table-bordered mb-0">
                  <tbody>
                    <tr><td className="fw-semibold">Egg Added (g)</td><td>{data.egg_add}</td></tr>
                    <tr><td className="fw-semibold">Baby Larvae Added (kg)</td><td>{data.larvae_added}</td></tr>
                    <tr><td className="fw-semibold">Feed Qty (Tons)</td><td>{data.feed_qty}</td></tr>
                    <tr><td className="fw-semibold">Live Larvae Harvested (Kg)</td><td>{data.larvae_harvested}</td></tr>
                    <tr><td className="fw-semibold">Manure -4mm / +4mm / 20mm (Kg)</td><td>{data.manure_1} / {data.manure_2} / {data.manure_3}</td></tr>
                    <tr><td className="fw-semibold">Rejects (Kg)</td><td>{data.rejects}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Temp & Humidity */}
            <div className="row mb-4">
              <div className="col-md-6">
                <table className="table table-sm table-bordered mb-0">
                  <thead><tr><th colSpan="2" className="bg-light">Temperature &amp; Humidity</th></tr></thead>
                  <tbody>
                    <tr><td className="fw-semibold">Avg Inside Temp</td><td>{data.in_temp_avg}</td></tr>
                    <tr><td className="fw-semibold">Avg Outside Temp</td><td>{data.out_temp_avg}</td></tr>
                    <tr><td className="fw-semibold">Avg Inside Humidity</td><td>{data.in_humi_avg}</td></tr>
                    <tr><td className="fw-semibold">Avg Outside Humidity</td><td>{data.out_humi_avg}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail Entries */}
            {data.entries && data.entries.length > 0 && (
              <>
                <h6 className="fw-bold mt-4 mb-3">Entry Details</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered table-striped">
                    <thead className="bg-light">
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th>Feed (T)</th>
                        <th>Larvae In (kg)</th>
                        <th>Temp (S/M/E)</th>
                        <th>Humi (S/M/E)</th>
                        <th>Harvested (Kg)</th>
                        <th>Manure 1</th>
                        <th>Manure 2</th>
                        <th>Rejects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.map((e, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{e.entry_date}</td>
                          <td>{STATUS_LABELS[e.org_status] || e.org_status}</td>
                          <td>{e.notes}</td>
                          <td>{e.feed_qty || '—'}</td>
                          <td>{e.larvae_qty_in || '—'}</td>
                          <td>{e.temp_start != null ? `${e.temp_start} / ${e.temp_mid} / ${e.temp_end}` : '—'}</td>
                          <td>{e.humi_start != null ? `${e.humi_start} / ${e.humi_mid} / ${e.humi_end}` : '—'}</td>
                          <td>{e.larvae_qty || '—'}</td>
                          <td>{e.qty_manure_1 || '—'}</td>
                          <td>{e.qty_manure_2 || '—'}</td>
                          <td>{e.qty_rejets || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .card { border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
