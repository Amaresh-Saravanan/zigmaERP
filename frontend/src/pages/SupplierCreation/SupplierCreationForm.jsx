import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import TextInput from '../../components/TextInput';
import Textarea from '../../components/Textarea';
import Toggle from '../../components/Toggle';
import Button from '../../components/Button';

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
    if (unique_id) {
      fetchFormHtml();
    }
  }, [unique_id]);

  const fetchFormHtml = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(`folders/supplier_creation/form.php?unique_id=${unique_id}`, {
        responseType: 'text'
      });
      const parser = new DOMParser();
      const doc = parser.parseFromString(res.data, 'text/html');

      const inputs = {
        supplier_name: doc.querySelector('#supplier_name'),
        label: doc.querySelector('#label'),
        address: doc.querySelector('#address'),
        contact_no: doc.querySelector('#contact_no'),
        email: doc.querySelector('#email'),
        gst_no: doc.querySelector('#gst_no'),
        active_status: doc.querySelector('#active_status'),
      };

      setFormData({
        supplier_name: inputs.supplier_name ? inputs.supplier_name.value : '',
        label: inputs.label ? inputs.label.value : '',
        address: inputs.address ? inputs.address.value : '',
        contact_no: inputs.contact_no ? inputs.contact_no.value : '',
        email: inputs.email ? inputs.email.value : '',
        gst_no: inputs.gst_no ? inputs.gst_no.value : '',
        active_status: inputs.active_status ? inputs.active_status.value : '1',
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

    const payload = new URLSearchParams();
    payload.append('action', 'createupdate');
    payload.append('supplier_name', formData.supplier_name);
    payload.append('label', formData.label);
    payload.append('address', formData.address);
    payload.append('contact_no', formData.contact_no);
    payload.append('email', formData.email);
    payload.append('gst_no', formData.gst_no);
    payload.append('active_status', formData.active_status);
    if (unique_id) {
      payload.append('unique_id', unique_id);
    }

    try {
      const res = await client.post('folders/supplier_creation/crud.php', payload);
      const json = res.data;

      if (json.msg === 'create' || json.msg === 'update') {
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
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  Supplier Creation {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
          <div className="card-body d-flex flex-column justify-content-end">
            {isLoading && !formData.supplier_name && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
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
