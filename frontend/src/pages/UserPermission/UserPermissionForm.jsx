import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const ACTION_LABELS = { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete' };

function actionLabel(screenId) {
  const suffix = screenId.split('_').pop();
  return ACTION_LABELS[suffix] || suffix;
}

function moduleLabel(prefix) {
  return prefix.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function UserPermissionForm() {
  const [searchParams] = useSearchParams();
  const initialUserType = searchParams.get('unique_id') || '';
  const navigate = useNavigate();

  const [userTypeId, setUserTypeId] = useState(initialUserType);
  const [userTypeOptions, setUserTypeOptions] = useState([]);
  const [typeMeta, setTypeMeta] = useState(null); // { type_name, is_active } - required to resend on save
  const [catalog, setCatalog] = useState({});
  const [mainScreens, setMainScreens] = useState([]);
  const [checkedScreens, setCheckedScreens] = useState(new Set());
  const [checkedMainScreens, setCheckedMainScreens] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserTypes();
    fetchCatalog();
    fetchMainScreens();
  }, []);

  useEffect(() => {
    if (userTypeId) fetchUserTypePermissions();
  }, [userTypeId]);

  const fetchUserTypes = async () => {
    try {
      const res = await djangoClient.get('/user-types', { params: { page_size: 100 } });
      setUserTypeOptions((res.data.results || []).map((ut) => ({ value: ut.unique_id, label: ut.type_name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await djangoClient.get('/permission-catalog');
      setCatalog(res.data.data || {});
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMainScreens = async () => {
    try {
      const res = await djangoClient.get('/main-screens', { params: { page_size: 100 } });
      setMainScreens(res.data.results || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserTypePermissions = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/user-types/${userTypeId}`);
      const ut = res.data.data;
      setTypeMeta({ type_name: ut.type_name, is_active: ut.is_active });
      setCheckedScreens(new Set((ut.screens || '').split(',').filter(Boolean)));
      setCheckedMainScreens(new Set((ut.main_screens || '').split(',').filter(Boolean)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScreen = (screenId) => {
    setCheckedScreens((prev) => {
      const next = new Set(prev);
      next.has(screenId) ? next.delete(screenId) : next.add(screenId);
      return next;
    });
  };

  const toggleAllInModule = (screenIds, checkAll) => {
    setCheckedScreens((prev) => {
      const next = new Set(prev);
      screenIds.forEach((id) => (checkAll ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const toggleMainScreen = (mainScreenId) => {
    setCheckedMainScreens((prev) => {
      const next = new Set(prev);
      next.has(mainScreenId) ? next.delete(mainScreenId) : next.add(mainScreenId);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userTypeId || !typeMeta) return;
    setIsLoading(true);

    const payload = {
      type_name: typeMeta.type_name,
      is_active: typeMeta.is_active,
      screens: Array.from(checkedScreens).join(','),
      main_screens: Array.from(checkedMainScreens).join(','),
    };

    try {
      const res = await djangoClient.put(`/user-types/${userTypeId}`, payload);
      if (res.data?.msg === 'update') {
        navigate('/user_permission/list');
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
          <FormHeader title="User Permission" backTo="/user_permission/list" />
          <div className="card-body">
            <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
              <p className="form-section-title">
                <i className="ri-user-settings-line me-1"></i> User Type Selection
              </p>
              <div className="row mb-3">
                <div className="col-12 col-md-4">
                  <Select
                    label="User Type"
                    name="user_type"
                    value={userTypeId}
                    onChange={(e) => setUserTypeId(e.target.value)}
                    options={userTypeOptions}
                    required
                  />
                </div>
              </div>

              {userTypeId && !isLoading && (
                <>
                  <div className="mb-4">
                    <p className="form-section-title">
                      <i className="ri-layout-grid-line me-1"></i> Main Screens Access (sidebar sections)
                    </p>
                    <div className="d-flex flex-wrap gap-3">
                      {mainScreens.map((ms) => (
                        <div className="form-check" key={ms.unique_id}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`main-${ms.unique_id}`}
                            checked={checkedMainScreens.has(ms.unique_id)}
                            onChange={() => toggleMainScreen(ms.unique_id)}
                          />
                          <label className="form-check-label" htmlFor={`main-${ms.unique_id}`}>
                            {ms.screen_main_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="form-section-title">
                    <i className="ri-shield-check-line me-1"></i> Module Access
                  </p>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <tbody>
                        {Object.entries(catalog).map(([prefix, screenIds]) => (
                          <tr key={prefix}>
                            <td className="fw-medium" style={{ width: '20%' }}>{moduleLabel(prefix)}</td>
                            <td>
                              <div className="d-flex flex-wrap gap-3">
                                {screenIds.map((screenId) => (
                                  <div className="form-check" key={screenId}>
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      id={screenId}
                                      checked={checkedScreens.has(screenId)}
                                      onChange={() => toggleScreen(screenId)}
                                    />
                                    <label className="form-check-label" htmlFor={screenId}>
                                      {actionLabel(screenId)}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="text-end" style={{ width: '1%' }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost-primary"
                                onClick={() => toggleAllInModule(screenIds, !screenIds.every((id) => checkedScreens.has(id)))}
                              >
                                {screenIds.every((id) => checkedScreens.has(id)) ? 'Clear' : 'All'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="row mt-4">
                <div className="col-12 text-end mt-3">
                  <Button variant="danger" className="me-2" onClick={() => navigate('/user_permission/list')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !userTypeId}>
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
