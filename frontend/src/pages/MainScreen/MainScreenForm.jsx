import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

export default function MainScreenForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');

  const [formData, setFormData] = useState({
    screen_type: '',
    screen_name: '',
    order_no: '',
    icon_name: '',
    active_status: '1',
    description: ''
  });

  const [options, setOptions] = useState({ screenType: [], activeStatus: [] });

  useEffect(() => {
    client.get(`folders/main_screen/form.php${unique_id ? `?unique_id=${unique_id}` : ''}`, { responseType: 'text' })
      .then(res => {
        const doc = new DOMParser().parseFromString(res.data, 'text/html');

        const screenTypeSelect = doc.querySelector('#screen_type');
        if (screenTypeSelect) setOptions(prev => ({ ...prev, screenType: Array.from(screenTypeSelect.options).map(o => ({ value: o.value, label: o.text })) }));
        
        const activeStatusSelect = doc.querySelector('#active_status');
        if (activeStatusSelect) setOptions(prev => ({ ...prev, activeStatus: Array.from(activeStatusSelect.options).map(o => ({ value: o.value, label: o.text })) }));

        if (unique_id) {
          setFormData({
            screen_type: doc.querySelector('#screen_type')?.value || '',
            screen_name: doc.querySelector('#screen_name')?.value || '',
            order_no: doc.querySelector('#order_no')?.value || '',
            icon_name: doc.querySelector('#icon_name')?.value || '',
            active_status: doc.querySelector('#active_status')?.value || '1',
            description: doc.querySelector('#description')?.value || ''
          });
        }
      })
      .catch(err => console.error(err));
  }, [unique_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new URLSearchParams({
        action: unique_id ? 'update' : 'create',
        unique_id: unique_id || '',
        ...formData
      });
      const res = await client.post('folders/main_screen/crud.php', payload);
      if (res.data.status === 'Success') {
        navigate('/main_screen/list');
      } else {
        alert(res.data.message || 'Error saving main screen');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <h5 className="mb-0">Main Screen {unique_id ? 'Update' : 'Create'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Screen Type</label>
                  <select name="screen_type" className="form-select" value={formData.screen_type} onChange={handleChange} required>
                    {options.screenType.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Screen Name</label>
                  <input type="text" name="screen_name" className="form-control" value={formData.screen_name} onChange={handleChange} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Order No</label>
                  <input type="number" name="order_no" className="form-control" min="1" value={formData.order_no} onChange={handleChange} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Active Status</label>
                  <select name="active_status" className="form-select" value={formData.active_status} onChange={handleChange} required>
                    {options.activeStatus.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Icon Name</label>
                  <input type="text" name="icon_name" className="form-control" value={formData.icon_name} onChange={handleChange} required />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleChange}></textarea>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12 text-end">
                  <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/main_screen/list')}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{unique_id ? 'Update' : 'Save'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
