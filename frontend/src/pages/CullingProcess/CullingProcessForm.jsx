import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchRecord();
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

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/culling-process/${unique_id}`);
      const cp = res.data.data;
      setFormData({
        entry_date: cp.entry_date || TODAY,
        shift_type: cp.shift_type || '1',
        cylinder_type: cp.cylinder_type || '1',
        cylinder_no: cp.cylinder_no || '',
        starting_weight: String(cp.starting_weight ?? ''),
        ending_weight: String(cp.ending_weight ?? ''),
        fuel_consumption: String(cp.fuel_consumption ?? ''),
        raw_material_weight: String(cp.raw_material_weight ?? ''),
        final_larvae_weight: String(cp.final_larvae_weight ?? ''),
        work_done: cp.work_done || '1',
        others_remarks: cp.others_remarks || '',
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
      shift_type: formData.shift_type,
      cylinder_type: formData.cylinder_type,
      cylinder_no: formData.cylinder_no,
      starting_weight: parseFloat(formData.starting_weight) || 0,
      ending_weight: parseFloat(formData.ending_weight) || 0,
      fuel_consumption: parseFloat(formData.fuel_consumption) || 0,
      raw_material_weight: parseFloat(formData.raw_material_weight) || 0,
      final_larvae_weight: parseFloat(formData.final_larvae_weight) || 0,
      work_done: formData.work_done,
      others_remarks: formData.others_remarks,
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/culling-process/${unique_id}`, payload)
        : await djangoClient.post('/culling-process', payload);
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
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} Culling Process`}
            backTo="/culling_process/list"
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
                  <i className="ri-user-settings-line me-1"></i> Shift & Cylinder Details
                </p>
                <div className="row">

                  <div className="col-12 col-md-3">
                    <DateInput
                      id="entry_date"
                      name="entry_date"
                      label="Work Date"
                      value={formData.entry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Shift Type"
                      name="shift_type"
                      value={formData.shift_type}
                      onChange={handleChange}
                      options={SHIFT_OPTIONS}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Cylinder Type"
                      name="cylinder_type"
                      value={formData.cylinder_type}
                      onChange={handleChange}
                      options={CYLINDER_OPTIONS}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      label="Cylinder No / ID"
                      name="cylinder_no"
                      value={formData.cylinder_no}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <p className="form-section-title mt-2">
                  <i className="ri-scales-3-line me-1"></i> Weight & Fuel Measurements
                </p>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Starting Weight (Kg)"
                      name="starting_weight"
                      value={formData.starting_weight}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Final Weight (Kg)"
                      name="ending_weight"
                      value={formData.ending_weight}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Fuel Consumption (Kg)"
                      name="fuel_consumption"
                      value={formData.fuel_consumption}
                      readOnly
                      required
                    >
                      <small className="text-muted">Auto-calculated: Starting − Final</small>
                    </TextInput>
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Raw Material / Live Larvae (Kg)"
                      name="raw_material_weight"
                      value={formData.raw_material_weight}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      label="Final Larvae After Culling (Kg)"
                      name="final_larvae_weight"
                      value={formData.final_larvae_weight}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <p className="form-section-title mt-2">
                  <i className="ri-checkbox-circle-line me-1"></i> Work Completion
                </p>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <Select
                      label="Work Done"
                      name="work_done"
                      value={formData.work_done}
                      onChange={handleChange}
                      options={WORK_DONE_OPTIONS}
                      required
                    />
                  </div>

                  {/* Conditional: shown only when Work Done = Others (3), required server-side too */}
                  {showOthersRemarks && (
                    <div className="col-12 col-md-3">
                      <TextInput
                        label="Others Remarks"
                        name="others_remarks"
                        value={formData.others_remarks}
                        onChange={handleChange}
                        required={showOthersRemarks}
                      />
                    </div>
                  )}
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/culling_process/list')}>
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
