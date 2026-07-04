import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';

const HARVEST_COMP_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

// Mini pipeline position banner — shows where screening sits in the overall process
function PipelinePosition() {
  const stages = [
    { id: 'screening', label: 'Screening', active: true },
    { id: 'egg',       label: 'Egg' },
    { id: 'culling',   label: 'Culling' },
    { id: 'processing',label: 'Processing' },
    { id: 'drying',    label: 'Drying' },
    { id: 'output',    label: 'Output' },
  ];

  return (
    <div className="pipeline-position-bar">
      {stages.map((s, i) => (
        <React.Fragment key={s.id}>
          <span className={`pipeline-stage ${s.active ? 'pipeline-stage--active' : ''}`}>
            {s.active && <span className="pipeline-dot" aria-hidden="true"></span>}
            {s.label}
          </span>
          {i < stages.length - 1 && (
            <span className="pipeline-arrow" aria-hidden="true">›</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Step indicator — 3 logical steps for this form
function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'Pit Selection' },
    { n: 2, label: 'Measurements' },
    { n: 3, label: 'Completion' },
  ];

  return (
    <div className="form-steps">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className={`form-step ${step >= s.n ? 'form-step--done' : ''} ${step === s.n ? 'form-step--active' : ''}`}>
            <div className="form-step__badge">{step > s.n ? <i className="ri-check-line"></i> : s.n}</div>
            <span className="form-step__label">{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`form-step__connector ${step > s.n ? 'form-step__connector--done' : ''}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ScreeningProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    pit: '',
    form_batch_id: '',
    larvae_qty: '',
    qty_manure_1: '',
    qty_manure_2: '',
    qty_rejets: '',
    notes: '',
    harvest_comp: 'completed',
  });

  const [pitOptions, setPitOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Derive current step from form state
  const currentStep = !formData.pit ? 1
    : (!formData.qty_manure_1 && !formData.qty_manure_2 && !formData.qty_rejets && !formData.larvae_qty) ? 2
    : 3;

  useEffect(() => {
    fetchPits();
    if (unique_id) fetchRecord();
  }, [unique_id]);

  const fetchPits = async () => {
    try {
      const res = await djangoClient.get('/pits', { params: { page_size: 100 } });
      setPitOptions((res.data.results || []).map((p) => ({ value: p.unique_id, label: p.pit_name })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/pit-status/${unique_id}`);
      const ps = res.data.data;
      setFormData({
        entry_date: ps.entry_date || new Date().toISOString().split('T')[0],
        pit: ps.pit?.unique_id || '',
        form_batch_id: ps.form_batch_id || '',
        larvae_qty: String(ps.larvae_qty ?? ''),
        qty_manure_1: String(ps.qty_manure_1 ?? ''),
        qty_manure_2: String(ps.qty_manure_2 ?? ''),
        qty_rejets: String(ps.qty_rejets ?? ''),
        notes: ps.notes || '',
        harvest_comp: ps.harvest_comp || 'completed',
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      entry_date: formData.entry_date,
      pit: { unique_id: formData.pit },
      org_status: '6',
      notes: formData.notes,
      larvae_qty: parseFloat(formData.larvae_qty) || 0,
      qty_manure_1: parseFloat(formData.qty_manure_1) || 0,
      qty_manure_2: parseFloat(formData.qty_manure_2) || 0,
      qty_rejets: parseFloat(formData.qty_rejets) || 0,
      harvest_comp: formData.harvest_comp,
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/pit-status/${unique_id}`, payload)
        : await djangoClient.post('/pit-status', payload);
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/screening_process/list');
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
        <div className="card">

          {/* Card header */}
          <div className="card-header">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
              <div>
                <h5>{unique_id ? 'Update' : 'New'} Screening Process</h5>
                <PipelinePosition />
              </div>
              <button
                type="button"
                onClick={() => navigate('/screening_process/list')}
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem', color: 'var(--vz-secondary-color)', border: '1px solid var(--vz-border-color)', borderRadius: 6 }}
              >
                <i className="ri-arrow-left-s-line"></i> Back to list
              </button>
            </div>

            {/* Step indicator */}
            {!unique_id && <StepIndicator step={currentStep} />}
          </div>

          <div className="card-body">
            {isLoading && !pitOptions.length && unique_id ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status" style={{ color: '#25a96b', width: 28, height: 28, borderWidth: 2.5 }}>
                  <span className="visually-hidden">Loading…</span>
                </div>
                <p className="mt-2 mb-0" style={{ fontSize: '0.8rem', color: 'var(--vz-secondary-color)' }}>Loading form data…</p>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">

                {/* ── Step 1: Pit Selection ── */}
                <p className="form-section-title">
                  <i className="ri-map-pin-2-line me-1"></i> Pit Selection
                </p>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <DateInput id="entry_date" name="entry_date" label="Entry Date"
                      value={formData.entry_date} onChange={handleChange} required />
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
                  {unique_id && (
                    <div className="col-12 col-md-3 mb-3">
                      <span className="form-label app-form-label d-block">Pit Batch Id</span>
                      <h5 className="mb-0">{formData.form_batch_id}</h5>
                    </div>
                  )}
                </div>

                {/* ── Step 2: Measurements ── */}
                <p className="form-section-title mt-2">
                  <i className="ri-scales-3-line me-1"></i> Measurements
                </p>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      min="0"
                      label="Qty of Live Larvae (kg)"
                      name="larvae_qty"
                      value={formData.larvae_qty}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      min="0"
                      label="Manure −4mm (kg)"
                      name="qty_manure_1"
                      value={formData.qty_manure_1}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      min="0"
                      label="Manure +4mm (kg)"
                      name="qty_manure_2"
                      value={formData.qty_manure_2}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      min="0"
                      label="Rejects (kg)"
                      name="qty_rejets"
                      value={formData.qty_rejets}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* ── Step 3: Completion ── */}
                <p className="form-section-title mt-2">
                  <i className="ri-checkbox-circle-line me-1"></i> Completion
                </p>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <Select
                      label="Harvest Status"
                      name="harvest_comp"
                      value={formData.harvest_comp}
                      onChange={handleChange}
                      options={HARVEST_COMP_OPTIONS}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <TextInput
                      label="Remarks"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Optional notes…"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="row mt-1">
                  <div className="col-12 text-end mt-2">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/screening_process/list')}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Saving…</>
                      ) : unique_id ? 'Update' : 'Save'}
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
