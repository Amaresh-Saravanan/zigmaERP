import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DateInput from '../../components/DateInput';
import DataTable from '../../components/DataTable';
import DateInput from '../../components/DateInput';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const FIRST_DAY_OF_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export default function FrpTrayProcessList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ from_date: FIRST_DAY_OF_MONTH, to_date: TODAY, batch_id: '' });
  
  // Sublist Modal State
  const [sublistModal, setSublistModal] = useState({ show: false, uniqueId: null, mode: null });
  const [sublistData, setSublistData] = useState([]);
  const [sublistEggBatchId, setSublistEggBatchId] = useState('');
  const [isSublistLoading, setIsSublistLoading] = useState(false);

  const handleEdit = (uniqueId) => navigate(`/frp_tray_process/form?unique_id=${uniqueId}`);

  const handleDelete = async (uniqueId, batchId, trayNo) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      params.append('batch_id', batchId);
      params.append('tray_no', trayNo);
      const res = await client.post('folders/frp_tray_process/crud.php', params);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting FRP Tray Process', err);
    }
  };

  const openSublistModal = async (uniqueId, formUniqueId) => {
    const mode = formUniqueId ? 'view_update' : 'view';
    setSublistModal({ show: true, uniqueId, mode });
    setIsSublistLoading(true);
    setSublistData([]);

    try {
      const url = `folders/frp_tray_process/${mode}.php?unique_id=${uniqueId}`;
      const res = await client.get(url, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');

      const eggBatchHidden = doc.querySelector('#egg_unique_id')?.value || '';
      setSublistEggBatchId(eggBatchHidden);

      const rows = [];
      const trs = doc.querySelectorAll('table#frp_sublist tbody tr');
      trs.forEach(tr => {
        const trayIdInput = tr.querySelector('input[name="tray_id"]');
        const trayHiddenInput = tr.querySelector('input[name="tray_hidden"]');
        const larvaeInput = tr.querySelector('input[name="larvae"]');
        const organicInput = tr.querySelector('input[name="organic"]');

        if (trayHiddenInput) {
          rows.push({
            tray_name: trayIdInput?.value || '',
            tray_hidden: trayHiddenInput.value,
            larvae: larvaeInput?.value || '',
            organic: organicInput?.value || '',
          });
        }
      });
      setSublistData(rows);
    } catch (err) {
      console.error('Error fetching sublist data', err);
    } finally {
      setIsSublistLoading(false);
    }
  };

  const closeSublistModal = () => setSublistModal({ show: false, uniqueId: null, mode: null });

  const handleSublistChange = (index, field, value) => {
    const newData = [...sublistData];
    newData[index][field] = value;
    setSublistData(newData);
  };

  const handleSublistSubmit = async () => {
    setIsSublistLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('action', sublistModal.mode === 'view' ? 'add_sublist' : 'add_sublist_update');
      
      if (sublistModal.mode === 'view') {
        params.append('unique_id', sublistModal.uniqueId);
        params.append('egg_batch_id', sublistEggBatchId);
      }

      sublistData.forEach((row, i) => {
        params.append(`rows_data[${i}][tray_hidden]`, row.tray_hidden);
        params.append(`rows_data[${i}][larvae]`, row.larvae);
        params.append(`rows_data[${i}][organic]`, row.organic);
      });

      const res = await client.post('folders/frp_tray_process/crud.php', params);
      if (res.data?.status) {
        closeSublistModal();
        window.location.reload();
      }
    } catch (err) {
      console.error('Error submitting sublist', err);
    } finally {
      setIsSublistLoading(false);
    }
  };

  const columns = [
    { label: 'S.No' },
    { label: 'Entry Date' },
    { label: 'Egg Batch Id' },
    { label: 'FRP Tray Qty' },
    { label: 'Tray Name' },
    { 
      label: 'Add ON',
      render: (val, row) => {
        // Based on backend PHP: row[5] is add_on button string, row[6] is f.unique_id, row[7] is fs.form_unique_id
        const uniqueId = row[6];
        const formUniqueId = row[7]; 
        
        return (
          <button 
            onClick={() => openSublistModal(uniqueId, formUniqueId)}
            className={`btn btn-sm btn-ghost-${formUniqueId ? 'success' : 'info'} waves-effect waves-light`}
          >
            <i className={`mdi mdi-${formUniqueId ? 'square-edit-outline' : 'eye'} fs-15`}></i>
            {formUniqueId ? ' Edit Sublist' : ' View Sublist'}
          </button>
        );
      }
    },
    { 
      label: 'Action', 
      className: 'text-end',
      render: (val, row) => {
        const uniqueId = row[6];
        const formUniqueId = row[7];
        const eggBatchId = val.match(/_delete_egg\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/)?.[2] || '';
        const frpTrayNameDelete = val.match(/_delete_egg\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]/)?.[3] || '';
        
        // Hide edit/delete if sublist exists
        if (formUniqueId) return null;

        return (
          <div className="hstack gap-2 flex-wrap justify-content-end">
            <button onClick={() => handleEdit(uniqueId)} className="btn btn-sm btn-ghost-success waves-effect waves-light">
              <i className="ri-edit-2-line fs-15"></i>
            </button>
            <button onClick={() => handleDelete(uniqueId, eggBatchId, frpTrayNameDelete)} className="btn btn-sm btn-ghost-danger waves-effect waves-light">
              <i className="ri-delete-bin-line fs-15"></i>
            </button>
          </div>
        );
      }
    },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const extraParams = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">FRP Tray Process List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/frp_tray_process/form')} className="btn btn-primary btn-sm">
                  Create New
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="row mt-2 g-2">
              <div className="col-md-2">
                <DateInput
                  name="from_date"
                  value={filters.from_date}
                  onChange={handleFilterChange}
                  className="form-control form-control-sm"
                  placeholder="From Date"
                />
              </div>
              <div className="col-md-2">
                <DateInput
                  name="to_date"
                  value={filters.to_date}
                  onChange={handleFilterChange}
                  className="form-control form-control-sm"
                  placeholder="To Date"
                />
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/frp_tray_process/crud.php"
              columns={columns}
              extraParams={extraParams}
            />
          </div>
        </div>
      </div>

      {/* Sublist Modal */}
      {sublistModal.show && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">FRP Tray Sublist</h5>
                  <button type="button" className="btn-close" onClick={closeSublistModal}></button>
                </div>
                <div className="modal-body">
                  {isSublistLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Tray Name</th>
                            <th>Baby Larvae Qty(g)</th>
                            <th>Organic Waste(kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sublistData.map((row, i) => (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td><input type="text" className="form-control form-control-sm" value={row.tray_name} readOnly /></td>
                              <td>
                                <input type="number" className="form-control form-control-sm"
                                  value={row.larvae} onChange={e => handleSublistChange(i, 'larvae', e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="form-control form-control-sm"
                                  value={row.organic} onChange={e => handleSublistChange(i, 'organic', e.target.value)} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeSublistModal}>Close</button>
                  <button type="button" className="btn btn-primary" onClick={handleSublistSubmit} disabled={isSublistLoading}>
                    {isSublistLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
