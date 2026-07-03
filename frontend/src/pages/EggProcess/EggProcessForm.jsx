import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
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
    batch: '',
    supplier_display: '',
    tot_qty: '',
    tray_utilized: '',
  });

  const [staffId, setStaffId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [batchOptions, setBatchOptions] = useState([]);
  const [trayOptions, setTrayOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  const [selectedTrays, setSelectedTrays] = useState([]);
  const [addons, setAddons] = useState([]); // [{ item, qty }]

  const [isLoading, setIsLoading] = useState(false);
  const [showTrayModal, setShowTrayModal] = useState(false);
  const [showAddOnModal, setShowAddOnModal] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchBatches();
    fetchTrays();
    fetchItems();
    if (unique_id) fetchRecord();
  }, [unique_id]);

  // Close whichever modal is open on Escape
  useEffect(() => {
    if (!showTrayModal && !showAddOnModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowTrayModal(false);
        setShowAddOnModal(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showTrayModal, showAddOnModal]);

  const fetchCurrentUser = async () => {
    try {
      const res = await djangoClient.get('/auth/me');
      setStaffId(res.data.data.unique_id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await djangoClient.get('/material-received', { params: { page_size: 100 } });
      setBatchOptions((res.data.results || []).map((b) => ({
        value: b.unique_id,
        label: b.batch_id,
        supplierId: b.supplier?.unique_id || '',
        supplierName: b.supplier?.supplier_name || '',
        qty: b.qty,
      })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrays = async () => {
    try {
      const res = await djangoClient.get('/trays', { params: { page_size: 100 } });
      setTrayOptions((res.data.results || []).map((t) => ({ id: t.unique_id, name: t.bin_name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await djangoClient.get('/items', { params: { page_size: 100 } });
      setItemOptions((res.data.results || []).map((i) => ({ value: i.unique_id, label: i.item_name })));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/egg-process/${unique_id}`);
      const ep = res.data.data;
      setFormData({
        entry_no: ep.entry_no || '',
        entry_date: ep.entry_date || '',
        batch: ep.batch?.unique_id || '',
        supplier_display: ep.supplier?.supplier_name || '',
        tot_qty: String(ep.tot_qty ?? ''),
        tray_utilized: String(ep.tray_utilized ?? ''),
      });
      setSupplierId(ep.supplier?.unique_id || '');
      setSelectedTrays((ep.trays || []).map((t) => t.unique_id));
      setAddons((ep.addons || []).map((a) => ({ item: a.item.unique_id, itemLabel: a.item.item_name, qty: String(a.qty) })));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'batch') {
      const selected = batchOptions.find((b) => b.value === value);
      setSupplierId(selected?.supplierId || '');
      setFormData((prev) => ({
        ...prev,
        supplier_display: selected?.supplierName || '',
        tot_qty: selected ? String(selected.qty) : '',
      }));
    }
  };

  const handleTrayToggle = (trayId) => {
    setSelectedTrays((prev) =>
      prev.includes(trayId) ? prev.filter((id) => id !== trayId) : [...prev, trayId]
    );
  };

  const saveTrays = () => {
    if (selectedTrays.length.toString() !== formData.tray_utilized) {
      alert('Mismatched Tray utilized and Tray count value');
      return;
    }
    setShowTrayModal(false);
  };

  const handleItemSelectChange = (e) => {
    const options = e.target.options;
    const newAddons = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        const existing = addons.find((a) => a.item === options[i].value);
        newAddons.push({
          item: options[i].value,
          itemLabel: options[i].text,
          qty: existing ? existing.qty : '',
        });
      }
    }
    setAddons(newAddons);
  };

  const handleAddonQtyChange = (itemId, qty) => {
    setAddons((prev) => prev.map((a) => (a.item === itemId ? { ...a, qty } : a)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedTrays.length !== parseInt(formData.tray_utilized, 10)) {
      alert('Number of selected trays must match tray utilized.');
      return;
    }

    setIsLoading(true);

    const payload = {
      entry_date: formData.entry_date,
      staff: { unique_id: staffId },
      supplier: { unique_id: supplierId },
      batch: { unique_id: formData.batch },
      tot_qty: parseFloat(formData.tot_qty) || 0,
      tray_utilized: parseInt(formData.tray_utilized, 10) || 0,
      trays: selectedTrays.map((id) => ({ unique_id: id })),
      addons: addons.map((a) => ({ item: { unique_id: a.item }, qty: parseFloat(a.qty) || 0 })),
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/egg-process/${unique_id}`, payload)
        : await djangoClient.post('/egg-process', payload);

      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
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
                  {unique_id && (
                    <div className="col-12 col-md-3 mb-3">
                      <span className="form-label app-form-label d-block">Entry No</span>
                      <h5 className="mb-0">{formData.entry_no}</h5>
                    </div>
                  )}

                  <div className="col-12 col-md-3 mb-3">
                    <DateInput
                      id="entry_date"
                      name="entry_date"
                      label="Entry Date"
                      value={formData.entry_date}
                      onChange={handleChange}
                      required
                      disabled={!!unique_id}
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Batch Id"
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
                      label="Supplier Name"
                      name="supplier_display"
                      value={formData.supplier_display}
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
                    />
                  </div>

                  <div className="col-12 col-md-3 mb-3 d-flex align-items-end gap-2">
                    <Button type="button" onClick={() => setShowTrayModal(true)}>
                      Select Trays ({selectedTrays.length})
                    </Button>
                    <Button type="button" variant="soft-primary" onClick={() => setShowAddOnModal(true)}>
                      Add On ({addons.length})
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
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-label="Select Trays"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowTrayModal(false); }}
        >
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
                <button type="button" className="btn btn-primary" onClick={saveTrays}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add-On Modal */}
      {showAddOnModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-label="Add On Details"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddOnModal(false); }}
        >
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
                    value={addons.map((a) => a.item)}
                    style={{ minHeight: '100px' }}
                  >
                    {itemOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {addons.map((a) => (
                  <div key={a.item} className="mb-3">
                    <label className="form-label">{a.itemLabel} Quantity</label>
                    <input
                      type="text"
                      className="form-control"
                      value={a.qty}
                      onChange={(e) => handleAddonQtyChange(a.item, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowAddOnModal(false)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
