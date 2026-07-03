import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Toggle from '../../components/Toggle';
import Button from '../../components/Button';

const TRAY_TYPE_OPTIONS = [
  { value: '1', label: 'EGG Tray' },
  { value: '2', label: 'FRP Tray' },
];

export default function TrayCreationForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tray_type: '',
    bin_name: '',
    active_status: '1',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchTray();
  }, [unique_id]);

  const fetchTray = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/trays/${unique_id}`);
      const tray = res.data.data;
      setFormData({
        tray_type: tray.tray_type || '',
        bin_name: tray.bin_name || '',
        active_status: tray.is_active ? '1' : '0',
      });
    } catch (error) {
      console.error('Failed to load tray', error);
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
      tray_type: formData.tray_type,
      bin_name: formData.bin_name,
      is_active: formData.active_status === '1',
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/trays/${unique_id}`, payload)
        : await djangoClient.post('/trays', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/tray_creation/list');
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
                  Tray Creation {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.bin_name && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-12 col-md-4">
                    <Select
                      label="Tray Type"
                      name="tray_type"
                      value={formData.tray_type}
                      onChange={handleChange}
                      options={TRAY_TYPE_OPTIONS}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Tray Name"
                      name="bin_name"
                      value={formData.bin_name}
                      onChange={handleChange}
                      placeholder="Tray-1"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Toggle
                      label="Status"
                      name="active_status"
                      value={formData.active_status}
                      onChange={handleChange}
                      helperText={formData.active_status === '1' ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/tray_creation/list')}>
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
