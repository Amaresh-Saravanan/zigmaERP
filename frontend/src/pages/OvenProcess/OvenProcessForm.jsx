import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import FileInput from '../../components/FileInput';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const TODAY = new Date().toISOString().split('T')[0];

// Calculate hours between two HH:MM time strings; handles overnight wrap-around
function calcRunningHours(start, close) {
  if (!start || !close) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  let diff = (ch * 60 + cm) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60; // overnight wrap-around
  return (diff / 60).toFixed(2);
}

export default function OvenProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    starting_time: '',
    closing_time: '',
    running_hours: '',
    diesel_topup: '',
    raw_larvae_process: '',
    dried_larvae_production: '',
    dried_larvae_stock: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  // ponytail: image capture is UI-only until OvenProcess gets an image field + multipart upload endpoint
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (unique_id) fetchRecord();
  }, [unique_id]);

  // Auto-calculate running_hours from time fields
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      running_hours: calcRunningHours(prev.starting_time, prev.closing_time),
    }));
  }, [formData.starting_time, formData.closing_time]);

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/oven-process/${unique_id}`);
      const op = res.data.data;
      setFormData({
        entry_date: op.entry_date || TODAY,
        starting_time: op.starting_time || '',
        closing_time: op.closing_time || '',
        running_hours: String(op.running_hours ?? ''),
        diesel_topup: String(op.diesel_topup ?? ''),
        raw_larvae_process: String(op.raw_larvae_process ?? ''),
        dried_larvae_production: String(op.dried_larvae_production ?? ''),
        dried_larvae_stock: String(op.dried_larvae_stock ?? ''),
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

    const payload = {
      entry_date: formData.entry_date,
      starting_time: formData.starting_time,
      closing_time: formData.closing_time,
      running_hours: parseFloat(formData.running_hours) || 0,
      diesel_topup: parseFloat(formData.diesel_topup) || 0,
      raw_larvae_process: parseFloat(formData.raw_larvae_process) || 0,
      dried_larvae_production: parseFloat(formData.dried_larvae_production) || 0,
      dried_larvae_stock: parseFloat(formData.dried_larvae_stock) || 0,
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/oven-process/${unique_id}`, payload)
        : await djangoClient.post('/oven-process', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/oven_process/list');
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
            title={`${unique_id ? 'Update' : 'New'} Oven Process`}
            backTo="/oven_process/list"
          />

          <div className="card-body">
            {isLoading && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <p className="form-section-title">
                  <i className="ri-time-line me-1"></i> Run Time
                </p>
                <div className="row">

                  <div className="col-12 col-md-3">
                    <DateInput
                      id="entry_date"
                      name="entry_date"
                      label="Date"
                      value={formData.entry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="time"
                      label="Start Time"
                      name="starting_time"
                      value={formData.starting_time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="time"
                      label="Close Time"
                      name="closing_time"
                      value={formData.closing_time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Total Run Hours"
                      name="running_hours"
                      value={formData.running_hours}
                      readOnly
                      required
                    >
                      <small className="text-muted">Auto-calculated (handles overnight)</small>
                    </TextInput>
                  </div>
                </div>

                <p className="form-section-title mt-2">
                  <i className="ri-scales-3-line me-1"></i> Production Quantities
                </p>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Diesel Top Up (Litres)"
                      name="diesel_topup"
                      value={formData.diesel_topup}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Total Raw (Live Larvae) Process (Kg)"
                      name="raw_larvae_process"
                      value={formData.raw_larvae_process}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Dried Larvae Production (Kg)"
                      name="dried_larvae_production"
                      value={formData.dried_larvae_production}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Dried Larvae Stock (Kg)"
                      name="dried_larvae_stock"
                      value={formData.dried_larvae_stock}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <FileInput
                      name="image_upload"
                      label="Image Upload"
                      onFilesChange={(files) => setImageFile(files?.[0] || null)}
                      multiple={false}
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/oven_process/list')}>
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
