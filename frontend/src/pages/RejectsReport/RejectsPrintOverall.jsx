import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';

const fmt = (w) => w != null ? Number(w).toFixed(3) : '0.000';

function TicketReceipt({ t }) {
  return (
    <div className="card mb-4 print-section">
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
              <td className="fw-bold">{t.ticket_no}</td>
              <td style={{ width: 137 }}>Ticket Date</td>
              <td className="fw-bold">{t.date}</td>
            </tr>
            <tr>
              <td>Material</td>
              <td>Segregated Organic wet waste</td>
              <td>Vehicle Number</td>
              <td className="fw-bold">{t.vehicle_no}</td>
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
              <td className="text-center fw-bold">{fmt(t.loaded_weight)}</td>
              <td className="text-center fw-bold">{fmt(t.empty_weight)}</td>
              <td className="text-center fw-bold">{fmt(t.net_weight)}</td>
            </tr>
          </tbody>
        </table>

        {/* Camera Images */}
        {t.cam_urls && t.cam_urls.length > 0 && (
          <table className="table table-sm table-bordered mb-3" style={{ maxWidth: 850, margin: '0 auto' }}>
            <tbody>
              <tr>
                <td colSpan="2" className="text-center fw-bold border-top border-bottom">
                  Empty<br />Date: {t.empty_weight_date} &nbsp; Time: {t.empty_weight_time}
                </td>
                <td colSpan="2" className="text-center fw-bold border-top border-bottom">
                  Loaded<br />Date: {t.load_weight_date} &nbsp; Time: {t.load_weight_time}
                </td>
              </tr>
              <tr>
                {t.cam_urls.map((url, i) => (
                  <td key={i} className="text-center" style={{ width: '25%' }}>
                    <img src={url} width="200" height="180" alt={`cam${i + 1}`} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}

        {/* Uploaded Images */}
        {t.uploaded_images && t.uploaded_images.length > 0 && (
          <div className="mt-3">
            <h6 className="text-center fw-bold">Images for Ticket Number: {t.ticket_no}</h6>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {t.uploaded_images.map((img, i) => (
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
  );
}

export default function RejectsPrintOverall() {
  const [searchParams] = useSearchParams();
  const fromDate = searchParams.get('from_date');
  const toDate = searchParams.get('to_date');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fromDate || !toDate) { setError('Both from_date and to_date are required.'); setLoading(false); return; }
    djangoClient.get('/rejects-print-overall', { params: { from_date: fromDate, to_date: toDate } })
      .then(res => { setTickets(res.data?.data || []); })
      .catch(() => setError('Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  const handlePrint = () => window.print();

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center no-print">
            <h5 className="mb-0">Rejects Overall Print ({fromDate} to {toDate})</h5>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <i className="ri-printer-line me-1"></i> Print All
            </button>
          </div>
          <div className="card-body">
            {tickets.length === 0 ? (
              <p className="text-center text-muted">No tickets found for the selected date range.</p>
            ) : (
              tickets.map((t, i) => <TicketReceipt key={i} t={t} />)
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .card { border: none !important; box-shadow: none !important; }
          .print-section { page-break-after: always; margin-bottom: 30px; }
        }
      `}</style>
    </div>
  );
}
