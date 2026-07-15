import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';

const fmt = (w) => w != null ? Number(w).toFixed(3) : '0.000';

export default function RejectsPrintDetail() {
  const [searchParams] = useSearchParams();
  const ticketNo = searchParams.get('ticket_no');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketNo) { setError('No ticket number provided.'); setLoading(false); return; }
    djangoClient.get('/rejects-print-detail', { params: { ticket_no: ticketNo } })
      .then(res => { if (res.data?.data) setData(res.data.data); else setError('No data found.'); })
      .catch(() => setError('Failed to load ticket.'))
      .finally(() => setLoading(false));
  }, [ticketNo]);

  const handlePrint = () => window.print();

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return null;

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center no-print">
            <h5 className="mb-0">Weigh Bridge Receipt — {data.ticket_no}</h5>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <i className="ri-printer-line me-1"></i> Print
            </button>
          </div>
          <div className="card-body">
            {/* Company Header */}
            <div className="text-center mb-3">
              <h4 className="fw-bold text-decoration-underline">Kochi Black Soldier Fly Project</h4>
              <p className="mb-0 fw-bold" style={{ fontSize: '1.1rem' }}>Global Environ Solutions Private Limited</p>
            </div>

            {/* Ticket Info */}
            <table className="table table-sm table-bordered mb-3" style={{ maxWidth: 850, margin: '0 auto' }}>
              <tbody>
                <tr>
                  <td style={{ width: 160 }}>Ticket Number</td>
                  <td className="fw-bold">{data.ticket_no}</td>
                  <td style={{ width: 137 }}>Ticket Date</td>
                  <td className="fw-bold">{data.date}</td>
                </tr>
                <tr>
                  <td>Material</td>
                  <td>Segregated Organic wet waste</td>
                  <td>Vehicle Number</td>
                  <td className="fw-bold">{data.vehicle_no}</td>
                </tr>
              </tbody>
            </table>

            {/* Weight Table */}
            <table className="table table-sm table-bordered mb-3" style={{ maxWidth: 850, margin: '0 auto' }}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Gross (Tons)</th>
                  <th>Tare Weight (Tons)</th>
                  <th>Net Weight (Tons)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Segregated Organic wet waste</td>
                  <td className="text-center fw-bold">{fmt(data.loaded_weight)}</td>
                  <td className="text-center fw-bold">{fmt(data.empty_weight)}</td>
                  <td className="text-center fw-bold">{fmt(data.net_weight)}</td>
                </tr>
              </tbody>
            </table>

            {/* Camera Images from Weighment Portal */}
            {data.cam_urls && data.cam_urls.length > 0 && (
              <table className="table table-sm table-bordered mb-3" style={{ maxWidth: 850, margin: '0 auto' }}>
                <tbody>
                  <tr>
                    <td colSpan="2" className="text-center fw-bold border-top border-bottom">
                      Empty<br />Date: {data.empty_weight_date} &nbsp; Time: {data.empty_weight_time}
                    </td>
                    <td colSpan="2" className="text-center fw-bold border-top border-bottom">
                      Loaded<br />Date: {data.load_weight_date} &nbsp; Time: {data.load_weight_time}
                    </td>
                  </tr>
                  <tr>
                    {data.cam_urls.map((url, i) => (
                      <td key={i} className="text-center" style={{ width: '25%' }}>
                        <img src={url} width="200" height="180" alt={`cam${i + 1}`} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}

            {/* Uploaded Images */}
            {data.uploaded_images && data.uploaded_images.length > 0 && (
              <div className="mt-4">
                <h6 className="text-center fw-bold">Uploaded Images — {data.ticket_no}</h6>
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  {data.uploaded_images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer">
                      <img src={img} alt="uploaded" style={{ maxWidth: 200, maxHeight: 200, objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="text-end mt-3" style={{ maxWidth: 850, margin: '0 auto' }}>
              <span className="fw-bold">Weight Bridge In-charge</span>
            </div>
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
