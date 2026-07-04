import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const TODAY = new Date().toISOString().split('T')[0];

// '6' (Vibro Screen) is owned by ScreeningProcessForm against this same backend model.
const ORG_STATUS_OPTIONS = [
  { value: '1', label: 'Organic Waste Added in Pit' },
  { value: '2', label: 'Baby Larvae Added' },
  { value: '3', label: 'Aeration Process' },
  { value: '4', label: 'Measurement' },
  { value: '5', label: 'Harvesting' },
  { value: '7', label: 'Tippi' },
];
const METHOD_OPTIONS = [
  { value: 'Machine', label: 'Machine' },
  { value: 'Manual', label: 'Manual' },
];
const MEASURE_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
];
const HARVEST_COMP_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const REQUIRED_FIELDS_BY_STATUS = {
  '1': ['feed_qty', 'feed_count'],
  '2': ['batch', 'larvae_qty_in'],
  '3': ['method'],
  '4': ['measure_time', 'temp_start', 'temp_mid', 'temp_end', 'humi_start', 'humi_mid', 'humi_end'],
  '5': ['larvae_qty', 'qty_manure_1', 'qty_manure_2', 'qty_manure_3', 'qty_rejets', 'harvest_comp'],
  '7': ['tippi_qty'],
};

export default function PitStatusForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    pit: '',
    org_status: '',
    notes: '',
    feed_qty: '',
    feed_count: '',
    batch: '',
    larvae_qty_in: '',
    method: '',
    measure_time: '',
    temp_start: '',
    temp_mid: '',
    temp_end: '',
    humi_start: '',
    humi_mid: '',
    humi_end: '',
    larvae_qty: '',
    qty_manure_1: '',
    qty_manure_2: '',
    qty_manure_3: '',
    qty_rejets: '',
    harvest_comp: '',
    tippi_qty: '',
  });
  const [selectedTrays, setSelectedTrays] = useState([]);

  const [pitOptions, setPitOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [trayOptions, setTrayOptions] = useState([]);
  const [pitStatusRecords, setPitStatusRecords] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPits();
    fetchBatches();
    fetchTrays();
    fetchPitStatusRecords();
    if (unique_id) fetchRecord();
  }, [unique_id]);

  // ponytail: feed-count suggestion approximated from the last 100 records (no per-pit
  // filter on the API); good enough for this pit's recent history, add a dedicated
  // aggregation endpoint if pit_status volume ever exceeds that.
  useEffect(() => {
    if (unique_id || formData.org_status !== '1' || !formData.pit) return;
    const forPit = pitStatusRecords.filter((r) => r.pit?.unique_id === formData.pit && r.org_status === '1');
    const maxCount = forPit.reduce((max, r) => Math.max(max, r.feed_count || 0), 0);
    setFormData((prev) => ({ ...prev, feed_count: String(maxCount + 1) }));
  }, [formData.org_status, formData.pit, pitStatusRecords, unique_id]);

  const fetchPits = async () => {
    try {
      const res = await djangoClient.get('/pits', { params: { page_size: 100 } });
      setPitOptions((res.data.results || []).map((p) => ({ value: p.unique_id, label: p.pit_name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await djangoClient.get('/material-received', { params: { page_size: 100 } });
      setBatchOptions((res.data.results || []).map((b) => ({ value: b.unique_id, label: b.batch_id })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrays = async () => {
    try {
      const res = await djangoClient.get('/trays', { params: { page_size: 100 } });
      setTrayOptions((res.data.results || []).map((t) => ({ value: t.unique_id, label: t.bin_name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPitStatusRecords = async () => {
    try {
      const res = await djangoClient.get('/pit-status', { params: { page_size: 100 } });
      setPitStatusRecords(res.data.results || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/pit-status/${unique_id}`);
      const ps = res.data.data;
      setFormData({
        entry_date: ps.entry_date || TODAY,
        pit: ps.pit?.unique_id || '',
        org_status: ps.org_status || '',
        notes: ps.notes || '',
        feed_qty: String(ps.feed_qty ?? ''),
        feed_count: String(ps.feed_count ?? ''),
        batch: ps.batch?.unique_id || '',
        larvae_qty_in: String(ps.larvae_qty_in ?? ''),
        method: ps.method || '',
        measure_time: ps.measure_time || '',
        temp_start: String(ps.temp_start ?? ''),
        temp_mid: String(ps.temp_mid ?? ''),
        temp_end: String(ps.temp_end ?? ''),
        humi_start: String(ps.humi_start ?? ''),
        humi_mid: String(ps.humi_mid ?? ''),
        humi_end: String(ps.humi_end ?? ''),
        larvae_qty: String(ps.larvae_qty ?? ''),
        qty_manure_1: String(ps.qty_manure_1 ?? ''),
        qty_manure_2: String(ps.qty_manure_2 ?? ''),
        qty_manure_3: String(ps.qty_manure_3 ?? ''),
        qty_rejets: String(ps.qty_rejets ?? ''),
        harvest_comp: ps.harvest_comp || '',
        tippi_qty: String(ps.tippi_qty ?? ''),
      });
      setSelectedTrays((ps.trays || []).map((t) => t.unique_id));
    } catch (error) {
      console.error(error);
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

  const NUMBER_FIELDS = new Set([
    'feed_qty', 'feed_count', 'larvae_qty_in', 'temp_start', 'temp_mid', 'temp_end',
    'humi_start', 'humi_mid', 'humi_end', 'larvae_qty', 'qty_manure_1', 'qty_manure_2',
    'qty_manure_3', 'qty_rejets', 'tippi_qty',
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      entry_date: formData.entry_date,
      pit: { unique_id: formData.pit },
      org_status: formData.org_status,
      notes: formData.notes,
    };

    for (const field of REQUIRED_FIELDS_BY_STATUS[formData.org_status] || []) {
      if (field === 'batch') {
        payload.batch = { unique_id: formData.batch };
      } else {
        payload[field] = NUMBER_FIELDS.has(field) ? parseFloat(formData[field]) || 0 : formData[field];
      }
    }
    if (formData.org_status === '2') {
      payload.trays = selectedTrays.map((id) => ({ unique_id: id }));
    }

    try {
      const res = unique_id
        ? await djangoClient.put(`/pit-status/${unique_id}`, payload)
        : await djangoClient.post('/pit-status', payload);

      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/pit_status/list');
      }
    } catch (error) {
      console.error('An error occurred while saving.', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} Pit Status`}
            backTo="/pit_status/list"
          />

          <div className="card-body">
            {isLoading && !pitOptions.length && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <p className="form-section-title">
                  <i className="ri-map-pin-2-line me-1"></i> Status Selection
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
                      label="Pit Number"
                      name="pit"
                      value={formData.pit}
                      onChange={handleChange}
                      options={pitOptions}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Status"
                      name="org_status"
                      value={formData.org_status}
                      onChange={handleChange}
                      options={ORG_STATUS_OPTIONS}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      label="Remarks"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {formData.org_status === '1' && (
                  <>
                    <p className="form-section-title mt-2">
                      <i className="ri-plant-line me-1"></i> Feeding Details
                    </p>
                    <div className="row">
                    <div className="col-12 col-md-3">
                      <TextInput
                        label="Feeding Count"
                        name="feed_count"
                        value={formData.feed_count}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Feeding Qty(Tons)"
                        name="feed_qty"
                        value={formData.feed_qty}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    </div>
                  </>
                )}

                {formData.org_status === '2' && (
                  <>
                    <p className="form-section-title mt-2">
                      <i className="ri-seedling-line me-1"></i> Baby Larvae Intake
                    </p>
                    <div className="row">
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
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Qty of Baby Larvae(kg)"
                        name="larvae_qty_in"
                        value={formData.larvae_qty_in}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6 mb-3">
                      <label className="form-label app-form-label d-block">Tray No</label>
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
                  </>
                )}

                {formData.org_status === '3' && (
                  <>
                    <p className="form-section-title mt-2">
                      <i className="ri-windy-line me-1"></i> Aeration Method
                    </p>
                    <div className="row">
                    <div className="col-12 col-md-3">
                      <Select
                        label="Method"
                        name="method"
                        value={formData.method}
                        onChange={handleChange}
                        options={METHOD_OPTIONS}
                        placeholder="Select Method"
                        required
                      />
                    </div>
                    </div>
                  </>
                )}

                {formData.org_status === '4' && (
                  <>
                    <p className="form-section-title mt-2">
                      <i className="ri-thermometer-line me-1"></i> Temperature & Humidity
                    </p>
                    <div className="row">
                    <div className="col-12 col-md-3">
                      <Select
                        label="Measurement Time"
                        name="measure_time"
                        value={formData.measure_time}
                        onChange={handleChange}
                        options={MEASURE_TIME_OPTIONS}
                        placeholder="Select Time"
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <TextInput type="number" step="0.01" label="Temperature(°c)" name="temp_start" className="mb-1" placeholder="Start"
                        value={formData.temp_start} onChange={handleChange} required />
                      <TextInput type="number" step="0.01" name="temp_mid" className="mb-1" placeholder="Mid"
                        value={formData.temp_mid} onChange={handleChange} required />
                      <TextInput type="number" step="0.01" name="temp_end" placeholder="End"
                        value={formData.temp_end} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-4">
                      <TextInput type="number" step="0.01" label="Humidity(%)" name="humi_start" className="mb-1" placeholder="Start"
                        value={formData.humi_start} onChange={handleChange} required />
                      <TextInput type="number" step="0.01" name="humi_mid" className="mb-1" placeholder="Mid"
                        value={formData.humi_mid} onChange={handleChange} required />
                      <TextInput type="number" step="0.01" name="humi_end" placeholder="End"
                        value={formData.humi_end} onChange={handleChange} required />
                    </div>
                    </div>
                  </>
                )}

                {formData.org_status === '5' && (
                  <>
                    <p className="form-section-title mt-2">
                      <i className="ri-scales-3-line me-1"></i> Harvest Measurements
                    </p>
                    <div className="row">
                    <div className="col-12 col-md-3">
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Qty of Live Larvae(kg)"
                        name="larvae_qty"
                        value={formData.larvae_qty}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Qty of Manure 1(kg)"
                        name="qty_manure_1"
                        value={formData.qty_manure_1}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Qty of Manure 2(kg)"
                        name="qty_manure_2"
                        value={formData.qty_manure_2}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Qty of Manure 3(kg)"
                        name="qty_manure_3"
                        value={formData.qty_manure_3}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Qty of Rejects(kg)"
                        name="qty_rejets"
                        value={formData.qty_rejets}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <Select
                        label="Harvest Status"
                        name="harvest_comp"
                        value={formData.harvest_comp}
                        onChange={handleChange}
                        options={HARVEST_COMP_OPTIONS}
                        placeholder="Select Status"
                        required
                      />
                    </div>
                    </div>
                  </>
                )}

                {formData.org_status === '7' && (
                  <>
                    <p className="form-section-title mt-2">
                      <i className="ri-scales-3-line me-1"></i> Tippi Quantity
                    </p>
                    <div className="row">
                    <div className="col-12 col-md-3">
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Qty(Kg)"
                        name="tippi_qty"
                        value={formData.tippi_qty}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    </div>
                  </>
                )}

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/pit_status/list')}>
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
