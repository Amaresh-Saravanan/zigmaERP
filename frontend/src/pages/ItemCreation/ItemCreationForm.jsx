import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import client from '../../api/client';

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
    fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      // ponytail: Extract form values and dropdown options by parsing legacy HTML
      const url = unique_id 
        ? `folders/item_creation/form.php?unique_id=${unique_id}`
        : `folders/item_creation/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      const itemCodeInput = doc.querySelector('#item_code');
      const itemNameInput = doc.querySelector('#item_name');
      const unitSelect = doc.querySelector('#unit');
      const activeStatusSelect = doc.querySelector('#active_status');

      if (unitSelect) {
        const options = Array.from(unitSelect.options).map(opt => ({
          value: opt.value,
          label: opt.text
        }));
        setUnitOptions(options);
      }

      setFormData({
        item_code: itemCodeInput ? itemCodeInput.value : '',
        item_name: itemNameInput ? itemNameInput.value : '',
        unit: unitSelect ? unitSelect.value : '',
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
    // Note: item_code is generated on backend, but sent anyway if needed. Backend ignores it on createupdate
    payload.append('item_name', formData.item_name);
    payload.append('unit', formData.unit);
    payload.append('active_status', formData.active_status);
    
    if (unique_id) {
      payload.append('unique_id', unique_id);
    }

    try {
      const res = await client.post('folders/item_creation/crud.php', payload);
      const json = res.data;
      
      if (json.msg === 'create' || json.msg === 'update') {
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
      <div className="col-md-12 col-xxl-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pb-0">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="mb-0 mt-2 d-flex align-items-center">
                  Item Creation {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.item_name && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col">
                    <label htmlFor="item_code">Item Code </label>
                    <input
                      type="text"
                      className="form-control"
                      id="item_code"
                      name="item_code"
                      value={formData.item_code}
                      readOnly
                      required
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="item_name">Item Name </label>
                    <input
                      type="text"
                      className="form-control"
                      id="item_name"
                      name="item_name"
                      value={formData.item_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <label htmlFor="unit" className="form-label">Unit </label>
                    <select
                      name="unit"
                      id="unit"
                      className="form-control"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                    >
                      {unitOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col">
                    <label htmlFor="active_status">Active Status </label>
                    <select
                      name="active_status"
                      id="active_status"
                      className="form-control"
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
                    <button type="button" onClick={() => navigate('/item_creation/list')} className="btn btn-danger me-2">
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
