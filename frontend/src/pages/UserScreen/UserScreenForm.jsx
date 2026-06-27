import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

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
    description: '',
    active_status: '1',
  });
  
  const [mainScreenOptions, setMainScreenOptions] = useState([]);
  const [actionOptions, setActionOptions] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/user_screen/form.php?unique_id=${unique_id}`
        : `folders/user_screen/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      const inputs = {
        screen_main_name: doc.querySelector('#screen_main_name'),
        screen_name: doc.querySelector('#screen_name'),
        folder_name: doc.querySelector('#folder_name'),
        order_no: doc.querySelector('#order_no'),
        icon_name: doc.querySelector('#icon_name'),
        description: doc.querySelector('#description'),
        active_status: doc.querySelector('#active_status'),
      };

      if (unique_id) {
        setFormData({
          screen_main_name: inputs.screen_main_name ? inputs.screen_main_name.value : '',
          screen_name: inputs.screen_name ? inputs.screen_name.value : '',
          folder_name: inputs.folder_name ? inputs.folder_name.value : '',
          order_no: inputs.order_no ? inputs.order_no.value : '',
          icon_name: inputs.icon_name ? inputs.icon_name.value : '',
          description: inputs.description ? inputs.description.value : '',
          active_status: inputs.active_status ? inputs.active_status.value : '1',
        });
      }

      // Extract Main Screen Options
      if (inputs.screen_main_name) {
        const options = Array.from(inputs.screen_main_name.options).map(opt => ({
          value: opt.value,
          label: opt.text
        }));
        setMainScreenOptions(options);
      }
      
      // Extract Checkbox Actions
      const checkboxes = Array.from(doc.querySelectorAll('ul.ks-cboxtags input[type="checkbox"]'));
      const actions = checkboxes.map(cb => {
        const labelEl = doc.querySelector(`label[for="${cb.id}"]`);
        return {
          id: cb.id,
          value: cb.value,
          label: labelEl ? labelEl.textContent : cb.value,
          checked: cb.checked
        };
      });
      setActionOptions(actions);
      setSelectedActions(actions.filter(a => a.checked).map(a => a.value));

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleActionToggle = (val) => {
    if (selectedActions.includes(val)) {
      setSelectedActions(selectedActions.filter(a => a !== val));
    } else {
      setSelectedActions([...selectedActions, val]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = new URLSearchParams();
    payload.append('action', 'createupdate');
    Object.keys(formData).forEach(key => {
      payload.append(key, formData[key]);
    });
    
    // Add selected actions
    selectedActions.forEach(val => {
      payload.append('user_action[]', val);
    });
    
    if (unique_id) {
      payload.append('unique_id', unique_id);
    }

    try {
      const res = await client.post('folders/user_screen/crud.php', payload);
      const json = res.data;

      if (json.msg === 'create' || json.msg === 'update') {
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
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  User Screen {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.screen_name && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-4 mb-3">
                    <label htmlFor="screen_main_name">Main Screen</label>
                    <select
                      className="form-control"
                      id="screen_main_name"
                      name="screen_main_name"
                      value={formData.screen_main_name}
                      onChange={handleChange}
                      required
                    >
                      {mainScreenOptions.map((opt, i) => (
                        <option key={i} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-4 mb-3">
                    <label htmlFor="screen_name">Screen Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="screen_name"
                      name="screen_name"
                      value={formData.screen_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-4 mb-3">
                    <label htmlFor="folder_name">Folder Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="folder_name"
                      name="folder_name"
                      value={formData.folder_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-4 mb-3">
                    <label htmlFor="order_no">Order No</label>
                    <input
                      type="number"
                      className="form-control"
                      id="order_no"
                      name="order_no"
                      value={formData.order_no}
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
                  
                  <div className="col-4 mb-3">
                    <label htmlFor="icon_name">Icon</label>
                    <input
                      type="text"
                      className="form-control"
                      id="icon_name"
                      name="icon_name"
                      value={formData.icon_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-4 mb-3">
                    <label htmlFor="description">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="2"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-6 mb-3">
                    <label>Actions</label>
                    <div>
                      <ul className="ks-cboxtags d-flex flex-wrap gap-2 list-unstyled">
                        {actionOptions.map((opt, i) => (
                          <li key={i}>
                            <input 
                              type="checkbox" 
                              id={opt.id} 
                              checked={selectedActions.includes(opt.value)}
                              onChange={() => handleActionToggle(opt.value)}
                            />
                            <label className="ms-2" htmlFor={opt.id}>{opt.label}</label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <button type="button" onClick={() => navigate('/user_screen/list')} className="btn btn-danger me-2">
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
