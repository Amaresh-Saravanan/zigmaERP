import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

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
                  <div className="col-4 mb-3">
                    <label htmlFor="supplier_name"> Supplier Name </label>
                    <input
                      type="text"
                      className="form-control"
                      id="supplier_name"
                      name="supplier_name"
                      value={formData.supplier_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-4 mb-3">
                    <label htmlFor="label"> Label </label>
                    <input
                      type="text"
                      className="form-control"
                      id="label"
                      name="label"
                      maxLength="3"
                      value={formData.label}
                      onChange={handleLabelChange}
                      required
                    />
                  </div>

                  <div className="col-4 mb-3">
                    <label htmlFor="address"> Address </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-4 mb-3">
                    <label htmlFor="contact_no"> Contact Number </label>
                    <input
                      type="text"
                      className="form-control"
                      id="contact_no"
                      name="contact_no"
                      minLength="1"
                      maxLength="10"
                      value={formData.contact_no}
                      onChange={handleContactChange}
                      required
                    />
                  </div>

                  <div className="col-4 mb-3">
                    <label htmlFor="email"> Email </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-4 mb-3">
                    <label htmlFor="gst_no">GST No</label>
                    <input
                      type="text"
                      className="form-control"
                      id="gst_no"
                      name="gst_no"
                      maxLength="15"
                      value={formData.gst_no}
                      onChange={handleGstChange}
                      pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                      required
                    />
                    <div className="invalid-feedback">Please enter a valid GST No in the format: 22ABCDE1234F1Z2</div>
                  </div>

                  <div className="col-4 mb-3">
                    <label htmlFor="active_status">Active Status </label>
                    <select
                      name="active_status"
                      id="active_status"
                      className="form-control"
                      value={formData.active_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-12 text-end mt-3">
                    <button type="button" onClick={() => navigate('/supplier_creation/list')} className="btn btn-danger me-2">
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
