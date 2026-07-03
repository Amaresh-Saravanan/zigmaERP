import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Textarea from '../../components/Textarea';
import Toggle from '../../components/Toggle';
import Button from '../../components/Button';

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
    if (unique_id) fetchPit();
  }, [unique_id]);

  // ponytail: Auto-calculate volume when dimensions change (server also computes this on save)
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

  const fetchPit = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/pits/${unique_id}`);
      const pit = res.data.data;
      setFormData({
        pit_name: pit.pit_name || '',
        location: pit.location || '',
        length: pit.length ?? '',
        width: pit.width ?? '',
        height: pit.height ?? '',
        volume: pit.volume ?? '',
        description: pit.description || '',
        active_status: pit.is_active ? '1' : '0',
      });
    } catch (error) {
      console.error('Failed to load pit', error);
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

    const payload = {
      pit_name: formData.pit_name,
      location: formData.location,
      length: parseFloat(formData.length) || 0,
      width: parseFloat(formData.width) || 0,
      height: parseFloat(formData.height) || 0,
      description: formData.description,
      is_active: formData.active_status === '1',
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/pits/${unique_id}`, payload)
        : await djangoClient.post('/pits', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
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
      <div className="col-12">
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
                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Pit Name"
                      name="pit_name"
                      placeholder="PIT-01"
                      value={formData.pit_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Length (Meter)"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Width (Meter)"
                      name="width"
                      value={formData.width}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Height (Meter)"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Capacity (Volume-m³)"
                      name="volume"
                      value={formData.volume}
                      readOnly
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Textarea
                      label="Description"
                      name="description"
                      rows={2}
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Toggle
                      label="Active Status"
                      name="active_status"
                      value={formData.active_status}
                      onChange={handleChange}
                      helperText={formData.active_status === '1' ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/pit_creation/list')}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : unique_id ? 'Update' : 'Save'}
                    </Button>
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
