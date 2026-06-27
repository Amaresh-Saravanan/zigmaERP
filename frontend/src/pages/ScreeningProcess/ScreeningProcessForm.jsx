import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

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

  useEffect(() => {
    fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/screening_process/form.php?unique_id=${unique_id}`
        : `folders/screening_process/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      const inputs = {
        entry_date: doc.querySelector('#entry_date'),
        pit_id: doc.querySelector('#pit_id'),
        batch_id: doc.querySelector('#batch_id'),
        qty_manure_1: doc.querySelector('#qty_manure_1'),
        qty_manure_2: doc.querySelector('#qty_manure_2'),
        qty_rejets: doc.querySelector('#qty_rejets'),
        notes: doc.querySelector('#notes'),
        harvest_comp: doc.querySelector('#harvest_comp'),
      };

      setFormData({
        entry_date: inputs.entry_date ? inputs.entry_date.value : new Date().toISOString().split('T')[0],
        pit_id: inputs.pit_id ? inputs.pit_id.value : '',
        batch_id: inputs.batch_id ? inputs.batch_id.value : '',
        qty_manure_1: inputs.qty_manure_1 ? inputs.qty_manure_1.value : '',
        qty_manure_2: inputs.qty_manure_2 ? inputs.qty_manure_2.value : '',
        qty_rejets: inputs.qty_rejets ? inputs.qty_rejets.value : '',
        notes: inputs.notes ? inputs.notes.value : '',
        harvest_comp: inputs.harvest_comp ? inputs.harvest_comp.value : '2',
      });

      if (inputs.pit_id) {
        setPitOptions(Array.from(inputs.pit_id.options).map(opt => ({
          value: opt.value,
          label: opt.text
        })));
      }

      if (inputs.harvest_comp) {
        setHarvestOptions(Array.from(inputs.harvest_comp.options).map(opt => ({
          value: opt.value,
          label: opt.text
        })));
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'pit_id') {
      fetchBatchId(value);
    }
  };

  const fetchBatchId = async (pitId) => {
    if (!pitId) {
      setFormData(prev => ({ ...prev, batch_id: '' }));
      return;
    }
    try {
      const payload = new URLSearchParams();
      payload.append('action', 'get_form_batch_id_vibro');
      payload.append('pit_id', pitId);
      const res = await client.post('folders/screening_process/crud.php', payload);
      // The PHP script likely returns the batch_id directly as text or within a json.
      // Adjusting based on common patterns in this project, it might just return the ID text.
      const batchId = res.data; 
      setFormData(prev => ({ ...prev, batch_id: batchId.trim() }));
    } catch (error) {
      console.error('Error fetching batch ID', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = new URLSearchParams();
    payload.append('action', 'createupdate');
    Object.keys(formData).forEach(key => {
      payload.append(key, formData[key]);
    });
    
    if (unique_id) {
      payload.append('unique_id', unique_id);
    }

    try {
      const res = await client.post('folders/screening_process/crud.php', payload);
      const json = res.data;

      if (json.msg === 'create' || json.msg === 'update') {
        navigate('/screening_process/list');
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
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  Screening Process {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !pitOptions.length && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="entry_date">Entry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="entry_date"
                      name="entry_date"
                      value={formData.entry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="pit_id" className="form-label">Pit Number</label>
                    <select
                      id="pit_id"
                      name="pit_id"
                      className="form-control"
                      value={formData.pit_id}
                      onChange={handleChange}
                      required
                    >
                      {pitOptions.map((opt, i) => (
                        <option key={i} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="batch_id" className="form-label">Pit Batch Id</label>
                    <input
                      id="batch_id"
                      name="batch_id"
                      className="form-control"
                      readOnly
                      value={formData.batch_id}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="qty_manure_1" className="form-label">Qty of Manure(-4mm)(kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      id="qty_manure_1"
                      name="qty_manure_1"
                      className="form-control"
                      value={formData.qty_manure_1}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="qty_manure_2" className="form-label">Qty of Manure(+4mm)(kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      id="qty_manure_2"
                      name="qty_manure_2"
                      className="form-control"
                      value={formData.qty_manure_2}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="qty_rejets" className="form-label">Qty of Rejects(kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      id="qty_rejets"
                      name="qty_rejets"
                      className="form-control"
                      value={formData.qty_rejets}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="notes">Remarks</label>
                    <input
                      type="text"
                      name="notes"
                      id="notes"
                      className="form-control"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="harvest_comp" className="form-label">Harvest Status</label>
                    <select
                      id="harvest_comp"
                      name="harvest_comp"
                      className="form-control"
                      value={formData.harvest_comp}
                      onChange={handleChange}
                      required
                    >
                      {harvestOptions.map((opt, i) => (
                        <option key={i} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <button type="button" onClick={() => navigate('/screening_process/list')} className="btn btn-danger me-2">
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
