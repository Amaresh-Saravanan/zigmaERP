import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import FileInput from '../../components/FileInput';
import Button from '../../components/Button';

const TYPE_OPTIONS = [{ value: '1', label: 'Input' }, { value: '2', label: 'Output' }];
const METHOD_OPTIONS = [{ value: '1', label: 'Solar' }, { value: '2', label: 'Electric' }];

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const CURRENT_DATETIME = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

export default function DryProcessForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    entry_date: CURRENT_DATETIME,
    type: '1',
    drying_method: '1',
    quantity: '',
    qty_manure: '',
  });
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchFormData();
  }, [unique_id]);

  const fetchFormData = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(`folders/dry_process/form.php?unique_id=${unique_id}`, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      const g = (id) => doc.querySelector(`#${id}`)?.value ?? '';
      setFormData({
        entry_date:    g('entry_date') || CURRENT_DATETIME,
        type:          g('type') || '1',
        drying_method: g('drying_method') || '1',
        quantity:      g('quantity'),
        qty_manure:    g('qty_manure'),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'type' && value === '1') {
        next.qty_manure = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('action', 'createupdate');
      Object.entries(formData).forEach(([k, v]) => {
        // If it's Input, do not send qty_manure or send empty
        if (k === 'qty_manure' && formData.type !== '2') return;
        fd.append(k, v);
      });
      if (unique_id) fd.append('unique_id', unique_id);
      files.forEach(f => fd.append('test_file[]', f));

      const res = await client.post('folders/dry_process/crud.php', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/dry_process/list');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showQtyManure = formData.type === '2';

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  Dry Process {unique_id ? 'Update' : 'Create'}
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
                  <div className="col-12 col-md-3">
                    <TextInput
                      type="datetime-local"
                      label="Date"
                      name="entry_date"
                      value={formData.entry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      options={TYPE_OPTIONS}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Drying Method"
                      name="drying_method"
                      value={formData.drying_method}
                      onChange={handleChange}
                      options={METHOD_OPTIONS}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      min="1"
                      label="Quantity(kg)"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {showQtyManure && (
                    <div className="col-12 col-md-3">
                      <TextInput
                        type="number"
                        step="0.01"
                        label="Qty Manure"
                        name="qty_manure"
                        value={formData.qty_manure}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  <div className="col-12 col-md-3">
                    <FileInput
                      label="Image Upload"
                      name="test_file"
                      multiple
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                      onFilesChange={(fl) => setFiles(Array.from(fl))}
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/dry_process/list')}>
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
