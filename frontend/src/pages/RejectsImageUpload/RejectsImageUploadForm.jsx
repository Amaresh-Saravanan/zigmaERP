import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import djangoClient from '../../api/djangoClient';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import DateInput from '../../components/DateInput';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

const TODAY = new Date().toISOString().split('T')[0];

// ponytail: rewired from PHP form.php/crud.php/get_ticket_details.php to Django REST
export default function RejectsImageUploadForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');

  const [formData, setFormData] = useState({
    upload_date: TODAY,
    ticket_no: '',
    weigh_date: '',
    vehicle_no: '',
    net_weight: '',
    image_path: '',
  });

  const [ticketOptions, setTicketOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch available tickets (excluding already-used ones)
    djangoClient.get('/rejects-available-tickets')
      .then(res => {
        const tickets = res.data?.data || [];
        setTicketOptions([
          { value: '', label: 'Select Ticket' },
          ...tickets.map(t => ({ value: t.ticket_no, label: t.ticket_no })),
        ]);
      })
      .catch(() => {
        // Fallback: fetch all rejects if available-tickets endpoint fails
        djangoClient.get('/rejects', { params: { page_size: 100 } })
          .then(res => {
            const rejects = res.data?.data?.results || [];
            setTicketOptions([
              { value: '', label: 'Select Ticket' },
              ...rejects.map(r => ({ value: r.ticket_no, label: r.ticket_no })),
            ]);
          })
          .catch(err => console.error('Could not fetch ticket options', err));
      });

    if (unique_id) fetchRecord();
  }, [unique_id]);

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const res = await djangoClient.get(`/reject-images/${unique_id}`);
      const d = res.data.data;
      setFormData({
        upload_date: d.upload_date || TODAY,
        ticket_no: d.ticket_no || '',
        weigh_date: d.weigh_date || '',
        vehicle_no: d.vehicle_no || '',
        net_weight: d.net_weight ?? '',
        image_path: d.image_path || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketDetails = async (ticket_no) => {
    if (!ticket_no) {
      setFormData(prev => ({ ...prev, weigh_date: '', vehicle_no: '', net_weight: '' }));
      return;
    }
    try {
      const res = await djangoClient.get('/rejects', { params: { search: ticket_no, page_size: 1 } });
      const rejects = res.data?.data?.results || [];
      const match = rejects.find(r => r.ticket_no === ticket_no);
      if (match) {
        setFormData(prev => ({
          ...prev,
          weigh_date: match.date || '',
          vehicle_no: match.vehicle_no || '',
          net_weight: match.net_weight ?? '',
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'ticket_no') fetchTicketDetails(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        upload_date: formData.upload_date,
        ticket_no: formData.ticket_no,
        weigh_date: formData.weigh_date || null,
        vehicle_no: formData.vehicle_no,
        net_weight: parseFloat(formData.net_weight) || 0,
        image_path: formData.image_path,
      };

      const res = unique_id
        ? await djangoClient.put(`/reject-images/${unique_id}`, payload)
        : await djangoClient.post('/reject-images', payload);

      if (res.data?.msg === 'create' || res.data?.msg === 'update') {
        navigate('/rejects_image_upload/list');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const imagePaths = formData.image_path
    ? formData.image_path.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} Reject Image Upload`}
            backTo="/rejects_image_upload/list"
          />
          <div className="card-body">
            {isLoading && !formData.ticket_no && unique_id ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
                <p className="form-section-title">
                  <i className="ri-file-list-3-line me-1"></i> Ticket Details
                </p>
                <div className="row">
                  <div className="col-12 col-md-4">
                    <DateInput
                      label="Upload Date"
                      name="upload_date"
                      value={formData.upload_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <Select
                      label="Ticket Number"
                      name="ticket_no"
                      value={formData.ticket_no}
                      onChange={handleChange}
                      options={ticketOptions}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Weigh Date"
                      name="weigh_date"
                      value={formData.weigh_date}
                      readOnly
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Vehicle Number"
                      name="vehicle_no"
                      value={formData.vehicle_no}
                      readOnly
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <TextInput
                      label="Net Weight (Tons)"
                      name="net_weight"
                      value={formData.net_weight}
                      readOnly
                    />
                  </div>
                </div>

                <p className="form-section-title mt-2">
                  <i className="ri-image-line me-1"></i> Images
                </p>
                <div className="row">
                  <div className="col-12 col-md-6">
                    <TextInput
                      label="Image URL(s) — comma-separated for multiple"
                      name="image_path"
                      value={formData.image_path}
                      onChange={handleChange}
                      placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                    />
                  </div>
                </div>

                {/* Image previews */}
                {imagePaths.length > 0 && (
                  <div className="row mt-2 mb-3">
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: '12px', color: 'var(--vz-secondary-color)' }}>Preview</label>
                      <div className="d-flex flex-wrap gap-2">
                        {imagePaths.map((img, i) => (
                          <a key={i} href={img} target="_blank" rel="noreferrer">
                            <img
                              src={img}
                              alt={`img-${i}`}
                              style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="row mt-3">
                  <div className="col-12 text-end">
                    <Button variant="danger" className="me-2" onClick={() => navigate('/rejects_image_upload/list')}>Cancel</Button>
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
