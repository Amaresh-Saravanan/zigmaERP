import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import FileInput from '../../components/FileInput';
import Button from '../../components/Button';
import FormHeader from '../../components/FormHeader';

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
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} Reject Image Upload`}
            backTo="/rejects_image_upload/list"
          />
          <div className="card-body">
            <form className="was-validated" onSubmit={handleSubmit} autoComplete="off">
              <p className="form-section-title">
                <i className="ri-file-list-3-line me-1"></i> Ticket Details
              </p>
              <div className="row">
                <div className="col-12 col-md-4">
                  <TextInput
                    type="datetime-local"
                    label="Date"
                    name="entry_date"
                    value={formData.entry_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <Select
                    label="Ticket Number"
                    name="ticket_number"
                    value={formData.ticket_number}
                    onChange={handleChange}
                    options={ticketOptions}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <TextInput
                    type="datetime-local"
                    label="Weigh Date"
                    name="weigh_date"
                    value={formData.weigh_date}
                    readOnly
                  />
                </div>

                <div className="col-12 col-md-4">
                  <TextInput
                    label="Vehicle Number"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    readOnly
                  />
                </div>

                <div className="col-12 col-md-4">
                  <input type="hidden" name="net_weight" value={formData.net_weight} />
                  <TextInput
                    label="Net Weight(MT)"
                    name="net_weight_ton"
                    value={formData.net_weight_ton}
                    readOnly
                  />
                </div>
              </div>

              <p className="form-section-title mt-2">
                <i className="ri-image-line me-1"></i> Image Upload
              </p>
              <div className="row">
                <div className="col-12 col-md-4">
                  <FileInput
                    label="Image Upload"
                    name="test_file"
                    onFilesChange={(files) => setFormData(prev => ({ ...prev, test_file: files }))}
                    required={!unique_id}
                  />
                </div>
              </div>

              {existingImagesHTML && (
                <div className="row mb-3 bg-light p-3 rounded mx-1" dangerouslySetInnerHTML={{ __html: existingImagesHTML }} />
              )}

              <div className="row mt-3">
                <div className="col-12 text-end">
                  <Button variant="danger" className="me-2" onClick={() => navigate('/rejects_image_upload/list')}>Cancel</Button>
                  <Button type="submit">{unique_id ? 'Update' : 'Save'}</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
