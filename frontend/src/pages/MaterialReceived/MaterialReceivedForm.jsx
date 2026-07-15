import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import DateInput from '../../components/DateInput';
import useAuth from '../../hooks/useAuth';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const TODAY = new Date().toISOString().split('T')[0];

export default function MaterialReceivedForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.userType === '66604f07ae42a24843';

  const [formData, setFormData] = useState({
    date: TODAY,
    supplier: '',
    item: '',
    qty: '',
    unit_id: '',
    unit_display: '',
    invoice_date: '',
    invoice_no: '',
  });

  const [supplierOptions, setSupplierOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    fetchItems();
    if (unique_id) fetchRecord();
  }, [unique_id]);

  const fetchSuppliers = async () => {
    try {
      const res = await djangoClient.get('/suppliers', { params: { page_size: 100 } });
      setSupplierOptions((res.data.data.results || []).map((s) => ({ value: s.unique_id, label: s.supplier_name })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await djangoClient.get('/items', { params: { page_size: 100 } });
      setItemOptions((res.data.data.results || []).map((i) => ({ value: i.unique_id, label: i.item_name, unit: i.unit })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/material-received/${unique_id}`);
      const mr = res.data.data;
      setFormData({
        date: mr.date || TODAY,
        supplier: mr.supplier?.unique_id || '',
        item: mr.item?.unique_id || '',
        qty: String(mr.qty ?? ''),
        unit_id: mr.unit?.unique_id || '',
        unit_display: mr.unit?.unit_name || '',
        invoice_date: mr.invoice_date || '',
        invoice_no: mr.invoice_no || '',
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

    if (name === 'item') {
      const selected = itemOptions.find((i) => i.value === value);
      setFormData((prev) => ({
        ...prev,
        unit_id: selected?.unit?.unique_id || '',
        unit_display: selected?.unit?.unit_name || '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      date: formData.date,
      supplier: { unique_id: formData.supplier },
      item: { unique_id: formData.item },
      qty: parseFloat(formData.qty) || 0,
      unit: { unique_id: formData.unit_id },
      invoice_no: formData.invoice_no,
      invoice_date: formData.invoice_date || null,
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/material-received/${unique_id}`, payload)
        : await djangoClient.post('/material-received', payload);

      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/material_received/list');
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
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} Material Received`}
            backTo="/material_received/list"
          />

          <div className="card-body">
            {isLoading && !supplierOptions.length ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <p className="form-section-title">
                  <i className="ri-truck-line me-1"></i> Supplier & Item
                </p>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <DateInput
                      id="date"
                      name="date"
                      label="Entry Date"
                      value={formData.date}
                      onChange={handleChange}
                      disabled={!isAdmin}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Supplier Name"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      options={supplierOptions}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Select
                      label="Item Name"
                      name="item"
                      value={formData.item}
                      onChange={handleChange}
                      options={itemOptions}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      type="number"
                      step="0.01"
                      min="1"
                      label="Qty"
                      name="qty"
                      value={formData.qty}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      label="Unit"
                      name="unit_display"
                      value={formData.unit_display}
                      readOnly
                      required
                    />
                  </div>
                </div>

                <p className="form-section-title mt-2">
                  <i className="ri-file-text-line me-1"></i> Invoice Details
                </p>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <DateInput
                      id="invoice_date"
                      name="invoice_date"
                      label="Invoice Date"
                      value={formData.invoice_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <TextInput
                      label="Invoice Number"
                      name="invoice_no"
                      value={formData.invoice_no}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/material_received/list')}>
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
