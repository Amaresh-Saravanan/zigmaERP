import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

export default function UserScreenForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    screen_main_name: '',
    screen_name: '',
    folder_name: '',
    order_no: '',
    icon_name: '',
    active_status: '1',
  });

  const [mainScreenOptions, setMainScreenOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMainScreens();
    if (unique_id) fetchScreen();
  }, [unique_id]);

  const fetchMainScreens = async () => {
    try {
      const res = await djangoClient.get('/main-screens', { params: { page_size: 100 } });
      setMainScreenOptions((res.data.results || []).map((ms) => ({ value: ms.unique_id, label: ms.screen_main_name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchScreen = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/screens/${unique_id}`);
      const s = res.data.data;
      setFormData({
        screen_main_name: s.main_screen?.unique_id || '',
        screen_name: s.screen_name || '',
        folder_name: s.folder_name || '',
        order_no: String(s.order_no ?? ''),
        icon_name: s.icon_name || '',
        active_status: s.is_active ? '1' : '0',
      });
    } catch (error) {
      console.error(error);
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
      screen_name: formData.screen_name,
      folder_name: formData.folder_name,
      icon_name: formData.icon_name,
      main_screen: { unique_id: formData.screen_main_name },
      order_no: parseInt(formData.order_no, 10) || 0,
      is_active: formData.active_status === '1',
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/screens/${unique_id}`, payload)
        : await djangoClient.post('/screens', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/user_screen/list');
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
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} User Screen`}
            backTo="/user_screen/list"
          />
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.screen_name && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <p className="form-section-title">
                  <i className="ri-file-list-3-line me-1"></i> Screen Identity
                </p>
                <div className="row">
                  <div className="col-12 col-md-4">
                    <Select
                      label="Main Screen"
                      name="screen_main_name"
                      value={formData.screen_main_name}
                      onChange={handleChange}
                      options={mainScreenOptions}
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
                      label="Folder Name"
                      name="folder_name"
                      value={formData.folder_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <p className="form-section-title mt-2">
                  <i className="ri-settings-3-line me-1"></i> Display Settings
                </p>
                <div className="row">
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
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/user_screen/list')}>
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
