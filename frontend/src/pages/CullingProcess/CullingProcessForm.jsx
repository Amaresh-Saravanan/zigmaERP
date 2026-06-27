import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

const SHIFT_OPTIONS = [{ value: '1', label: 'Day' }, { value: '2', label: 'Night' }, { value: '3', label: 'General' }];
const CYLINDER_OPTIONS = [{ value: '1', label: 'O2' }, { value: '2', label: 'LPG' }, { value: '3', label: 'Other' }];
const WORK_DONE_OPTIONS = [{ value: '1', label: 'Cutting' }, { value: '2', label: 'Heating' }, { value: '3', label: 'Others' }];

const TODAY = new Date().toISOString().split('T')[0];

export default function CullingProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    shift_type: '1',
    cylinder_type: '1',
    cylinder_no: '',
    starting_weight: '',
    ending_weight: '',
    fuel_consumption: '',
    raw_material_weight: '',
    final_larvae_weight: '',
    work_done: '1',
    others_remarks: '',
  });
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchFormData();
  }, [unique_id]);

  // Auto-calculate fuel_consumption = starting_weight - ending_weight
  useEffect(() => {
    const s = parseFloat(formData.starting_weight);
    const e = parseFloat(formData.ending_weight);
    if (!isNaN(s) && !isNaN(e)) {
      setFormData(prev => ({ ...prev, fuel_consumption: (s - e).toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, fuel_consumption: '' }));
    }
  }, [formData.starting_weight, formData.ending_weight]);

  const fetchFormData = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(`folders/culling_process/form.php?unique_id=${unique_id}`, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
      setFormData({
        entry_date:           g('entry_date') || TODAY,
        shift_type:           g('shift_type') || '1',
        cylinder_type:        g('cylinder_type') || '1',
        cylinder_no:          g('cylinder_no'),
        starting_weight:      g('starting_weight'),
        ending_weight:        g('ending_weight'),
        fuel_consumption:     g('fuel_consumption'),
        raw_material_weight:  g('raw_material_weight'),
        final_larvae_weight:  g('final_larvae_weight'),
        work_done:            g('work_done') || '1',
        others_remarks:       g('others_remarks'),
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
      // Use FormData to support file uploads
      const fd = new FormData();
      fd.append('action', 'createupdate');
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (unique_id) fd.append('unique_id', unique_id);
      files.forEach(f => fd.append('test_file[]', f));

      const res = await client.post('folders/culling_process/crud.php', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/culling_process/list');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showOthersRemarks = formData.work_done === '3';

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  Culling Process {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>

          <div className="card-body">
            {isLoading && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">

                  <div className="col-md-3 mb-3">
                    <label htmlFor="entry_date">Work Date</label>
                    <input type="date" id="entry_date" name="entry_date" className="form-control"
                      value={formData.entry_date} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="shift_type">Shift Type</label>
                    <select id="shift_type" name="shift_type" className="form-control"
                      value={formData.shift_type} onChange={handleChange} required>
                      {SHIFT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="cylinder_type">Cylinder Type</label>
                    <select id="cylinder_type" name="cylinder_type" className="form-control"
                      value={formData.cylinder_type} onChange={handleChange} required>
                      {CYLINDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="cylinder_no">Cylinder No / ID</label>
                    <input type="text" id="cylinder_no" name="cylinder_no" className="form-control"
                      value={formData.cylinder_no} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="starting_weight">Starting Weight (Kg)</label>
                    <input type="number" step="0.01" id="starting_weight" name="starting_weight" className="form-control"
                      value={formData.starting_weight} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="ending_weight">Final Weight (Kg)</label>
                    <input type="number" step="0.01" id="ending_weight" name="ending_weight" className="form-control"
                      value={formData.ending_weight} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="fuel_consumption">Fuel Consumption (Kg)</label>
                    <input type="number" step="0.01" id="fuel_consumption" name="fuel_consumption" className="form-control"
                      value={formData.fuel_consumption} readOnly required />
                    <small className="text-muted">Auto-calculated: Starting − Final</small>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="raw_material_weight">Raw Material / Live Larvae (Kg)</label>
                    <input type="number" step="0.01" id="raw_material_weight" name="raw_material_weight" className="form-control"
                      value={formData.raw_material_weight} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="final_larvae_weight">Final Larvae After Culling (Kg)</label>
                    <input type="number" step="0.01" id="final_larvae_weight" name="final_larvae_weight" className="form-control"
                      value={formData.final_larvae_weight} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="work_done">Work Done</label>
                    <select id="work_done" name="work_done" className="form-control"
                      value={formData.work_done} onChange={handleChange} required>
                      {WORK_DONE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  {/* Conditional: shown only when Work Done = Others (3) */}
                  {showOthersRemarks && (
                    <div className="col-md-3 mb-3">
                      <label htmlFor="others_remarks">Others Remarks</label>
                      <input type="text" id="others_remarks" name="others_remarks" className="form-control"
                        value={formData.others_remarks} onChange={handleChange} required={showOthersRemarks} />
                    </div>
                  )}

                  <div className="col-md-3 mb-3">
                    <label htmlFor="test_file">Image Upload</label>
                    <input type="file" id="test_file" className="form-control" multiple accept="image/*"
                      onChange={e => setFiles(Array.from(e.target.files))} />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <button type="button" onClick={() => navigate('/culling_process/list')} className="btn btn-danger me-2">
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
