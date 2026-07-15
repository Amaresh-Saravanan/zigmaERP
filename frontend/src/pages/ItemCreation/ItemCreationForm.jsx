import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Toggle from '../../components/Toggle';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

export default function ItemCreationForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    item_code: '',
    item_name: '',
    unit: '',
    active_status: '1',
  });

  const [unitOptions, setUnitOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUnits();
    if (unique_id) fetchItem();
  }, [unique_id]);

  const fetchUnits = async () => {
    try {
      const res = await djangoClient.get('/units', { params: { page_size: 100 } });
      setUnitOptions((res.data.data.results || []).map((u) => ({ value: u.unique_id, label: u.unit_name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchItem = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/items/${unique_id}`);
      const item = res.data.data;
      setFormData({
        item_code: item.item_code || '',
        item_name: item.item_name || '',
        unit: item.unit?.unique_id || '',
        active_status: item.is_active ? '1' : '0',
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
      item_name: formData.item_name,
      unit: { unique_id: formData.unit },
      is_active: formData.active_status === '1',
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/items/${unique_id}`, payload)
        : await djangoClient.post('/items', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/item_creation/list');
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
            title={`${unique_id ? 'Update' : 'New'} Item`}
            backTo="/item_creation/list"
          />
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.item_name && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <p className="form-section-title">
                  <i className="ri-price-tag-3-line me-1"></i> Item Details
                </p>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <TextInput
                      label="Item Code"
                      name="item_code"
                      value={formData.item_code}
                      placeholder={unique_id ? '' : 'Auto-generated on save'}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <TextInput
                      label="Item Name"
                      name="item_name"
                      value={formData.item_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <Select
                      label="Unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      options={unitOptions}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
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
                    <Button variant="danger" className="me-2" onClick={() => navigate('/item_creation/list')}>
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
