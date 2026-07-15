import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const ACTION_KEYS = ['add', 'update', 'list', 'delete', 'view', 'print'];

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
    description: '',
    actions: { add: false, update: false, list: false, delete: false, view: false, print: false },
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
      setMainScreenOptions((res.data.data.results || []).map((ms) => ({ value: ms.unique_id, label: ms.screen_main_name })));
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
        description: s.description || '',
        actions: s.actions || { add: false, update: false, list: false, delete: false, view: false, print: false },
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

  const handleActionChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => {
      if (name === 'all') {
        const actions = ACTION_KEYS.reduce((acc, key) => ({ ...acc, [key]: checked }), {});
        return { ...prev, actions };
      }
      const actions = { ...prev.actions, [name]: checked };
      return { ...prev, actions };
    });
  };

  const allActionsChecked = ACTION_KEYS.every((key) => formData.actions[key]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // ponytail: description and actions are UI-only for now — backend Screen
    // model has no matching fields yet, so they stay out of the payload.
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

                <p className="form-section-title mt-2">
                  <i className="ri-file-text-line me-1"></i> Additional Details
                </p>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <Textarea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label app-form-label">Actions</label>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <button
                        type="button"
                        title="Select All"
                        style={{
                          width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: allActionsChecked ? 'var(--bs-primary)' : 'transparent',
                          color: allActionsChecked ? '#fff' : 'var(--vz-secondary-color)',
                          border: `1.5px solid ${allActionsChecked ? 'var(--bs-primary)' : 'var(--vz-border-color)'}`,
                          transition: 'all 0.15s ease', cursor: 'pointer', fontSize: '1rem', padding: 0,
                        }}
                        onClick={() => handleActionChange({ target: { name: 'all', checked: !allActionsChecked } })}
                      >
                        <i className="ri-check-double-line"></i>
                      </button>
                      {ACTION_KEYS.map((key) => {
                        const active = formData.actions[key];
                        const iconMap = {
                          add: 'ri-add-line',
                          update: 'ri-edit-line',
                          list: 'ri-list-check',
                          delete: 'ri-delete-bin-line',
                          view: 'ri-eye-line',
                          print: 'ri-printer-line',
                        };
                        return (
                          <button
                            key={key}
                            type="button"
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                            style={{
                              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: active ? 'var(--bs-primary)' : 'transparent',
                              color: active ? '#fff' : 'var(--vz-secondary-color)',
                              border: `1.5px solid ${active ? 'var(--bs-primary)' : 'var(--vz-border-color)'}`,
                              transition: 'all 0.15s ease', cursor: 'pointer', fontSize: '1rem', padding: 0,
                            }}
                            onClick={() => handleActionChange({ target: { name: key, checked: !active } })}
                          >
                            <i className={iconMap[key]}></i>
                          </button>
                        );
                      })}
                    </div>
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
