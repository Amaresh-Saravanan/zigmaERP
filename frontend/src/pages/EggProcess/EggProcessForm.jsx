import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import DateInput from '../../components/DateInput';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';

export default function EggProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_no: '',
    entry_date: new Date().toISOString().split('T')[0],
    batch_id: '',
    supplier_name: '',
    supplier_name1: '',
    tot_qty: '',
    tray_utilized: '',
    checkedvalue: '',
    screen_unique_id: '',
  });

  const [batchOptions, setBatchOptions] = useState([]);
  const [trayOptions, setTrayOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  
  const [selectedTrays, setSelectedTrays] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [showTrayModal, setShowTrayModal] = useState(false);
  const [showAddOnModal, setShowAddOnModal] = useState(false);

  useEffect(() => {
    fetchFormHtml();
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const url = unique_id 
        ? `folders/egg_process/form.php?unique_id=${unique_id}`
        : `folders/egg_process/form.php`;
      const res = await client.get(url, { responseType: 'text' });
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      // Extract batch options
      const batchSelect = doc.querySelector('#batch_id');
      if (batchSelect) {
        setBatchOptions(Array.from(batchSelect.options).map(opt => ({
          value: opt.value,
          label: opt.text
        })));
      }

      // Extract item options for add-ons
      const itemSelect = doc.querySelector('#item_name');
      if (itemSelect) {
        setItemOptions(Array.from(itemSelect.options).map(opt => ({
          value: opt.value,
          label: opt.text,
          unit: opt.getAttribute('data-unit') || ''
        })));
      }

      // Extract tray options from the modal table
      const trayCheckboxes = Array.from(doc.querySelectorAll('input[name="option[]"]'));
      setTrayOptions(trayCheckboxes.map(cb => ({
        id: cb.value,
        name: cb.getAttribute('data-tray-name') || cb.value,
        checked: cb.hasAttribute('checked') || selectedTrays.includes(cb.value)
      })));

      // Initialize form data
      setFormData({
        entry_no: doc.querySelector('#entry_no') ? doc.querySelector('#entry_no').value : '',
        entry_date: doc.querySelector('#entry_date') ? doc.querySelector('#entry_date').value : new Date().toISOString().split('T')[0],
        batch_id: doc.querySelector('#batch_id') ? doc.querySelector('#batch_id').value : '',
        supplier_name: doc.querySelector('#supplier_name') ? doc.querySelector('#supplier_name').value : '',
        supplier_name1: doc.querySelector('#supplier_name1') ? doc.querySelector('#supplier_name1').value : '',
        tot_qty: doc.querySelector('#tot_qty') ? doc.querySelector('#tot_qty').value : '',
        tray_utilized: doc.querySelector('#tray_utilized') ? doc.querySelector('#tray_utilized').value : '',
        checkedvalue: doc.querySelector('#checkedvalue') ? doc.querySelector('#checkedvalue').value : '',
        screen_unique_id: doc.querySelector('#screen_unique_id') ? doc.querySelector('#screen_unique_id').value : '',
      });

      // Initialize selected trays from checkedvalue
      const checkedVal = doc.querySelector('#checkedvalue');
      if (checkedVal && checkedVal.value) {
        setSelectedTrays(checkedVal.value.split(',').filter(Boolean));
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

    if (name === 'batch_id') {
      fetchBatchDetails(value);
    }
  };

  const fetchBatchDetails = async (batchId) => {
    if (!batchId) return;
    try {
      const payload = new URLSearchParams();
      payload.append('action', 'problem');
      payload.append('ticket_no', batchId);
      const res = await client.post('folders/egg_process/crud.php', payload);
      
      if (res.data) {
        setFormData(prev => ({
          ...prev,
          tot_qty: res.data.tot_qty || prev.tot_qty,
          supplier_name: res.data.supplier_name || prev.supplier_name,
          supplier_name1: res.data.supplier_name1 || prev.supplier_name1,
        }));
      }
    } catch (error) {
      console.error('Error fetching batch details', error);
    }
  };

  const handleTrayToggle = (trayId) => {
    setSelectedTrays(prev => 
      prev.includes(trayId) ? prev.filter(id => id !== trayId) : [...prev, trayId]
    );
  };

  const saveTrays = async () => {
    if (selectedTrays.length.toString() !== formData.tray_utilized) {
      alert("Mismatched Tray utilized and Tray count value");
      return;
    }
    
    const checkedVal = selectedTrays.join(',');
    setFormData(prev => ({ ...prev, checkedvalue: checkedVal }));
    setShowTrayModal(false);

    try {
      const payload = new URLSearchParams();
      payload.append('action', 'sub_add_update');
      payload.append('entry_date', formData.entry_date);
      // staff_name is handled by PHP session but we can send a dummy or nothing if session has it
      payload.append('tot_qty', formData.tot_qty);
      payload.append('tray_utilized', formData.tray_utilized);
      payload.append('batch_id', formData.batch_id);
      payload.append('checkedvalue', checkedVal);
      payload.append('screen_unique_id', formData.screen_unique_id);
      
      await client.post('folders/egg_process/crud.php', payload);
    } catch (error) {
      console.error("Error saving trays", error);
    }
  };

  const handleItemSelectChange = (e) => {
    const options = e.target.options;
    const newSelected = {};
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        newSelected[options[i].value] = selectedItems[options[i].value] || '';
      }
    }
    setSelectedItems(newSelected);
  };

  const handleItemQtyChange = (itemId, qty) => {
    setSelectedItems(prev => ({ ...prev, [itemId]: qty }));
  };

  const saveAddOns = async () => {
    setShowAddOnModal(false);
    
    try {
      const payload = new URLSearchParams();
      payload.append('action', 'sub_add_on');
      payload.append('entry_date', formData.entry_date);
      payload.append('tot_qty', formData.tot_qty);
      payload.append('batch_id', formData.batch_id);
      payload.append('screen_unique_id', formData.screen_unique_id);
      if (unique_id) payload.append('unique_id', unique_id);
      
      Object.keys(selectedItems).forEach(itemId => {
        payload.append('item_names[]', itemId);
        payload.append('checkedvalues[]', selectedItems[itemId]);
      });

      await client.post('folders/egg_process/crud.php', payload);
    } catch (error) {
      console.error("Error saving add ons", error);
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
      const res = await client.post('folders/egg_process/crud.php', payload);
      const json = res.data;

      if (json.msg === 'create' || json.msg === 'update') {
        navigate('/egg_process/list');
      } else if (json.msg === 'already') {
        navigate('/egg_process/list');
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
                  Egg Process {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !batchOptions.length && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                  <div className="col-12 col-md-3 mb-3">
                    <span className="form-label app-form-label d-block">Entry No</span>
                    <h5 className="mb-0">{formData.entry_no}</h5>
                  </div>

                  {!unique_id ? (
                    <div className="col-12 col-md-3 mb-3">
                      <DateInput
                        id="entry_date"
                        name="entry_date"
                        label="Entry Date"
                        value={formData.entry_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  ) : (
                    <div className="col-12 col-md-3 mb-3">
                      <span className="form-label app-form-label d-block">Entry Date</span>
                      <span>{formData.entry_date}</span>
                    </div>
                  )}

                  <div className="col-12 col-md-3">
                    <Select
                      label="Batch Id"
                      name="batch_id"
                      value={formData.batch_id}
                      onChange={handleChange}
                      options={[{ value: '', label: 'Select Batch Id' }, ...batchOptions]}
                      required
                      disabled={!!unique_id}
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      label="Supplier Name"
                      name="supplier_name"
                      value={formData.supplier_name}
                      readOnly
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      label="Total Quantity (Grams)"
                      name="tot_qty"
                      value={formData.tot_qty}
                      readOnly
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      label="Tray Utilized"
                      name="tray_utilized"
                      value={formData.tray_utilized}
                      onChange={handleChange}
                      required
                      readOnly={!!unique_id}
                    />
                  </div>

                  <div className="col-12 col-md-3 mb-3 d-flex align-items-end gap-2">
                    <Button onClick={() => setShowTrayModal(true)}>
                      Add Tray
                    </Button>
                    <Button variant="soft-primary" onClick={() => setShowAddOnModal(true)}>
                      Add On
                    </Button>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/egg_process/list')}>
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

      {/* Tray Selection Modal */}
      {showTrayModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Trays</h5>
                <button type="button" className="btn-close" onClick={() => setShowTrayModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Selected count: {selectedTrays.length} / {formData.tray_utilized}</p>
                <div className="d-flex flex-wrap gap-3">
                  {trayOptions.map(tray => (
                    <div key={tray.id} className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id={`tray_${tray.id}`} 
                        checked={selectedTrays.includes(tray.id)}
                        onChange={() => handleTrayToggle(tray.id)}
                      />
                      <label className="form-check-label" htmlFor={`tray_${tray.id}`}>
                        {tray.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={saveTrays}>Save Trays</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add-On Modal */}
      {showAddOnModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add On Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddOnModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Item Name</label>
                  <select
                    multiple
                    className="form-select"
                    onChange={handleItemSelectChange}
                    value={Object.keys(selectedItems)}
                    style={{ minHeight: '100px' }}
                  >
                    {itemOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                {Object.keys(selectedItems).map(itemId => {
                  const item = itemOptions.find(opt => opt.value === itemId);
                  return (
                    <div key={itemId} className="mb-3">
                      <label className="form-label">{item?.label} Quantity</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={selectedItems[itemId]}
                        onChange={(e) => handleItemQtyChange(itemId, e.target.value)}
                        required
                      />
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={saveAddOns}>Save Add-Ons</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
