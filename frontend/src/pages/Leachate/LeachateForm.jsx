import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export default function LeachateForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    qty_leachate: '',
    remarks: '',
  });
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchFormData();
  }, [unique_id]);

  const fetchFormData = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(`folders/leachate/form.php?unique_id=${unique_id}`, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
      setFormData({
        entry_date:    g('entry_date') || TODAY,
        qty_leachate:  g('qty_leachate'),
        remarks:       g('remarks'),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('action', 'createupdate');
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (unique_id) fd.append('unique_id', unique_id);
      files.forEach(f => fd.append('test_file[]', f));

      const res = await client.post('folders/leachate/crud.php', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/leachate/list');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-md-12 col-xxl-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  Leachate {unique_id ? 'Update' : 'Create'}
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
                    <label htmlFor="entry_date">Entry Date</label>
                    <input type="date" id="entry_date" name="entry_date" className="form-control"
                      value={formData.entry_date} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="qty_leachate">Qty Leachate(L)</label>
                    <input type="number" step="0.01" id="qty_leachate" name="qty_leachate" className="form-control"
                      value={formData.qty_leachate} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="test_file">Bill Copy</label>
                    <input type="file" id="test_file" className="form-control" multiple
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                      onChange={e => setFiles(Array.from(e.target.files))} required={!unique_id} />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="remarks">Remarks</label>
                    <input type="text" id="remarks" name="remarks" className="form-control"
                      value={formData.remarks} onChange={handleChange} />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-md-12 text-end">
                    <button type="button" onClick={() => navigate('/leachate/list')} className="btn btn-danger me-2">
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
