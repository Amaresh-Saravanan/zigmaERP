import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

export default function PitCreationForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pit_name: '',
    location: '',
    length: '',
    width: '',
    height: '',
    volume: '',
    description: '',
    active_status: '1',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) {
      fetchFormHtml();
    }
  }, [unique_id]);

  // ponytail: Auto-calculate volume when dimensions change
  useEffect(() => {
    const l = parseFloat(formData.length) || 0;
    const w = parseFloat(formData.width) || 0;
    const h = parseFloat(formData.height) || 0;
    if (l || w || h) {
      setFormData(prev => ({
        ...prev,
        volume: (l * w * h).toFixed(2)
      }));
    }
  }, [formData.length, formData.width, formData.height]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = `folders/pit_creation/form.php?unique_id=${unique_id}`;
      const res = await client.get(url, { responseType: 'text' });
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      const inputs = {
        pit_name: doc.querySelector('#pit_name'),
        location: doc.querySelector('#location'),
        length: doc.querySelector('#length'),
        width: doc.querySelector('#width'),
        height: doc.querySelector('#height'),
        volume: doc.querySelector('#volume'),
        description: doc.querySelector('#description'),
        active_status: doc.querySelector('#active_status')
      };

      setFormData({
        pit_name: inputs.pit_name ? inputs.pit_name.value : '',
        location: inputs.location ? inputs.location.value : '',
        length: inputs.length ? inputs.length.value : '',
        width: inputs.width ? inputs.width.value : '',
        height: inputs.height ? inputs.height.value : '',
        volume: inputs.volume ? inputs.volume.value : '',
        description: inputs.description ? inputs.description.value : '',
        active_status: inputs.active_status ? inputs.active_status.value : '1',
      });
    } catch (error) {
      console.error('Failed to load form details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = new URLSearchParams();
    payload.append('action', 'createupdate');
    Object.entries(formData).forEach(([key, val]) => {
      payload.append(key, val);
    });
    
    if (unique_id) {
      payload.append('unique_id', unique_id);
    }

    try {
      const res = await client.post('folders/pit_creation/crud.php', payload);
      const json = res.data;
      if (json.msg === 'create' || json.msg === 'update') {
        navigate('/pit_creation/list');
      }
    } catch (error) {
      console.error('An error occurred while saving.', error);
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
                  Pit Creation {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.pit_name && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-4 mb-3">
                    <label htmlFor="pit_name">Pit Name </label>
                    <input
                      type="text"
                      className="form-control"
                      id="pit_name"
                      name="pit_name"
                      placeholder="PIT-01"
                      value={formData.pit_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-4 mb-3">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-4 mb-3">
                    <label htmlFor="length"> Length (Meter) </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="length"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-4 mb-3">
                    <label htmlFor="width"> Width(Meter) </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="width"
                      name="width"
                      value={formData.width}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-4 mb-3">
                    <label htmlFor="height"> Height(Meter) </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-4 mb-3">
                    <label htmlFor="volume"> Capacity (Volume-m³) </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="volume"
                      name="volume"
                      value={formData.volume}
                      readOnly
                      required
                    />
                  </div>
                  <div className="col-4 mb-3">
                    <label htmlFor="description">Description</label>
                    <textarea
                      name="description"
                      id="description"
                      rows="2"
                      className="form-control"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-4 mb-3">
                    <label htmlFor="active_status">Active Status</label>
                    <select
                      name="active_status"
                      id="active_status"
                      className="form-control"
                      value={formData.active_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-12 text-end">
                    <button type="button" onClick={() => navigate('/pit_creation/list')} className="btn btn-danger me-2">
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
