import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

export default function UserTypeForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_type: '',
    active_status: '1',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/user_type/form.php?unique_id=${unique_id}`
        : `folders/user_type/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      const inputs = {
        user_type: doc.querySelector('#user_type'),
        active_status: doc.querySelector('#active_status'),
      };

      if (unique_id) {
        setFormData({
          user_type: inputs.user_type ? inputs.user_type.value : '',
          active_status: inputs.active_status ? inputs.active_status.value : '1',
        });
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
      const res = await client.post('folders/user_type/crud.php', payload);
      const json = res.data;

      if (json.msg === 'create' || json.msg === 'update') {
        navigate('/user_type/list');
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
                  User Type {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.user_type && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-4 mb-3">
                    <label htmlFor="user_type">User Type</label>
                    <input
                      type="text"
                      className="form-control"
                      id="user_type"
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="col-4 mb-3">
                    <label htmlFor="active_status">Active Status</label>
                    <select
                      className="form-control"
                      id="active_status"
                      name="active_status"
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
                    <button type="button" onClick={() => navigate('/user_type/list')} className="btn btn-danger me-2">
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
