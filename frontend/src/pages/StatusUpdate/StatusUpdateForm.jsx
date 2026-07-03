import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';

const TODAY = new Date().toISOString().split('T')[0];

const HATCHING_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'progressing', label: 'Progressing' },
  { value: 'completed', label: 'Completed' },
];

export default function StatusUpdateForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    batch: '',
    starting_day: '',
    day: '',
    hatching_status: 'pending',
    remarks: '',
  });

  const [staffId, setStaffId] = useState('');
  const [batchOptions, setBatchOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchBatches();
    if (unique_id) fetchRecord();
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
    }
  }, [formData.entry_date, formData.starting_day]);

  const fetchCurrentUser = async () => {
    try {
      const res = await djangoClient.get('/auth/me');
      setStaffId(res.data.data.unique_id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await djangoClient.get('/material-received', { params: { page_size: 100 } });
      setBatchOptions((res.data.results || []).map((b) => ({ value: b.unique_id, label: b.batch_id, date: b.date })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/status-update/${unique_id}`);
      const su = res.data.data;
      setFormData({
        entry_date: su.entry_date || TODAY,
        batch: su.batch?.unique_id || '',
        starting_day: '',
        day: String(su.day ?? ''),
        hatching_status: su.hatching_status || 'pending',
        remarks: su.remarks || '',
      });
      setStaffId(su.staff?.unique_id || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'batch') {
      const selected = batchOptions.find((b) => b.value === value);
      setFormData(prev => ({ ...prev, starting_day: selected?.date || '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      entry_date: formData.entry_date,
      staff: { unique_id: staffId },
      batch: { unique_id: formData.batch },
      day: parseInt(formData.day, 10) || 0,
      hatching_status: formData.hatching_status,
      remarks: formData.remarks,
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/status-update/${unique_id}`, payload)
        : await djangoClient.post('/status-update', payload);
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
      <div className="col-12">
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
                  <div className="col-12 col-md-3">
                    <DateInput
                      id="entry_date"
                      name="entry_date"
                      label="Entry Date"
                      value={formData.entry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Batch Id"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      options={batchOptions}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <DateInput
                      id="starting_day"
                      name="starting_day"
                      label="Processing Started Day"
                      value={formData.starting_day}
                      disabled
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      label="Day"
                      name="day"
                      value={formData.day}
                      readOnly
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Hatching Status"
                      name="hatching_status"
                      value={formData.hatching_status}
                      onChange={handleChange}
                      options={HATCHING_OPTIONS}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      label="Remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/status_update/list')}>
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
