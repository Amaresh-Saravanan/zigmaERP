import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

const TODAY = new Date().toISOString().split('T')[0];

// Calculate hours between two HH:MM time strings; handles overnight wrap-around
function calcRunningHours(start, close) {
  if (!start || !close) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  let diff = (ch * 60 + cm) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60; // overnight wrap-around
  return (diff / 60).toFixed(2);
}

export default function OvenProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    starting_time: '',
    closing_time: '',
    running_hours: '',
    diesel_topup: '',
    raw_larvae_process: '',
    dried_larvae_production: '',
    dried_larvae_stock: '',
  });
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchFormData();
  }, [unique_id]);

  // Auto-calculate running_hours from time fields
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      running_hours: calcRunningHours(prev.starting_time, prev.closing_time),
    }));
  }, [formData.starting_time, formData.closing_time]);

  const fetchFormData = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(`folders/oven_process/form.php?unique_id=${unique_id}`, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
      setFormData({
        entry_date:              g('entry_date') || TODAY,
        starting_time:           g('starting_time'),
        closing_time:            g('closing_time'),
        running_hours:           g('running_hours'),
        diesel_topup:            g('diesel_topup'),
        raw_larvae_process:      g('raw_larvae_process'),
        dried_larvae_production: g('dried_larvae_production'),
        dried_larvae_stock:      g('dried_larvae_stock'),
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

      const res = await client.post('folders/oven_process/crud.php', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/oven_process/list');
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
                  Oven Process {unique_id ? 'Update' : 'Create'}
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
                    <input type="date" id="entry_date" name="entry_date" className="form-control"
                      value={formData.entry_date} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="starting_time">Start Time</label>
                    <input type="time" id="starting_time" name="starting_time" className="form-control"
                      value={formData.starting_time} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="closing_time">Close Time</label>
                    <input type="time" id="closing_time" name="closing_time" className="form-control"
                      value={formData.closing_time} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="running_hours">Total Run Hours</label>
                    <input type="number" step="0.01" id="running_hours" name="running_hours" className="form-control"
                      value={formData.running_hours} readOnly required />
                    <small className="text-muted">Auto-calculated (handles overnight)</small>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="diesel_topup">Diesel Top Up (Litres)</label>
                    <input type="number" step="0.01" id="diesel_topup" name="diesel_topup" className="form-control"
                      value={formData.diesel_topup} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="raw_larvae_process">Total Raw (Live Larvae) Process (Kg)</label>
                    <input type="number" step="0.01" id="raw_larvae_process" name="raw_larvae_process" className="form-control"
                      value={formData.raw_larvae_process} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="dried_larvae_production">Dried Larvae Production (Kg)</label>
                    <input type="number" step="0.01" id="dried_larvae_production" name="dried_larvae_production" className="form-control"
                      value={formData.dried_larvae_production} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="dried_larvae_stock">Dried Larvae Stock (Kg)</label>
                    <input type="number" step="0.01" id="dried_larvae_stock" name="dried_larvae_stock" className="form-control"
                      value={formData.dried_larvae_stock} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="test_file">Image Upload</label>
                    <input type="file" id="test_file" className="form-control" multiple accept="image/*"
                      onChange={e => setFiles(Array.from(e.target.files))} />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-md-12 text-end">
                    <button type="button" onClick={() => navigate('/oven_process/list')} className="btn btn-danger me-2">
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
