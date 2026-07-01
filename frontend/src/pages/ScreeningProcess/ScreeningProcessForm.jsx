import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

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
    pit_id: '',
    batch_id: '',
    qty_manure_1: '',
    qty_manure_2: '',
    qty_rejets: '',
    notes: '',
    harvest_comp: '2',
  });

  const [pitOptions, setPitOptions] = useState([]);
  const [harvestOptions, setHarvestOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  // Derive current step from form state
  const currentStep = !formData.pit_id ? 1
    : (!formData.qty_manure_1 && !formData.qty_manure_2 && !formData.qty_rejets) ? 2
    : 3;

  useEffect(() => { fetchFormHtml(); }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id
        ? `folders/screening_process/form.php?unique_id=${unique_id}`
        : `folders/screening_process/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');

      const g = (id) => doc.querySelector(`#${id}`);

      setFormData({
        entry_date:   g('entry_date')?.value   || new Date().toISOString().split('T')[0],
        pit_id:       g('pit_id')?.value       || '',
        batch_id:     g('batch_id')?.value     || '',
        qty_manure_1: g('qty_manure_1')?.value || '',
        qty_manure_2: g('qty_manure_2')?.value || '',
        qty_rejets:   g('qty_rejets')?.value   || '',
        notes:        g('notes')?.value        || '',
        harvest_comp: g('harvest_comp')?.value || '2',
      });

      if (g('pit_id'))      setPitOptions(Array.from(g('pit_id').options).map(o => ({ value: o.value, label: o.text })));
      if (g('harvest_comp')) setHarvestOptions(Array.from(g('harvest_comp').options).map(o => ({ value: o.value, label: o.text })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'pit_id') {
      setFormData(prev => ({ ...prev, batch_id: '', pit_id: value }));
      if (!value) return;
      setBatchLoading(true);
      try {
        const res = await client.post('folders/screening_process/crud.php',
          new URLSearchParams({ action: 'get_form_batch_id_vibro', pit_id: value }));
        setFormData(prev => ({ ...prev, batch_id: String(res.data).trim() }));
      } catch (err) {
        console.error('Error fetching batch ID', err);
      } finally {
        setBatchLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = new URLSearchParams({ action: 'createupdate', ...formData });
      if (unique_id) payload.append('unique_id', unique_id);
      const res = await client.post('folders/screening_process/crud.php', payload);
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
                  <div className="col-md-3 mb-3">
                    <label htmlFor="entry_date">Entry Date</label>
                    <input type="date" className="form-control" id="entry_date" name="entry_date"
                      value={formData.entry_date} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="pit_id">Pit Number</label>
                    <select id="pit_id" name="pit_id" className="form-control"
                      value={formData.pit_id} onChange={handleChange} required>
                      {pitOptions.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="batch_id" className="label-computed">Pit Batch Id</label>
                    <div className="position-relative">
                      <input id="batch_id" name="batch_id" className="form-control"
                        readOnly value={formData.batch_id}
                        placeholder={batchLoading ? 'Fetching…' : 'Auto-filled from pit'} />
                      {batchLoading && (
                        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                          <div className="spinner-border spinner-border-sm" role="status" style={{ color: '#25a96b', width: 14, height: 14, borderWidth: 2 }}>
                            <span className="visually-hidden">Loading batch…</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Step 2: Measurements ── */}
                <p className="form-section-title mt-2">
                  <i className="ri-scales-3-line me-1"></i> Measurements
                </p>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="qty_manure_1">Manure &minus;4mm (kg)</label>
                    <input type="number" step="0.01" min="0" id="qty_manure_1" name="qty_manure_1"
                      className="form-control" value={formData.qty_manure_1} onChange={handleChange}
                      placeholder="0.00" />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="qty_manure_2">Manure +4mm (kg)</label>
                    <input type="number" step="0.01" min="0" id="qty_manure_2" name="qty_manure_2"
                      className="form-control" value={formData.qty_manure_2} onChange={handleChange}
                      placeholder="0.00" />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="qty_rejets">Rejects (kg)</label>
                    <input type="number" step="0.01" min="0" id="qty_rejets" name="qty_rejets"
                      className="form-control" value={formData.qty_rejets} onChange={handleChange}
                      placeholder="0.00" />
                  </div>
                </div>

                {/* ── Step 3: Completion ── */}
                <p className="form-section-title mt-2">
                  <i className="ri-checkbox-circle-line me-1"></i> Completion
                </p>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="harvest_comp">Harvest Status</label>
                    <select id="harvest_comp" name="harvest_comp" className="form-control"
                      value={formData.harvest_comp} onChange={handleChange} required>
                      {harvestOptions.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="notes">Remarks</label>
                    <input type="text" name="notes" id="notes" className="form-control"
                      value={formData.notes} onChange={handleChange}
                      placeholder="Optional notes…" />
                  </div>
                </div>

                {/* Actions */}
                <div className="row mt-1">
                  <div className="col-12 text-end mt-2">
                    <button type="button" onClick={() => navigate('/screening_process/list')} className="btn btn-danger me-2">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success" disabled={isLoading || batchLoading}>
                      {isLoading ? (
                        <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Saving…</>
                      ) : unique_id ? 'Update' : 'Save'}
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
