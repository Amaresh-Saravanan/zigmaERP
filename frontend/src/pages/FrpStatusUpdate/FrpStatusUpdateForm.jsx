import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

const TODAY = new Date().toISOString().split('T')[0];

export default function FrpStatusUpdateForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    batch_id: '',
    entry_no: '',
    starting_day: '',
    day: '',
    hatching_status: '',
    remarks: '',
  });

  const [batchOptions, setBatchOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFormHtml();
  }, [unique_id]);

  useEffect(() => {
    if (formData.entry_date && formData.starting_day) {
      const entryTime = new Date(formData.entry_date).getTime();
      const startTime = new Date(formData.starting_day).getTime();
      const diffDays = Math.round((entryTime - startTime) / (1000 * 3600 * 24)) + 1;
      setFormData(prev => ({ ...prev, day: diffDays.toString() }));
    }
  }, [formData.entry_date, formData.starting_day]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/frp_status_update/form.php?unique_id=${unique_id}`
        : `folders/frp_status_update/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      
      const batchSelect = doc.querySelector('#batch_id');
      if (batchSelect) setBatchOptions(Array.from(batchSelect.options).map(o => ({ value: o.value, label: o.text })));

      if (unique_id) {
        const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
        setFormData({
          entry_date: g('entry_date') || TODAY,
          batch_id: g('batch_id'),
          entry_no: g('entry_no'),
          starting_day: g('starting_day'),
          day: g('day'),
          hatching_status: g('hatching_status'),
          remarks: g('remarks'),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchChange = async (e) => {
    const newBatchId = e.target.value;
    setFormData(prev => ({ ...prev, batch_id: newBatchId }));
    
    if (!newBatchId) {
      setFormData(prev => ({ ...prev, entry_no: '', starting_day: '', day: '' }));
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('action', 'select_entry_date');
      params.append('batch_id', newBatchId);
      const res = await client.post('folders/frp_status_update/crud.php', params, { responseType: 'text' });
      
      // select_entry_date returns "entry_date,entry_no"
      if (res.data && res.data.includes(',')) {
        const [startingDay, entryNo] = res.data.split(',');
        setFormData(prev => ({ ...prev, starting_day: startingDay, entry_no: entryNo }));
      }
    } catch (err) {
      console.error('Error fetching entry date', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append('action', 'createupdate');
      payload.append('staff_name', ''); // Auto-filled from session in PHP, just sending empty
      Object.entries(formData).forEach(([key, val]) => payload.append(key, val));
      
      files.forEach((file) => {
        payload.append('test_file[]', file);
      });

      if (unique_id) payload.append('unique_id', unique_id);

      const res = await client.post('folders/frp_status_update/crud.php', payload);
      if (res.data?.msg === 'already') {
        alert('This batch already exists.');
        return;
      }
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/frp_status_update/list');
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
                  FRP Status Update {unique_id ? 'Update' : 'Create'}
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
                  <div className="col-md-4 mb-3">
                    <label htmlFor="entry_date">Entry Date</label>
                    <input type="date" id="entry_date" name="entry_date" className="form-control"
                      value={formData.entry_date} onChange={handleChange} required readOnly={!!formData.batch_id} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="batch_id">Batch Id</label>
                    <select id="batch_id" name="batch_id" className="form-control"
                      value={formData.batch_id} onChange={handleBatchChange} required>
                      {batchOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="entry_no">Entry No</label>
                    <input type="text" id="entry_no" name="entry_no" className="form-control"
                      value={formData.entry_no} readOnly />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label htmlFor="starting_day">Processing started Day</label>
                    <input type="date" id="starting_day" name="starting_day" className="form-control"
                      value={formData.starting_day} readOnly />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="day">Day</label>
                    <input type="text" id="day" name="day" className="form-control"
                      value={formData.day} readOnly />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="hatching_status">FRP Hatching Status</label>
                    <select id="hatching_status" name="hatching_status" className="form-control"
                      value={formData.hatching_status} onChange={handleChange} required>
                      <option value="">Select The Status</option>
                      <option value="1">Progressing</option>
                      <option value="2">Completed</option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="test_file">FRP egg process Image</label>
                    <input type="file" id="test_file" name="test_file" className="form-control"
                      multiple onChange={handleFileChange} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label htmlFor="remarks">Remarks</label>
                    <input type="text" id="remarks" name="remarks" className="form-control"
                      value={formData.remarks} onChange={handleChange} />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <button type="button" onClick={() => navigate('/frp_status_update/list')} className="btn btn-danger me-2">
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
