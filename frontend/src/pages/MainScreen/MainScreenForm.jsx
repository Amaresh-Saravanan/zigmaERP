import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

export default function MainScreenForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');

  const [formData, setFormData] = useState({
    screen_type: '',
    screen_name: '',
    order_no: '',
    active_status: '1',
    icon_name: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (unique_id) fetchMainScreen();
  }, [unique_id]);

  const fetchMainScreen = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/main-screens/${unique_id}`);
      const ms = res.data.data;
      setFormData({
        screen_type: ms.screen_type || '',
        screen_name: ms.screen_main_name || '',
        order_no: ms.order_no != null ? String(ms.order_no) : '',
        active_status: ms.is_active ? '1' : '0',
        icon_name: ms.icon_name || '',
        description: ms.description || '',
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

    if (!e.target.checkValidity()) {
      setValidated(true);
      return;
    }

    setIsLoading(true);

    // ponytail: screen_type, order_no, description are UI-only for now —
    // backend/core/models.py MainScreen has no matching fields yet, so they
    // stay out of the payload until that lands.
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
              <form className={validated ? 'was-validated' : ''} onSubmit={handleSubmit} autoComplete="off" noValidate>
                <p className="form-section-title">
                  <i className="ri-layout-grid-line me-1"></i> Main Screen Details
                </p>
                <div className="row">
                  <div className="col-12 col-md-4">
                    {/* ponytail: static placeholder list until backend defines real screen types */}
                    <Select
                      label="Screen Type"
                      name="screen_type"
                      value={formData.screen_type}
                      onChange={handleChange}
                      placeholder="Select the Screen Type"
                      options={[
                        { value: 'menu', label: 'Menu' },
                        { value: 'report', label: 'Report' },
                      ]}
                      required
                    />
                  </div>
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
                      type="number"
                      label="Order No"
                      name="order_no"
                      value={formData.order_no}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-md-4">
                    <Select
                      label="Active Status"
                      name="active_status"
                      value={formData.active_status}
                      onChange={handleChange}
                      options={[
                        { value: '1', label: 'Active' },
                        { value: '0', label: 'Inactive' },
                      ]}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Icon"
                      name="icon_name"
                      value={formData.icon_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Textarea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
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
