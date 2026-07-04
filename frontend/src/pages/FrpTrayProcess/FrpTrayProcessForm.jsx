import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const TODAY = new Date().toISOString().split('T')[0];

export default function FrpTrayProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    batch: '',
    frp_tray_count: '',
  });
  const [selectedTrays, setSelectedTrays] = useState([]);

  const [batchOptions, setBatchOptions] = useState([]);
  const [trayOptions, setTrayOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBatches();
    fetchTrays();
    if (unique_id) fetchRecord();
  }, [unique_id]);

  const fetchBatches = async () => {
    try {
      const res = await djangoClient.get('/material-received', { params: { page_size: 100 } });
      setBatchOptions((res.data.results || []).map((b) => ({ value: b.unique_id, label: b.batch_id })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrays = async () => {
    try {
      const res = await djangoClient.get('/trays', { params: { page_size: 100 } });
      setTrayOptions((res.data.results || []).map((t) => ({ value: t.unique_id, label: t.bin_name })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/frp-tray-process/${unique_id}`);
      const fp = res.data.data;
      setFormData({
        entry_date: fp.entry_date || TODAY,
        batch: fp.batch?.unique_id || '',
        frp_tray_count: String(fp.frp_tray_count ?? ''),
      });
      setSelectedTrays((fp.trays || []).map((t) => t.unique_id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTrayToggle = (trayId) => {
    setSelectedTrays((prev) =>
      prev.includes(trayId) ? prev.filter((id) => id !== trayId) : [...prev, trayId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (parseInt(formData.frp_tray_count, 10) !== selectedTrays.length) {
      alert(`Validation Error: FRP Tray Count (${formData.frp_tray_count}) must equal the number of selected trays (${selectedTrays.length}).`);
      return;
    }

    setIsLoading(true);
    const payload = {
      entry_date: formData.entry_date,
      batch: { unique_id: formData.batch },
      frp_tray_count: parseInt(formData.frp_tray_count, 10) || 0,
      trays: selectedTrays.map((id) => ({ unique_id: id })),
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/frp-tray-process/${unique_id}`, payload)
        : await djangoClient.post('/frp-tray-process', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/frp_tray_process/list');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setErrorMsg(err.response.data?.error || 'This batch already exists.');
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} FRP Tray Process`}
            backTo="/frp_tray_process/list"
          />

          <div className="card-body">
            {isLoading && !batchOptions.length && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
                <p className="form-section-title">
                  <i className="ri-stack-line me-1"></i> Tray Assignment
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
                    <Select
                      label="Egg Batch Id"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      options={batchOptions}
                      required
                      disabled={!!unique_id}
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      min="1"
                      label="FRP Tray Count"
                      name="frp_tray_count"
                      value={formData.frp_tray_count}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3 mb-3">
                    <label className="form-label app-form-label d-block">
                      FRP Tray Name ({selectedTrays.length})
                    </label>
                    <div className="d-flex flex-wrap gap-3">
                      {trayOptions.map((tray) => (
                        <div key={tray.value} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`tray_${tray.value}`}
                            checked={selectedTrays.includes(tray.value)}
                            onChange={() => handleTrayToggle(tray.value)}
                          />
                          <label className="form-check-label" htmlFor={`tray_${tray.value}`}>
                            {tray.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/frp_tray_process/list')}>
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
