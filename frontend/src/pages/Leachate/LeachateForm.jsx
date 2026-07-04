import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export default function LeachateForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    qty_leachate: '',
    remarks: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchRecord();
  }, [unique_id]);

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/leachate/${unique_id}`);
      const l = res.data.data;
      setFormData({
        entry_date: l.entry_date || TODAY,
        qty_leachate: String(l.qty_leachate ?? ''),
        remarks: l.remarks || '',
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
      qty_leachate: parseFloat(formData.qty_leachate) || 0,
      remarks: formData.remarks,
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/leachate/${unique_id}`, payload)
        : await djangoClient.post('/leachate', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/leachate/list');
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
            title={`${unique_id ? 'Update' : 'New'} Leachate`}
            backTo="/leachate/list"
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
                  <i className="ri-drop-line me-1"></i> Leachate Details
                </p>
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
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Qty Leachate(L)"
                      name="qty_leachate"
                      value={formData.qty_leachate}
                      onChange={handleChange}
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
                    <Button variant="danger" className="me-2" onClick={() => navigate('/leachate/list')}>
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
