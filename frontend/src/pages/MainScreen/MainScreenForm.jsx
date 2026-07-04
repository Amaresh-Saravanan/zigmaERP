import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Toggle from '../../components/Toggle';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

export default function MainScreenForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');

  const [formData, setFormData] = useState({
    screen_name: '',
    icon_name: '',
    active_status: '1',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchMainScreen();
  }, [unique_id]);

  const fetchMainScreen = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/main-screens/${unique_id}`);
      const ms = res.data.data;
      setFormData({
        screen_name: ms.screen_main_name || '',
        icon_name: ms.icon_name || '',
        active_status: ms.is_active ? '1' : '0',
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

    const payload = {
      screen_main_name: formData.screen_name,
      icon_name: formData.icon_name,
      is_active: formData.active_status === '1',
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/main-screens/${unique_id}`, payload)
        : await djangoClient.post('/main-screens', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/main_screen/list');
      }
    } catch (err) {
      console.error('An error occurred while saving.', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} Main Screen`}
            backTo="/main_screen/list"
          />
          <div className="card-body">
            {isLoading && !formData.screen_name && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <p className="form-section-title">
                  <i className="ri-layout-grid-line me-1"></i> Main Screen Details
                </p>
                <div className="row">
                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Screen Name"
                      name="screen_name"
                      value={formData.screen_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Icon Name"
                      name="icon_name"
                      value={formData.icon_name}
                      onChange={handleChange}
                      required
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
                <div className="row mt-3">
                  <div className="col-12 text-end">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/main_screen/list')}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : unique_id ? 'Update' : 'Save'}</Button>
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
