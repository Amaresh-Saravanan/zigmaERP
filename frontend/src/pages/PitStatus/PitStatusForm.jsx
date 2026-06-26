import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

const TODAY = new Date().toISOString().split('T')[0];

export default function PitStatusForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: TODAY,
    pit_id: '',
    org_status: '',
    notes: '',
    batch_id: '',
    tray_no: [],
    tray_no_hide: '',
    feed_qty: '',
    feed_count: '',
    tippi_qty: '',
    method: '',
    measure_time: '',
    tempstart: '',
    tempmid: '',
    tempend: '',
    humistart: '',
    humimid: '',
    humiend: '',
    larvae_qty_in: '',
    larvae_qty: '',
    qty_manure_1: '',
    qty_manure_2: '',
    qty_manure_3: '',
    qty_rejets: '',
    harvest_comp: '',
    screen_unique_id: '',
    screen_unique_id_up: '',
    unique: unique_id || '',
  });

  const [options, setOptions] = useState({
    pit_id: [],
    org_status: [],
    batch_id: [],
    tray_no: [],
    method: [],
    measure_time: [],
    harvest_comp: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [feedCountName, setFeedCountName] = useState('');

  useEffect(() => {
    fetchFormHtml();
  }, [unique_id]);

  useEffect(() => {
    if (formData.org_status === '1' && formData.pit_id) {
      fetchFeedCount();
    }
  }, [formData.org_status, formData.pit_id]);

  useEffect(() => {
    if (formData.org_status === '2' && formData.batch_id) {
      fetchTrayOptions(formData.batch_id);
    }
  }, [formData.batch_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/pit_status/form.php?unique_id=${unique_id}`
        : `folders/pit_status/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      
      const parseOptions = (selector) => {
        const el = doc.querySelector(selector);
        return el ? Array.from(el.options).map(o => ({ value: o.value, label: o.text })) : [];
      };

      const newOptions = {
        pit_id: parseOptions('#pit_id'),
        org_status: parseOptions('#org_status'),
        batch_id: parseOptions('#batch_id'),
        method: parseOptions('#method'),
        measure_time: parseOptions('#measure_time'),
        harvest_comp: parseOptions('#harvest_comp'),
        tray_no: parseOptions('#tray_no'),
      };

      setOptions(newOptions);

      if (unique_id) {
        const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
        
        const traySelect = doc.querySelector('#tray_no');
        const selectedTrays = traySelect 
          ? Array.from(traySelect.options).filter(o => o.selected || o.hasAttribute('selected')).map(o => o.value)
          : [];

        setFormData(prev => ({
          ...prev,
          entry_date: g('entry_date') || TODAY,
          pit_id: g('pit_id'),
          org_status: g('org_status'),
          notes: g('notes'),
          batch_id: g('batch_id'),
          tray_no: selectedTrays,
          tray_no_hide: g('tray_no_hide'),
          feed_qty: g('feed_qty'),
          feed_count: g('feed_count'),
          tippi_qty: g('tippi_qty'),
          method: g('method'),
          measure_time: g('measure_time'),
          tempstart: g('tempstart'),
          tempmid: g('tempmid'),
          tempend: g('tempend'),
          humistart: g('humistart'),
          humimid: g('humimid'),
          humiend: g('humiend'),
          larvae_qty_in: g('larvae_qty_in'),
          larvae_qty: g('larvae_qty'),
          qty_manure_1: g('qty_manure_1'),
          qty_manure_2: g('qty_manure_2'),
          qty_manure_3: g('qty_manure_3'),
          qty_rejets: g('qty_rejets'),
          harvest_comp: g('harvest_comp'),
          screen_unique_id: g('screen_unique_id'),
          screen_unique_id_up: g('screen_unique_id_up'),
          unique: g('unique'),
        }));
      } else {
        const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
        setFormData(prev => ({
            ...prev,
            screen_unique_id: g('screen_unique_id'),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedCount = async () => {
    try {
      const params = new URLSearchParams();
      params.append('action', 'gen_feed_count');
      params.append('pit_id', formData.pit_id);
      params.append('unique', unique_id || '');
      const res = await client.post('folders/pit_status/crud.php', params);
      
      let count = parseInt(res.data?.feed_count) || 0;
      if (!unique_id) count += 1;

      setFormData(prev => ({ ...prev, feed_count: count }));
      
      const countNames = ['Zero', 'First Feeding', 'Second Feeding', 'Third Feeding', 'Fourth Feeding', 'Fifth Feeding', 'Sixth Feeding'];
      setFeedCountName(countNames[count] || `${count}th Feeding`);
    } catch (err) {
      console.error('Error fetching feed count', err);
    }
  };

  const fetchTrayOptions = async (batchId) => {
    // If updating, we might already have the tray options from HTML parsing
    if (unique_id && formData.batch_id === batchId && options.tray_no.length > 0) return;

    try {
      const params = new URLSearchParams();
      params.append('action', 'select_tray_no');
      params.append('batch_id', batchId);
      const res = await client.post('folders/pit_status/crud.php', params);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `<select>${res.data}</select>`;
      const parsedOptions = Array.from(tempDiv.querySelector('select').options).map(o => ({ value: o.value, label: o.text }));
      setOptions(prev => ({ ...prev, tray_no: parsedOptions }));
    } catch (err) {
      console.error('Error fetching trays', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      const values = Array.from(selectedOptions).map(opt => opt.value);
      setFormData(prev => ({ ...prev, [name]: values }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = new URLSearchParams();
      payload.append('action', 'createupdate');
      
      // Selectively append fields based on org_status
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'tray_no') {
          if (formData.org_status === '2') {
            val.forEach(v => payload.append('tray_no[]', v));
          }
        } else {
          payload.append(key, val);
        }
      });
      
      if (unique_id) payload.append('unique_id', unique_id);
      
      const pitSelect = document.getElementById('pit_id');
      const pitNameText = pitSelect?.options[pitSelect.selectedIndex]?.text || '';
      payload.append('pit_name', pitNameText);

      const res = await client.post('folders/pit_status/crud.php', payload);
      if (res.data?.msg === 'already') {
        alert('Record already exists.');
        return;
      }
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/pit_status/list');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-md-12 col-xxl-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  Pit Status {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>

          <div className="card-body">
            {isLoading && !options.pit_id.length ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  {/* Common Fields */}
                  <div className="col-md-3 mb-3">
                    <label htmlFor="entry_date">Entry Date</label>
                    <input type="date" id="entry_date" name="entry_date" className="form-control"
                      value={formData.entry_date} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="pit_id">Pit Number</label>
                    <select id="pit_id" name="pit_id" className="form-control"
                      value={formData.pit_id} onChange={handleChange} required>
                      {options.pit_id.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="org_status">Status</label>
                    <select id="org_status" name="org_status" className="form-control"
                      value={formData.org_status} onChange={handleChange} required>
                      {options.org_status.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="notes">Remarks</label>
                    <input type="text" id="notes" name="notes" className="form-control"
                      value={formData.notes} onChange={handleChange} />
                  </div>
                </div>

                {/* Conditional Section 1: Organic Waste Added in Pit */}
                {formData.org_status === '1' && (
                  <div className="row border-top pt-3 mt-2">
                    <div className="col-md-3 mb-3">
                      <label htmlFor="feed_count_name">Feeding Count</label>
                      <input type="text" id="feed_count_name" className="form-control" value={feedCountName} readOnly />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="feed_qty">Feeding Qty(Tons)</label>
                      <input type="number" step="0.01" id="feed_qty" name="feed_qty" className="form-control"
                        value={formData.feed_qty} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                {/* Conditional Section 2: Baby Larvae Added */}
                {formData.org_status === '2' && (
                  <div className="row border-top pt-3 mt-2">
                    <div className="col-md-3 mb-3">
                      <label htmlFor="batch_id">Batch Id</label>
                      <select id="batch_id" name="batch_id" className="form-control"
                        value={formData.batch_id} onChange={handleChange} required>
                        {options.batch_id.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="larvae_qty_in">Qty of Baby Larvae(kg)</label>
                      <input type="number" step="0.01" id="larvae_qty_in" name="larvae_qty_in" className="form-control"
                        value={formData.larvae_qty_in} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="tray_no">Tray No</label>
                      <select id="tray_no" name="tray_no" className="form-control"
                        multiple size="3" value={formData.tray_no} onChange={handleChange} required>
                        {options.tray_no.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
                    </div>
                  </div>
                )}

                {/* Conditional Section 3: Aeration Process */}
                {formData.org_status === '3' && (
                  <div className="row border-top pt-3 mt-2">
                    <div className="col-md-3 mb-3">
                      <label htmlFor="method">Method</label>
                      <select id="method" name="method" className="form-control"
                        value={formData.method} onChange={handleChange} required>
                        <option value="">Select Method</option>
                        {options.method.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Conditional Section 4: Measurement */}
                {formData.org_status === '4' && (
                  <div className="row border-top pt-3 mt-2">
                    <div className="col-md-3 mb-3">
                      <label htmlFor="measure_time">Measurement Time</label>
                      <select id="measure_time" name="measure_time" className="form-control"
                        value={formData.measure_time} onChange={handleChange} required>
                        <option value="">Select Time</option>
                        {options.measure_time.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="tempstart">Temperature(°c)</label>
                      <input type="number" step="0.01" id="tempstart" name="tempstart" className="form-control mb-1" placeholder="Start"
                        value={formData.tempstart} onChange={handleChange} required />
                      <input type="number" step="0.01" id="tempmid" name="tempmid" className="form-control mb-1" placeholder="Mid"
                        value={formData.tempmid} onChange={handleChange} required />
                      <input type="number" step="0.01" id="tempend" name="tempend" className="form-control" placeholder="End"
                        value={formData.tempend} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="humistart">Humidity(%)</label>
                      <input type="number" step="0.01" id="humistart" name="humistart" className="form-control mb-1" placeholder="Start"
                        value={formData.humistart} onChange={handleChange} required />
                      <input type="number" step="0.01" id="humimid" name="humimid" className="form-control mb-1" placeholder="Mid"
                        value={formData.humimid} onChange={handleChange} required />
                      <input type="number" step="0.01" id="humiend" name="humiend" className="form-control" placeholder="End"
                        value={formData.humiend} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                {/* Conditional Section 5: Harvesting */}
                {formData.org_status === '5' && (
                  <div className="row border-top pt-3 mt-2">
                    <div className="col-md-3 mb-3">
                      <label htmlFor="larvae_qty">Qty of Live Larvae(kg)</label>
                      <input type="number" step="0.01" id="larvae_qty" name="larvae_qty" className="form-control"
                        value={formData.larvae_qty} onChange={handleChange} required />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="harvest_comp">Harvest Status</label>
                      <select id="harvest_comp" name="harvest_comp" className="form-control"
                        value={formData.harvest_comp} onChange={handleChange} required>
                        <option value="">Select Status</option>
                        {options.harvest_comp.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Conditional Section 7: Tippi */}
                {formData.org_status === '7' && (
                  <div className="row border-top pt-3 mt-2">
                    <div className="col-md-3 mb-3">
                      <label htmlFor="tippi_qty">Qty(Kg)</label>
                      <input type="number" step="0.01" id="tippi_qty" name="tippi_qty" className="form-control"
                        value={formData.tippi_qty} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                <div className="row mt-2">
                  <div className="col-md-12 text-end">
                    <button type="button" onClick={() => navigate('/pit_status/list')} className="btn btn-danger me-2">
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
