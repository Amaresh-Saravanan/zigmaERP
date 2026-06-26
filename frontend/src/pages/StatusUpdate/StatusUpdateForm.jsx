import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import useAuth from '../../hooks/useAuth';

const TODAY = new Date().toISOString().split('T')[0];

const HATCHING_OPTIONS = [
  { value: '1', label: 'Progressing' },
  { value: '2', label: 'Completed' },
];

export default function StatusUpdateForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    staff_name: user?.userId || '',
    entry_date: TODAY,
    batch_id: '',
    entry_no: '',
    starting_day: '',
    day: '',
    hatching_status: '1',
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
      const eDate = new Date(formData.entry_date);
      const sDate = new Date(formData.starting_day);
      if (!isNaN(eDate) && !isNaN(sDate)) {
        const diffTime = Math.abs(eDate - sDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData(prev => ({ ...prev, day: diffDays.toString() }));
      }
    } else {
      setFormData(prev => ({ ...prev, day: '' }));
    }
  }, [formData.entry_date, formData.starting_day]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/status_update/form.php?unique_id=${unique_id}`
        : `folders/status_update/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      
      const batchSelect = doc.querySelector('#batch_id');
      if (batchSelect) setBatchOptions(Array.from(batchSelect.options).map(o => ({ value: o.value, label: o.text })));

      if (unique_id) {
        const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
        setFormData(prev => ({
          ...prev,
          entry_date:      g('entry_date') || TODAY,
          batch_id:        g('batch_id'),
          entry_no:        g('entry_no'),
          starting_day:    g('starting_day'),
          day:             g('day'),
          hatching_status: g('hatching_status') || '1',
          remarks:         g('remarks'),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'batch_id') {
      if (!value) {
        setFormData(prev => ({ ...prev, entry_no: '', starting_day: '' }));
      } else {
        try {
          const payload = new URLSearchParams({ action: 'select_entry_date', batch_id: value });
          const res = await client.post('folders/status_update/crud.php', payload);
          // Backend returns comma separated string: entry_date,entry_no
          if (res.data) {
            const [sDay, eNo] = res.data.split(',');
            setFormData(prev => ({ ...prev, starting_day: sDay || '', entry_no: eNo || '' }));
          }
        } catch (err) {
          console.error('Error fetching batch info', err);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('action', 'createupdate');
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (unique_id) fd.append('unique_id', unique_id);
      files.forEach(f => fd.append('test_file[]', f));

      const res = await client.post('folders/status_update/crud.php', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/status_update/list');
      }
    } catch (err) {
      console.error(err);
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
                  Status Update {unique_id ? 'Update' : 'Create'}
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
                    <label htmlFor="entry_date">Entry Date</label>
                    <input type="date" id="entry_date" name="entry_date" className="form-control"
                      value={formData.entry_date} onChange={handleChange} required 
                      readOnly={!!formData.batch_id} />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="batch_id">Batch Id</label>
                    <select id="batch_id" name="batch_id" className="form-control"
                      value={formData.batch_id} onChange={handleChange} required>
                      {batchOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="entry_no">Entry No</label>
                    <input type="text" id="entry_no" name="entry_no" className="form-control"
                      value={formData.entry_no} readOnly />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="starting_day">Processing Started Day</label>
                    <input type="date" id="starting_day" name="starting_day" className="form-control"
                      value={formData.starting_day} readOnly />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="day">Day</label>
                    <input type="text" id="day" name="day" className="form-control"
                      value={formData.day} readOnly />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="hatching_status">Hatching Status</label>
                    <select id="hatching_status" name="hatching_status" className="form-control"
                      value={formData.hatching_status} onChange={handleChange} required>
                      {HATCHING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="test_file">Egg process Image Upload</label>
                    <input type="file" id="test_file" className="form-control" multiple
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                      onChange={e => setFiles(Array.from(e.target.files))} />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="remarks">Remarks</label>
                    <input type="text" id="remarks" name="remarks" className="form-control"
                      value={formData.remarks} onChange={handleChange} />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-md-12 text-end">
                    <button type="button" onClick={() => navigate('/status_update/list')} className="btn btn-danger me-2">
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
