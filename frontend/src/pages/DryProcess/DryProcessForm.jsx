import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import FileInput from '../../components/FileInput';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const TYPE_OPTIONS = [{ value: '1', label: 'Input' }, { value: '2', label: 'Output' }];
const METHOD_OPTIONS = [{ value: '1', label: 'Solar' }, { value: '2', label: 'Electric' }];

const TODAY = new Date().toISOString().split('T')[0];

export default function DryProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: TODAY,
    type: '1',
    drying_method: '1',
    quantity: '',
    qty_manure: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  // ponytail: image capture is UI-only until DryProcess gets an image field + multipart upload endpoint
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (unique_id) fetchRecord();
  }, [unique_id]);

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/dry-process/${unique_id}`);
      const dp = res.data.data;
      setFormData({
        date: dp.date || TODAY,
        type: dp.type || '1',
        drying_method: dp.drying_method || '1',
        quantity: String(dp.quantity ?? ''),
        qty_manure: String(dp.qty_manure ?? ''),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'type' && value === '1') {
        next.qty_manure = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      date: formData.date,
      type: formData.type,
      drying_method: formData.drying_method,
      quantity: parseFloat(formData.quantity) || 0,
      qty_manure: formData.type === '2' ? (parseFloat(formData.qty_manure) || 0) : 0,
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/dry-process/${unique_id}`, payload)
        : await djangoClient.post('/dry-process', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/dry_process/list');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showQtyManure = formData.type === '2';

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} Dry Process`}
            backTo="/dry_process/list"
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
                  <i className="ri-sun-line me-1"></i> Drying Details
                </p>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <DateInput
                      id="date"
                      name="date"
                      label="Date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      options={TYPE_OPTIONS}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Drying Method"
                      name="drying_method"
                      value={formData.drying_method}
                      onChange={handleChange}
                      options={METHOD_OPTIONS}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      min="1"
                      label="Quantity(kg)"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {showQtyManure && (
                    <div className="col-12 col-md-3">
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Qty Manure"
                        name="qty_manure"
                        value={formData.qty_manure}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  <div className="col-12 col-md-3">
                    <FileInput
                      label="Image Upload"
                      name="image"
                      multiple={false}
                      accept="image/*"
                      onFilesChange={(files) => setImageFile(files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/dry_process/list')}>
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
