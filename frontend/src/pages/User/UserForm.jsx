import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
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
    fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/user/form.php?unique_id=${unique_id}`
        : `folders/user/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      const inputs = {
        emp_id: doc.querySelector('#emp_id'),
        user_name: doc.querySelector('#user_name'),
        password: doc.querySelector('#password'),
        first_name: doc.querySelector('#first_name'),
        last_name: doc.querySelector('#last_name'),
        email: doc.querySelector('#email'),
        user_type_unique_id: doc.querySelector('#user_type_unique_id'),
        is_active: doc.querySelector('#is_active'),
      };

      if (unique_id) {
        setFormData({
          emp_id: inputs.emp_id ? inputs.emp_id.value : '',
          user_name: inputs.user_name ? inputs.user_name.value : '',
          password: inputs.password ? inputs.password.value : '',
          first_name: inputs.first_name ? inputs.first_name.value : '',
          last_name: inputs.last_name ? inputs.last_name.value : '',
          email: inputs.email ? inputs.email.value : '',
          user_type_unique_id: inputs.user_type_unique_id ? inputs.user_type_unique_id.value : '',
          is_active: inputs.is_active ? inputs.is_active.value : '1',
        });
      }

      // Extract User Type Options
      if (inputs.user_type_unique_id) {
        const options = Array.from(inputs.user_type_unique_id.options).map(opt => ({
          value: opt.value,
          label: opt.text
        }));
        setUserTypeOptions(options);
      }
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

    const payload = new URLSearchParams();
    payload.append('action', 'createupdate');
    Object.keys(formData).forEach(key => {
      payload.append(key, formData[key]);
    });
    
    if (unique_id) {
      payload.append('unique_id', unique_id);
    }

    try {
      const res = await client.post('folders/user/crud.php', payload);
      const json = res.data;

      if (json.msg === 'create' || json.msg === 'update') {
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
                      helperText="Max 15 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
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
