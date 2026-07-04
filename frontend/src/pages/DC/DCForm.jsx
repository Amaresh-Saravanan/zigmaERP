import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DateInput from '../../components/DateInput';

const TODAY = new Date().toISOString().split('T')[0];

function numberToWords(num) {
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Rupees Only';
}

export default function DCForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dcNumber: `BSF/LAR/24-25/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    poDate: TODAY,
    dispatchDate: TODAY,
    challanDate: TODAY,
    poRef: '',
    challanType: 'Supply of Goods',
    billToCompany: '',
    billToAddress: '',
    billToGst: '',
    taxRate: 18,
  });

  const [items, setItems] = useState([
    { id: 1, desc: '', hsn: '', qty: 0, unit: 'Kgs', rate: 0, amount: 0 }
  ]);

  const [totals, setTotals] = useState({
    subTotal: 0,
    tax: 0,
    roundOff: 0,
    grandTotal: 0,
    words: ''
  });

  useEffect(() => {
    let sub = 0;
    items.forEach(item => {
      sub += (item.qty * item.rate);
    });
    
    const tax = sub * (formData.taxRate / 100);
    const totalWithTax = sub + tax;
    const rounded = Math.round(totalWithTax);
    const roundOff = rounded - totalWithTax;

    setTotals({
      subTotal: sub,
      tax: tax,
      roundOff: roundOff.toFixed(2),
      grandTotal: rounded,
      words: numberToWords(rounded)
    });
  }, [items, formData.taxRate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updated.amount = (updated.qty * updated.rate);
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), desc: '', hsn: '', qty: 0, unit: 'Kgs', rate: 0, amount: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Backend not connected yet. This is a local UI mockup. Use "Print" to export.');
  };

  return (
    <div className="row g-3 mb-3">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .d-print-none { display: none !important; }
          .card { border: none !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width print-area">
          <div className="card-header pt-3 pb-2 d-print-none">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  Delivery Challan Creation
                </h5>
              </div>
              <div className="col-auto">
                <button type="button" onClick={handlePrint} className="btn btn-info btn-sm me-2">
                  <i className="ri-printer-line me-1"></i> Print / Export PDF
                </button>
                <button type="button" onClick={() => navigate('/dc/list')} className="btn btn-secondary btn-sm">
                  Back to List
                </button>
              </div>
            </div>
          </div>

          <div className="card-body">
            <form className="was-validated" onSubmit={handleSave} autoComplete="off">
              
              {/* Header Info */}
              <div className="row border-bottom pb-3 mb-3">
                <div className="col-md-6">
                  <h4 className="fw-bold mb-1">Company XYZ Pvt Ltd</h4>
                  <p className="text-muted mb-1" style={{fontSize: '13px'}}>
                    123 Industrial Area, Phase 1<br/>
                    City, State 123456<br/>
                    GSTIN: 33AAAAA0000A1Z5
                  </p>
                </div>
                <div className="col-md-6 text-md-end">
                  <h2 className="text-uppercase text-primary mb-2">Delivery Challan</h2>
                  <h5 className="text-dark">DC #: {formData.dcNumber}</h5>
                </div>
              </div>

              {/* Document Details */}
              <p className="form-section-title">
                <i className="ri-file-list-3-line me-1"></i> Document Details
              </p>
              <div className="row bg-light p-3 rounded mb-4">
                <div className="col-md-3 mb-3">
                  <DateInput
                    id="challanDate"
                    name="challanDate"
                    label="Challan Date"
                    value={formData.challanDate}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="poRef" className="form-label app-form-label">PO Ref #</label>
                  <input type="text" id="poRef" name="poRef" className="form-control form-control-sm"
                    value={formData.poRef} onChange={handleChange} />
                </div>
                <div className="col-md-3 mb-3">
                  <DateInput
                    id="poDate"
                    name="poDate"
                    label="PO Date"
                    value={formData.poDate}
                    onChange={handleChange}
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="challanType" className="form-label app-form-label">Challan Type</label>
                  <select id="challanType" name="challanType" className="form-select form-select-sm"
                    value={formData.challanType} onChange={handleChange} required>
                    <option value="Supply of Goods">Supply of Goods</option>
                    <option value="Supply of Services">Supply of Services</option>
                    <option value="Returnable">Returnable</option>
                    <option value="Job Work">Job Work</option>
                  </select>
                </div>
              </div>

              {/* Bill To */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <p className="form-section-title">
                    <i className="ri-map-pin-2-line me-1"></i> Bill To / Ship To
                  </p>
                  <div className="mb-2">
                    <label htmlFor="billToCompany" className="form-label app-form-label">Company Name</label>
                    <input type="text" id="billToCompany" name="billToCompany" className="form-control form-control-sm"
                      value={formData.billToCompany} onChange={handleChange} required />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="billToAddress" className="form-label app-form-label">Address</label>
                    <textarea id="billToAddress" name="billToAddress" className="form-control form-control-sm" rows="3"
                      value={formData.billToAddress} onChange={handleChange} required></textarea>
                  </div>
                  <div className="mb-2">
                    <label htmlFor="billToGst" className="form-label app-form-label">GSTIN</label>
                    <input type="text" id="billToGst" name="billToGst" className="form-control form-control-sm"
                      value={formData.billToGst} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="table-responsive mb-4">
                <table className="table table-bordered align-middle">
                  <thead className="table-light text-center">
                    <tr>
                      <th width="5%">#</th>
                      <th width="35%">Item Description</th>
                      <th width="15%">HSN/SAC</th>
                      <th width="10%">Qty</th>
                      <th width="10%">Unit</th>
                      <th width="10%">Rate</th>
                      <th width="10%">Amount</th>
                      <th width="5%" className="d-print-none"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="text-center">{index + 1}</td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0" 
                            value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} required placeholder="Item name" />
                        </td>
                        <td>
                          <input type="text" className="form-control form-control-sm border-0" 
                            value={item.hsn} onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)} />
                        </td>
                        <td>
                          <input type="number" step="0.01" className="form-control form-control-sm border-0 text-end" 
                            value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value) || 0)} required />
                        </td>
                        <td>
                          <select className="form-select form-select-sm border-0" 
                            value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}>
                            <option value="Kgs">Kgs</option>
                            <option value="Ltrs">Ltrs</option>
                            <option value="Pcs">Pcs</option>
                            <option value="Tons">Tons</option>
                          </select>
                        </td>
                        <td>
                          <input type="number" step="0.01" className="form-control form-control-sm border-0 text-end" 
                            value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} required />
                        </td>
                        <td className="text-end fw-bold bg-light">
                          {item.amount.toFixed(2)}
                        </td>
                        <td className="text-center d-print-none">
                          <button type="button" onClick={() => removeItem(item.id)} className="btn btn-sm text-danger px-1" disabled={items.length === 1}>
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="d-print-none">
                    <tr>
                      <td colSpan="8">
                        <button type="button" onClick={addItem} className="btn btn-sm btn-soft-primary">
                          <i className="ri-add-line me-1"></i> Add Line Item
                        </button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Totals */}
              <div className="row mb-4">
                <div className="col-md-7">
                  <div className="p-3 bg-light rounded h-100">
                    <h6 className="fw-bold">Amount in Words:</h6>
                    <p className="text-dark fst-italic mb-0">{totals.words}</p>
                  </div>
                </div>
                <div className="col-md-5">
                  <table className="table table-sm table-borderless text-end mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-bold">Sub Total</td>
                        <td width="30%" className="fw-bold">₹{totals.subTotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="d-flex align-items-center justify-content-end">
                          <span className="me-2 text-muted">Tax Rate (%)</span>
                          <input type="number" name="taxRate" className="form-control form-control-sm w-25 text-end d-inline"
                            value={formData.taxRate} onChange={handleChange} />
                        </td>
                        <td>₹{totals.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Rounded Off</td>
                        <td>{totals.roundOff}</td>
                      </tr>
                      <tr className="border-top border-dark">
                        <td className="fw-bold fs-5 text-primary">Grand Total</td>
                        <td className="fw-bold fs-5 text-primary">₹{totals.grandTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="row mt-5 pt-5 d-print-none">
                <div className="col-12 text-end mt-3">
                  <button type="submit" className="btn btn-success">
                    <i className="ri-save-3-line me-1"></i> Save DC Locally
                  </button>
                </div>
              </div>

              {/* Signatures for Print */}
              <div className="row mt-5 pt-5 text-center d-none d-print-flex">
                <div className="col-4">
                  <hr className="w-75 mx-auto" style={{borderTop: '2px solid #000'}} />
                  <p className="fw-bold">Prepared By</p>
                </div>
                <div className="col-4">
                  <hr className="w-75 mx-auto" style={{borderTop: '2px solid #000'}} />
                  <p className="fw-bold">Receiver's Signature</p>
                </div>
                <div className="col-4">
                  <hr className="w-75 mx-auto" style={{borderTop: '2px solid #000'}} />
                  <p className="fw-bold">Authorized Signatory</p>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
