import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const TODAY = new Date().toISOString().split('T')[0];

const LOCATIONS = [
  { value: '1', label: 'Weigh Bridge Side' },
  { value: '2', label: 'Solar Side' },
];

// ponytail: follows ItemCreationForm pattern — djangoClient JSON instead of PHP form parsing
export default function MeasurableForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    location: '',
    temp: '',
    humi: '',
    remarks: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchRecord();
  }, [unique_id]);

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/measurable/${unique_id}`);
      const d = res.data.data;
      setFormData({
        entry_date: d.entry_date || TODAY,
        location: d.location || '',
        temp: d.temp ?? '',
        humi: d.humi ?? '',
        remarks: d.remarks || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        entry_date: formData.entry_date,
        location: formData.location,
        temp: parseFloat(formData.temp),
        humi: parseFloat(formData.humi),
        remarks: formData.remarks,
      };

      const res = unique_id
        ? await djangoClient.put(`/measurable/${unique_id}`, payload)
        : await djangoClient.post('/measurable', payload);

      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/measurable/list');
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
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} Measurable`}
            backTo="/measurable/list"
          />

          <div className="card-body">
            {isLoading && !formData.location && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <p className="form-section-title">
                  <i className="ri-thermometer-line me-1"></i> Measurement Details
                </p>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <DateInput
                      id="entry_date"
                      name="entry_date"
                      label="Entry Date"
                      value={formData.entry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <Select
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      options={LOCATIONS}
                      placeholder="Select Location"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Temperature (C)"
                      name="temp"
                      value={formData.temp}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Humidity (%)"
                      name="humi"
                      value={formData.humi}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
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
                    <Button variant="danger" className="me-2" onClick={() => navigate('/measurable/list')}>
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
