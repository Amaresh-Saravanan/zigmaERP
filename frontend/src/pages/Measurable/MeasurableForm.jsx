import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import DateInput from '../../components/DateInput';

const TODAY = new Date().toISOString().split('T')[0];

const LOCATIONS = [
  { value: "1", label: "Weight Bridge Side" },
  { value: "2", label: "Solar Side" }
];

export default function MeasurableForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    location: '',
    temp: '',
    humi: '',
    remarks: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(`folders/measurable/form.php?unique_id=${unique_id}`, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      
      const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
      
      setFormData({
        entry_date: g('entry_date') || TODAY,
        location: g('location'),
        temp: g('temp'),
        humi: g('humi'),
        remarks: g('remarks'),
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
      const payload = new URLSearchParams();
      payload.append('action', 'createupdate');
      
      Object.entries(formData).forEach(([key, val]) => {
        payload.append(key, val);
      });
      
      if (unique_id) payload.append('unique_id', unique_id);

      const res = await client.post('folders/measurable/crud.php', payload);
      
      if (res.data?.msg === 'already') {
        alert('Record already exists.');
        return;
      }
      
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/measurable/list');
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
                  Measurable {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>

          <div className="card-body">
            <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="entry_date">Entry Date</label>
                  <input type="date" id="entry_date" name="entry_date" className="form-control"
                    value={formData.entry_date} onChange={handleChange} required />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="location">Location</label>
                  <select id="location" name="location" className="form-select"
                    value={formData.location} onChange={handleChange} required>
                    <option value="">Select Location</option>
                    {LOCATIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="temp">Temperature (C)</label>
                  <input type="number" step="0.01" id="temp" name="temp" className="form-control"
                    value={formData.temp} onChange={handleChange} required />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="humi">Humidity (%)</label>
                  <input type="number" step="0.01" id="humi" name="humi" className="form-control"
                    value={formData.humi} onChange={handleChange} required />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="remarks">Remarks</label>
                  <input type="text" id="remarks" name="remarks" className="form-control"
                    value={formData.remarks} onChange={handleChange} />
                </div>
              </div>

              <div className="row mt-2">
                <div className="col-12 text-end mt-3">
                  <button type="button" onClick={() => navigate('/measurable/list')} className="btn btn-danger me-2">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={isLoading}>
                    {isLoading ? 'Saving...' : unique_id ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
