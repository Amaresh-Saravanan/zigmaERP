import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DCList() {
  const navigate = useNavigate();
  // No backend exists yet, so we use empty local state
  const [dcs, setDcs] = useState([]);

  return (
    <div className="row g-3 mb-3">
      <div className="col-md-12 col-xxl-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Delivery Challan List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/dc/form')} className="btn btn-primary btn-sm">
                  Create New DC
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>DC Number</th>
                    <th>Challan Date</th>
                    <th>Bill-To Company</th>
                    <th>Challan Type</th>
                    <th>Grand Total</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dcs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No Delivery Challans found. <br/>
                        <button onClick={() => navigate('/dc/form')} className="btn btn-link mt-2">
                          Create your first DC
                        </button>
                      </td>
                    </tr>
                  ) : (
                    dcs.map(dc => (
                      <tr key={dc.id}>
                        <td>{dc.dcNumber}</td>
                        <td>{dc.challanDate}</td>
                        <td>{dc.billTo}</td>
                        <td>{dc.challanType}</td>
                        <td>₹{dc.grandTotal}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-ghost-primary"><i className="ri-printer-line"></i></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
