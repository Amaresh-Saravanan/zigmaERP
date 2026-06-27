import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

const TYPE_OPTIONS = [{ value: '1', label: 'Input' }, { value: '2', label: 'Output' }];
const METHOD_OPTIONS = [{ value: '1', label: 'Solar' }, { value: '2', label: 'Electric' }];

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const CURRENT_DATETIME = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

export default function DryProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: CURRENT_DATETIME,
    type: '1',
    drying_method: '1',
    quantity: '',
    qty_manure: '',
  });
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchFormData();
  }, [unique_id]);

  const fetchFormData = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(`folders/dry_process/form.php?unique_id=${unique_id}`, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
      setFormData({
        entry_date:    g('entry_date') || CURRENT_DATETIME,
        type:          g('type') || '1',
        drying_method: g('drying_method') || '1',
        quantity:      g('quantity'),
        qty_manure:    g('qty_manure'),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'type' && value === '1') {
        next.qty_manure = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('action', 'createupdate');
      Object.entries(formData).forEach(([k, v]) => {
        // If it's Input, do not send qty_manure or send empty
        if (k === 'qty_manure' && formData.type !== '2') return;
        fd.append(k, v);
      });
      if (unique_id) fd.append('unique_id', unique_id);
      files.forEach(f => fd.append('test_file[]', f));

      const res = await client.post('folders/dry_process/crud.php', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/dry_process/list');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showQtyManure = formData.type === '2';

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  Dry Process {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>

          <div className="card-body">
            {isLoading && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="entry_date">Date</label>
                    <input type="datetime-local" id="entry_date" name="entry_date" className="form-control"
                      value={formData.entry_date} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="type">Type</label>
                    <select id="type" name="type" className="form-control"
                      value={formData.type} onChange={handleChange} required>
                      {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="drying_method">Drying Method</label>
                    <select id="drying_method" name="drying_method" className="form-control"
                      value={formData.drying_method} onChange={handleChange} required>
                      {METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="quantity">Quantity(kg)</label>
                    <input type="number" step="0.01" min="1" id="quantity" name="quantity" className="form-control"
                      value={formData.quantity} onChange={handleChange} required />
                  </div>

                  {showQtyManure && (
                    <div className="col-md-3 mb-3">
                      <label htmlFor="qty_manure">Qty Manure</label>
                      <input type="number" step="0.01" id="qty_manure" name="qty_manure" className="form-control"
                        value={formData.qty_manure} onChange={handleChange} />
                    </div>
                  )}

                  <div className="col-md-3 mb-3">
                    <label htmlFor="test_file">Image Upload</label>
                    <input type="file" id="test_file" className="form-control" multiple
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                      onChange={e => setFiles(Array.from(e.target.files))} />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <button type="button" onClick={() => navigate('/dry_process/list')} className="btn btn-danger me-2">
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
