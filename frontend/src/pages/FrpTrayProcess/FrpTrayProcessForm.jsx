import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import DateInput from '../../components/DateInput';

const TODAY = new Date().toISOString().split('T')[0];

export default function FrpTrayProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    egg_batch_id: '',
    frp_tray_count: '',
    frp_tray_name: [],
  });

  const [batchOptions, setBatchOptions] = useState([]);
  const [trayOptions, setTrayOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/frp_tray_process/form.php?unique_id=${unique_id}`
        : `folders/frp_tray_process/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      
      const batchSelect = doc.querySelector('#egg_batch_id');
      if (batchSelect) setBatchOptions(Array.from(batchSelect.options).map(o => ({ value: o.value, label: o.text })));

      const traySelect = doc.querySelector('#frp_tray_name');
      if (traySelect) setTrayOptions(Array.from(traySelect.options).map(o => ({ value: o.value, label: o.text })));

      if (unique_id) {
        const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
        
        // Handle multiple select parsing
        const selectedTrays = [];
        if (traySelect) {
            Array.from(traySelect.options).forEach(opt => {
                if (opt.selected || opt.hasAttribute('selected')) {
                    selectedTrays.push(opt.value);
                }
            });
        }

        setFormData({
          entry_date:      g('entry_date') || TODAY,
          egg_batch_id:    g('egg_batch_id'),
          frp_tray_count:  g('frp_tray_count'),
          frp_tray_name:   selectedTrays,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      const values = Array.from(selectedOptions).map(opt => opt.value);
      setFormData(prev => ({ ...prev, [name]: values }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(formData.frp_tray_count) !== formData.frp_tray_name.length) {
      alert(`Validation Error: FRP Tray Count (${formData.frp_tray_count}) must equal the number of selected trays (${formData.frp_tray_name.length}).`);
      return;
    }

    setIsLoading(true);
    try {
      const payload = new URLSearchParams();
      payload.append('action', 'createupdate');
      payload.append('entry_date', formData.entry_date);
      payload.append('egg_batch_id', formData.egg_batch_id);
      payload.append('frp_tray_count', formData.frp_tray_count);
      formData.frp_tray_name.forEach(tray => {
        payload.append('frp_tray_name[]', tray);
      });
      
      if (unique_id) payload.append('unique_id', unique_id);

      const res = await client.post('folders/frp_tray_process/crud.php', payload);
      if (res.data?.msg === 'already') {
        alert('This batch already exists.');
        return;
      }
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/frp_tray_process/list');
      }
    } catch (err) {
      console.error(err);
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
                  FRP Tray Process {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>

          <div className="card-body">
            {isLoading && !batchOptions.length ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <DateInput
                      id="entry_date"
                      name="entry_date"
                      label="Entry Date"
                      value={formData.entry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="egg_batch_id">Egg Batch Id</label>
                    <select id="egg_batch_id" name="egg_batch_id" className="form-control"
                      value={formData.egg_batch_id} onChange={handleChange} required>
                      {batchOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="frp_tray_count">FRP Tray Count</label>
                    <input type="number" min="1" id="frp_tray_count" name="frp_tray_count" className="form-control"
                      value={formData.frp_tray_count} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="frp_tray_name">FRP Tray Name</label>
                    <select id="frp_tray_name" name="frp_tray_name" className="form-control"
                      multiple size="5" value={formData.frp_tray_name} onChange={handleChange} required>
                      {trayOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <button type="button" onClick={() => navigate('/frp_tray_process/list')} className="btn btn-danger me-2">
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
