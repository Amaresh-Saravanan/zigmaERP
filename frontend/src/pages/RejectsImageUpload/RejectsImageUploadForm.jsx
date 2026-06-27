import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

export default function RejectsImageUploadForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');

  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().slice(0, 16),
    ticket_number: '',
    weigh_date: '',
    vehicle_number: '',
    net_weight: '',
    net_weight_ton: '',
    test_file: []
  });

  const [ticketOptions, setTicketOptions] = useState([]);
  const [existingImagesHTML, setExistingImagesHTML] = useState('');

  useEffect(() => {
    client.get(`folders/rejects_image_upload/form.php${unique_id ? `?unique_id=${unique_id}` : ''}`, { responseType: 'text' })
      .then(res => {
        const doc = new DOMParser().parseFromString(res.data, 'text/html');

        const ticketSelect = doc.querySelector('#ticket_number');
        if (ticketSelect) setTicketOptions(Array.from(ticketSelect.options).map(o => ({ value: o.value, label: o.text })));

        if (unique_id) {
          setFormData({
            entry_date: doc.querySelector('#entry_date')?.value || new Date().toISOString().slice(0, 16),
            ticket_number: doc.querySelector('#ticket_number')?.value || '',
            weigh_date: doc.querySelector('#weigh_date')?.value || '',
            vehicle_number: doc.querySelector('#vehicle_number')?.value || '',
            net_weight: doc.querySelector('#net_weight')?.value || '',
            net_weight_ton: doc.querySelector('#net_weight_ton')?.value || '',
            test_file: []
          });

          // Extract existing uploaded files HTML block
          const fileBlock = doc.querySelector('.row.mb-3');
          if (fileBlock && fileBlock.innerHTML.includes('Uploaded Files:')) {
            setExistingImagesHTML(fileBlock.innerHTML);
          }
        }
      })
      .catch(err => console.error(err));
  }, [unique_id]);

  const fetchTicketDetails = async (ticket_number) => {
    if (!ticket_number) {
      setFormData(prev => ({ ...prev, weigh_date: '', vehicle_number: '', net_weight: '', net_weight_ton: '' }));
      return;
    }
    try {
      const payload = new URLSearchParams({ ticket_number });
      const res = await client.post('folders/rejects_image_upload/get_ticket_details.php', payload);
      
      // Legacy PHP returns a JSON string, axios parses it if content-type is json.
      // But if it's text, we need to parse it manually.
      let data = res.data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      
      if (data && data.status) {
        setFormData(prev => ({
          ...prev,
          vehicle_number: data.vehicle_number || '',
          net_weight: data.net_weight || '',
          net_weight_ton: data.net_weight_ton || '',
          weigh_date: data.weigh_date ? data.weigh_date.slice(0, 16) : ''
        }));
      } else {
        alert("No data found for this ticket number.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching ticket details.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'ticket_number') {
      fetchTicketDetails(value);
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, test_file: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('action', unique_id ? 'update' : 'create');
      payload.append('unique_id', unique_id || '');
      payload.append('entry_date', formData.entry_date);
      payload.append('ticket_number', formData.ticket_number);
      payload.append('weigh_date', formData.weigh_date);
      payload.append('vehicle_number', formData.vehicle_number);
      payload.append('net_weight', formData.net_weight);
      payload.append('net_weight_ton', formData.net_weight_ton);
      
      if (formData.test_file.length > 0) {
        for (let i = 0; i < formData.test_file.length; i++) {
          payload.append('test_file[]', formData.test_file[i]);
        }
      }

      const res = await client.post('folders/rejects_image_upload/crud.php', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.status === 'Success') {
        navigate('/rejects_image_upload/list');
      } else {
        alert(res.data.message || 'Error saving record');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <h5 className="mb-0">Reject Image Upload {unique_id ? 'Update' : 'Create'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Date</label>
                  <input type="datetime-local" name="entry_date" className="form-control" value={formData.entry_date} onChange={handleChange} required />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Ticket Number</label>
                  <select name="ticket_number" className="form-select" value={formData.ticket_number} onChange={handleChange} required>
                    {ticketOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Weigh Date</label>
                  <input type="datetime-local" name="weigh_date" className="form-control" value={formData.weigh_date} readOnly />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Vehicle Number</label>
                  <input type="text" name="vehicle_number" className="form-control" value={formData.vehicle_number} readOnly />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Net Weight(MT)</label>
                  <input type="hidden" name="net_weight" value={formData.net_weight} />
                  <input type="text" name="net_weight_ton" className="form-control" value={formData.net_weight_ton} readOnly />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Image Upload</label>
                  <input type="file" multiple name="test_file" className="form-control" onChange={handleFileChange} required={!unique_id} />
                </div>
              </div>

              {existingImagesHTML && (
                <div className="row mb-3 bg-light p-3 rounded mx-1" dangerouslySetInnerHTML={{ __html: existingImagesHTML }} />
              )}

              <div className="row mt-3">
                <div className="col-12 text-end">
                  <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/rejects_image_upload/list')}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{unique_id ? 'Update' : 'Save'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
