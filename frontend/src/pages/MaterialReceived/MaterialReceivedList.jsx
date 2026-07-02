import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import DateInput from '../../components/DateInput';
import DataTable from '../../components/DataTable';
import useAuth from '../../hooks/useAuth';

const now = new Date();
const pad = (n) => n.toString().padStart(2, '0');
const FIRST_DAY_OF_MONTH = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
const TODAY = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export default function MaterialReceivedList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.userType === '66604f07ae42a24843';

  const [filters, setFilters] = useState({ from_date: FIRST_DAY_OF_MONTH, to_date: TODAY, item_name: '', supplier_name: '' });
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  useEffect(() => {
    // Fetch form HTML to extract dropdown options for filters
    client.get('folders/material_received/form.php', { responseType: 'text' }).then(res => {
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      const suppSelect = doc.querySelector('#supplier_name');
      if (suppSelect) setSupplierOptions(Array.from(suppSelect.options).map(o => ({ value: o.value, label: o.text })));
      
      const itemSelect = doc.querySelector('#item_name');
      if (itemSelect) setItemOptions(Array.from(itemSelect.options).map(o => ({ value: o.value, label: o.text })));
    }).catch(console.error);
  }, []);

  const columns = [
    { label: 'Batch Id + Date' },
    { label: 'Supplier Name' },
    { label: 'Item Name' },
    { label: 'Qty' },
    { label: 'Unit' },
    { label: 'Invoice Date' },
    { label: 'Invoice Number' },
    { label: 'Invoice Document' },
    { label: 'Action', className: 'text-end' },
  ];

  const handleEdit = (uniqueId, rowData) => {
    navigate(`/material_received/form?unique_id=${uniqueId}`);
  };

  const handleDelete = async (uniqueId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const params = new URLSearchParams();
      params.append('action', 'delete');
      params.append('unique_id', uniqueId);
      const res = await client.post('folders/material_received/crud.php', params);
      if (res.data?.msg === 'success_delete') window.location.reload();
    } catch (err) {
      console.error('Error deleting material received', err);
    }
  };

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
                <h5 className="d-flex align-items-center">Material Received List</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/material_received/form')} className="btn btn-primary btn-sm">
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
              <div className="col-md-3">
                <select name="supplier_name" className="form-select form-select-sm" value={filters.supplier_name} onChange={handleFilterChange}>
                  <option value="">All Suppliers</option>
                  {supplierOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <select name="item_name" className="form-select form-select-sm" value={filters.item_name} onChange={handleFilterChange}>
                  <option value="">All Items</option>
                  {itemOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/material_received/crud.php"
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              extraParams={extraParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
