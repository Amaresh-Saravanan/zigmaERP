import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import useAuth from '../../hooks/useAuth';

const TODAY = new Date().toISOString().split('T')[0];

export default function MaterialReceivedForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.userType === '66604f07ae42a24843';

  const [formData, setFormData] = useState({
    date: TODAY,
    supplier_name: '',
    item_name: '',
    qty: '',
    unit1: '', // backend needs unit1 for the ID
    unit_display: '',
    invoice_date: '',
    invoice_no: '',
    label: '',
  });
  
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/material_received/form.php?unique_id=${unique_id}`
        : `folders/material_received/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      
      const suppSelect = doc.querySelector('#supplier_name');
      if (suppSelect) setSupplierOptions(Array.from(suppSelect.options).map(o => ({ value: o.value, label: o.text })));
      
      const itemSelect = doc.querySelector('#item_name');
      if (itemSelect) setItemOptions(Array.from(itemSelect.options).map(o => ({ value: o.value, label: o.text })));

      if (unique_id) {
        const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
        setFormData({
          date:          g('date') || TODAY,
          supplier_name: g('supplier_name'),
          item_name:     g('item_name'),
          qty:           g('qty'),
          unit1:         g('unit1'), 
          unit_display:  doc.querySelector('#unit')?.value ?? '',
          invoice_date:  g('invoice_date'),
          invoice_no:    g('invoice_no'),
          label:         g('label'),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'supplier_name') {
      if (!value) {
        setFormData(prev => ({ ...prev, label: '' }));
      } else {
        try {
          const payload = new URLSearchParams({ action: 'get_label_name', supplier_name: value });
          const res = await client.post('folders/material_received/crud.php', payload);
          if (res.data?.label) setFormData(prev => ({ ...prev, label: res.data.label.trim() }));
        } catch (err) {
          console.error('Error fetching label', err);
        }
      }
    }

    if (name === 'item_name') {
      if (!value) {
        setFormData(prev => ({ ...prev, unit1: '', unit_display: '' }));
      } else {
        try {
          const payload = new URLSearchParams({ action: 'unit', item_name: value });
          const res = await client.post('folders/material_received/crud.php', payload);
          if (res.data) {
            setFormData(prev => ({ ...prev, unit1: res.data.unit1, unit_display: res.data.unit }));
          }
        } catch (err) {
          console.error('Error fetching unit', err);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('action', 'createupdate');
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== 'unit_display') fd.append(k, v);
      });
      if (unique_id) fd.append('unique_id', unique_id);
      files.forEach(f => fd.append('test_file[]', f));

      const res = await client.post('folders/material_received/crud.php', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Handle the "already" exists case
      if (res.data?.msg === 'already') {
        alert('This supplier and item combination already exists!');
        return;
      }
      
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/material_received/list');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  Material Received {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>

          <div className="card-body">
            {isLoading && !supplierOptions.length ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="date">Entry Date</label>
                    <input type="date" id="date" name="date" className="form-control"
                      value={formData.date} onChange={handleChange} required readOnly={!isAdmin} />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="supplier_name">Supplier Name</label>
                    <select id="supplier_name" name="supplier_name" className="form-control"
                      value={formData.supplier_name} onChange={handleChange} required>
                      {supplierOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="item_name">Item Name</label>
                    <select id="item_name" name="item_name" className="form-control"
                      value={formData.item_name} onChange={handleChange} required>
                      {itemOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="qty">Qty</label>
                    <input type="number" step="0.01" min="1" id="qty" name="qty" className="form-control"
                      value={formData.qty} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="unit_display">Unit</label>
                    <input type="text" id="unit_display" className="form-control"
                      value={formData.unit_display} readOnly required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="invoice_date">Invoice Date</label>
                    <input type="date" id="invoice_date" name="invoice_date" className="form-control"
                      value={formData.invoice_date} onChange={handleChange} />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="invoice_no">Invoice Number</label>
                    <input type="text" id="invoice_no" name="invoice_no" className="form-control"
                      value={formData.invoice_no} onChange={handleChange} />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="test_file">Invoice Image Upload</label>
                    <input type="file" id="test_file" className="form-control" multiple
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                      onChange={e => setFiles(Array.from(e.target.files))} />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <button type="button" onClick={() => navigate('/material_received/list')} className="btn btn-danger me-2">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success" disabled={isLoading}>
                      {isLoading ? 'Saving...' : unique_id ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
