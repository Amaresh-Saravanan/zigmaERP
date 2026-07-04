import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Textarea from '../../components/Textarea';
import Toggle from '../../components/Toggle';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

export default function SupplierCreationForm() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    supplier_name: '',
    label: '',
    address: '',
    contact_no: '',
    email: '',
    gst_no: '',
    active_status: '1',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (unique_id) fetchSupplier();
  }, [unique_id]);

  const fetchSupplier = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/suppliers/${unique_id}`);
      const supplier = res.data.data;
      setFormData({
        supplier_name: supplier.supplier_name || '',
        label: supplier.label || '',
        address: supplier.address || '',
        contact_no: supplier.contact_no || '',
        email: supplier.email || '',
        gst_no: supplier.gst_no || '',
        active_status: supplier.is_active ? '1' : '0',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLabelChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
    setFormData({ ...formData, label: val });
  };

  const handleContactChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, contact_no: val });
  };

  const handleGstChange = (e) => {
    setFormData({ ...formData, gst_no: e.target.value.toUpperCase() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      supplier_name: formData.supplier_name,
      label: formData.label,
      address: formData.address,
      contact_no: formData.contact_no,
      email: formData.email,
      gst_no: formData.gst_no,
      is_active: formData.active_status === '1',
    };

    try {
      const res = unique_id
        ? await djangoClient.put(`/suppliers/${unique_id}`, payload)
        : await djangoClient.post('/suppliers', payload);

      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/supplier_creation/list');
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
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} Supplier`}
            backTo="/supplier_creation/list"
          />
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.supplier_name && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <p className="form-section-title">
                  <i className="ri-truck-line me-1"></i> Supplier Details
                </p>
                <div className="row">
                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Supplier Name"
                      name="supplier_name"
                      value={formData.supplier_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Supplier Code"
                      name="label"
                      maxLength="3"
                      placeholder="ABC"
                      helperText="3-letter code"
                      value={formData.label}
                      onChange={handleLabelChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <Textarea
                      label="Address"
                      name="address"
                      rows={2}
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Contact Number"
                      name="contact_no"
                      minLength="1"
                      maxLength="10"
                      helperText="10-digit mobile number"
                      value={formData.contact_no}
                      onChange={handleContactChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      type="email"
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      label="GST No"
                      name="gst_no"
                      maxLength="15"
                      helperText="15 characters, e.g. 22ABCDE1234F1Z2"
                      value={formData.gst_no}
                      onChange={handleGstChange}
                      pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                      required
                    >
                      <div className="invalid-feedback">Please enter a valid GST No in the format: 22ABCDE1234F1Z2</div>
                    </TextInput>
                  </div>

                  <div className="col-12 col-md-4">
                    <Toggle
                      label="Active Status"
                      name="active_status"
                      value={formData.active_status}
                      onChange={handleChange}
                      helperText={formData.active_status === '1' ? 'Active' : 'Inactive'}
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/supplier_creation/list')}>
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
