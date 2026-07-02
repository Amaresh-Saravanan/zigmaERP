import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';

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
      <div className="col-12">
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
                      name="pit_id"
                      value={formData.pit_id}
                      onChange={handleChange}
                      options={options.pit_id}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Status"
                      name="org_status"
                      value={formData.org_status}
                      onChange={handleChange}
                      options={options.org_status}
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

                {/* Conditional Section 1: Organic Waste Added in Pit */}
                {formData.org_status === '1' && (
                  <div className="row border-top pt-3 mt-2">
                    <div className="col-12 col-md-3">
                      <TextInput
                        label="Feeding Count"
                        name="feed_count_name"
                        value={feedCountName}
                        readOnly
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
                )}

                {/* Conditional Section 2: Baby Larvae Added */}
                {formData.org_status === '2' && (
                  <div className="row border-top pt-3 mt-2">
                    <div className="col-12 col-md-3">
                      <Select
                        label="Batch Id"
                        name="batch_id"
                        value={formData.batch_id}
                        onChange={handleChange}
                        options={options.batch_id}
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
                      <label htmlFor="tray_no" className="form-label app-form-label">Tray No</label>
                      <select id="tray_no" name="tray_no" className="form-select app-form-control"
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
                    <div className="col-12 col-md-3">
                      <Select
                        label="Method"
                        name="method"
                        value={formData.method}
                        onChange={handleChange}
                        options={options.method}
                        placeholder="Select Method"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Section 4: Measurement */}
                {formData.org_status === '4' && (
                  <div className="row border-top pt-3 mt-2">
                    <div className="col-12 col-md-3">
                      <Select
                        label="Measurement Time"
                        name="measure_time"
                        value={formData.measure_time}
                        onChange={handleChange}
                        options={options.measure_time}
                        placeholder="Select Time"
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <TextInput type="number" step="0.01" label="Temperature(°c)" name="tempstart" className="mb-1" placeholder="Start"
                        value={formData.tempstart} onChange={handleChange} required />
                      <TextInput type="number" step="0.01" name="tempmid" className="mb-1" placeholder="Mid"
                        value={formData.tempmid} onChange={handleChange} required />
                      <TextInput type="number" step="0.01" name="tempend" placeholder="End"
                        value={formData.tempend} onChange={handleChange} required />
                    </div>
                    <div className="col-12 col-md-4">
                      <TextInput type="number" step="0.01" label="Humidity(%)" name="humistart" className="mb-1" placeholder="Start"
                        value={formData.humistart} onChange={handleChange} required />
                      <TextInput type="number" step="0.01" name="humimid" className="mb-1" placeholder="Mid"
                        value={formData.humimid} onChange={handleChange} required />
                      <TextInput type="number" step="0.01" name="humiend" placeholder="End"
                        value={formData.humiend} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                {/* Conditional Section 5: Harvesting */}
                {formData.org_status === '5' && (
                  <div className="row border-top pt-3 mt-2">
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
                      <Select
                        label="Harvest Status"
                        name="harvest_comp"
                        value={formData.harvest_comp}
                        onChange={handleChange}
                        options={options.harvest_comp}
                        placeholder="Select Status"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Section 7: Tippi */}
                {formData.org_status === '7' && (
                  <div className="row border-top pt-3 mt-2">
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
