import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

export default function UserPermissionForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    user_type: unique_id || '',
    main_screen: '',
  });

  const [userTypeOptions, setUserTypeOptions] = useState([]);
  const [mainScreenOptions, setMainScreenOptions] = useState([]);
  const [permUiHtml, setPermUiHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const permUiRef = useRef(null);

  useEffect(() => {
    fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/user_permission/form.php?unique_id=${unique_id}`
        : `folders/user_permission/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      const inputs = {
        user_type: doc.querySelector('#user_type'),
        main_screen: doc.querySelector('#main_screen'),
      };

      if (inputs.user_type) {
        setUserTypeOptions(Array.from(inputs.user_type.options).map(opt => ({
          value: opt.value,
          label: opt.text
        })));
      }

      if (inputs.main_screen) {
        setMainScreenOptions(Array.from(inputs.main_screen.options).map(opt => ({
          value: opt.value,
          label: opt.text
        })));
      }

      // If updating, fetch UI right away if user_type and main_screen are set?
      // Wait, unique_id sets user_type. We might still need to select main_screen to see UI.
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formData.user_type && formData.main_screen) {
      fetchPermUi();
    } else {
      setPermUiHtml('');
    }
  }, [formData.user_type, formData.main_screen]);

  const fetchPermUi = async () => {
    try {
      const payload = new URLSearchParams();
      payload.append('action', 'permission_ui');
      payload.append('user_type', formData.user_type);
      payload.append('main_screen', formData.main_screen);

      const res = await client.post('folders/user_permission/crud.php', payload);
      setPermUiHtml(res.data);
    } catch (error) {
      console.error('Error fetching permission UI', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a global click listener for the dynamically loaded 'All' buttons since they use inline onclick handlers
  useEffect(() => {
    const handleDynamicClick = (e) => {
      // The old UI uses check_all() and check_me() globally defined functions.
      // We'll mimic their behavior for elements inside permUiRef
      const target = e.target;
      
      // If an "All" button for an action column is clicked
      if (target.tagName === 'BUTTON' && target.hasAttribute('data-id')) {
        const idClass = target.getAttribute('data-id');
        const isChecked = target.getAttribute('data-check') === 'checked';
        const newCheckState = !isChecked;
        
        target.setAttribute('data-check', newCheckState ? 'checked' : 'unchecked');
        
        const checkboxes = permUiRef.current?.querySelectorAll(`.${idClass}`);
        if (checkboxes) {
          checkboxes.forEach(cb => {
            cb.checked = newCheckState;
          });
        }
      }
      
      // If a row "All" checkbox is clicked
      if (target.type === 'checkbox' && target.id.startsWith('all')) {
        const screenId = target.id.replace('all', ''); // Note: Might be 'all'+screenId
        // Find checkboxes for this screen and check them
        const checkboxes = permUiRef.current?.querySelectorAll(`.screen${screenId}`);
        if (checkboxes) {
          checkboxes.forEach(cb => {
            cb.checked = target.checked;
          });
        }
      }
    };

    const container = permUiRef.current;
    if (container) {
      container.addEventListener('click', handleDynamicClick);
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleDynamicClick);
      }
    };
  }, [permUiHtml]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Extract JSON data
    const checkedInputs = permUiRef.current?.querySelectorAll('.all-checkbox:checked') || [];
    const jsonDataArray = Array.from(checkedInputs).map(input => ({
      section: input.getAttribute('data-section'),
      screen: input.getAttribute('data-screen'),
      action: input.getAttribute('data-action')
    }));

    const payload = new URLSearchParams();
    payload.append('action', 'createupdate');
    payload.append('user_type', formData.user_type);
    payload.append('main_screen', formData.main_screen);
    if (unique_id) {
      payload.append('unique_id', unique_id);
    }
    payload.append('json_data', JSON.stringify(jsonDataArray));

    try {
      const res = await client.post('folders/user_permission/crud.php', payload);
      const json = res.data;

      if (json.msg === 'create' || json.msg === 'update' || json.msg === 'already') {
        // If 'already' we could alert or just go back
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
      <div className="col-md-12 col-xxl-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  User Permission {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body">
            <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
              <div className="row mb-3">
                <div className="col-4">
                  <label htmlFor="user_type" className="col-form-label">User Type</label>
                  <select
                    className="form-control"
                    id="user_type"
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                    disabled={!!unique_id}
                    required
                  >
                    {userTypeOptions.map((opt, i) => (
                      <option key={i} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-4">
                  <label htmlFor="main_screen" className="col-form-label">Main Screen</label>
                  <select
                    className="form-control"
                    id="main_screen"
                    name="main_screen"
                    value={formData.main_screen}
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
              </div>

              <div 
                id="perm_ui" 
                className="col-12 mt-4" 
                ref={permUiRef}
                dangerouslySetInnerHTML={{ __html: permUiHtml }}
              />
              
              <div className="row mt-4">
                <div className="col-md-12 text-end">
                  <button type="button" onClick={() => navigate('/user_permission/list')} className="btn btn-danger me-2">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={isLoading || !permUiHtml}>
                    {isLoading ? 'Saving...' : unique_id ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
