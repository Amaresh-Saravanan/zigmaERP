import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Toggle from '../../components/Toggle';
import Button from '../../components/Button';

export default function UserForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emp_id: '',
    user_name: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    user_type_unique_id: '',
    is_active: '1',
  });

  const [userTypeOptions, setUserTypeOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserTypes();
    if (unique_id) fetchUser();
  }, [unique_id]);

  const fetchUserTypes = async () => {
    try {
      const res = await djangoClient.get('/user-types', { params: { page_size: 100 } });
      setUserTypeOptions((res.data.results || []).map((ut) => ({ value: ut.unique_id, label: ut.type_name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/users/${unique_id}`);
      const user = res.data.data;
      setFormData({
        emp_id: user.emp_id || '',
        user_name: user.user_name || '',
        password: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.user_email || '',
        user_type_unique_id: user.user_type?.unique_id || '',
        is_active: user.is_active ? '1' : '0',
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
      emp_id: formData.emp_id,
      user_name: formData.user_name,
      first_name: formData.first_name,
      last_name: formData.last_name,
      user_email: formData.email,
      user_type: { unique_id: formData.user_type_unique_id },
      is_active: formData.is_active === '1',
    };
    // Password required on create, optional on update (blank = keep existing hash).
    if (formData.password) payload.password = formData.password;

    try {
      const res = unique_id
        ? await djangoClient.put(`/users/${unique_id}`, payload)
        : await djangoClient.post('/users', payload);

      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/user/list');
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
                  User {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.user_name && unique_id ? (
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
                      type="number"
                      label="Employee ID"
                      name="emp_id"
                      value={formData.emp_id}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      label="User Name"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      type="password"
                      label="Password"
                      name="password"
                      maxLength="15"
                      helperText={unique_id ? 'Leave blank to keep current password' : 'Max 15 characters'}
                      value={formData.password}
                      onChange={handleChange}
                      required={!unique_id}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      label="First Name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Last Name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      type="email"
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <Select
                      label="User Type"
                      name="user_type_unique_id"
                      value={formData.user_type_unique_id}
                      onChange={handleChange}
                      options={userTypeOptions}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <Toggle
                      label="Active Status"
                      name="is_active"
                      value={formData.is_active}
                      onChange={handleChange}
                      helperText={formData.is_active === '1' ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/user/list')}>
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
