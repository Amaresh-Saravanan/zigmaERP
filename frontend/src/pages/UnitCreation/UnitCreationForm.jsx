import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import client from '../../api/client';
import TextInput from '../../components/TextInput';
import Toggle from '../../components/Toggle';
import Button from '../../components/Button';

export default function UnitCreationForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    unit_name: '',
    active_status: '1',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) {
      fetchFormHtml();
    }
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      // ponytail: Extract values by parsing the legacy HTML form directly rather than modifying backend API
      const res = await client.get(`folders/unit_creation/form.php?unique_id=${unique_id}`, {
        responseType: 'text'
      });
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      const unitNameInput = doc.querySelector('#unit_name');
      const activeStatusSelect = doc.querySelector('#active_status');

      setFormData({
        unit_name: unitNameInput ? unitNameInput.value : '',
        active_status: activeStatusSelect ? activeStatusSelect.value : '1',
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

    const payload = new URLSearchParams();
    payload.append('action', 'createupdate');
    payload.append('unit_name', formData.unit_name);
    payload.append('active_status', formData.active_status);
    if (unique_id) {
      payload.append('unique_id', unique_id);
    }

    try {
      const res = await client.post('folders/unit_creation/crud.php', payload);
      const json = res.data;
      
      if (json.msg === 'create' || json.msg === 'update') {
        navigate('/unit_creation/list');
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
                  Unit Creation {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.unit_name && unique_id ? (
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
                      label="Unit Name"
                      name="unit_name"
                      value={formData.unit_name}
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
                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/unit_creation/list')}>
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
