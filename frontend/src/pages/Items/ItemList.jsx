import React, { useState } from 'react';
import ItemForm from './ItemForm';
import Swal from 'sweetalert2';

export default function ItemList() {
  // Mock initial items
  const [items, setItems] = useState([
    { unique_id: '1', item_code: 'IT-001', item_name: 'Raw Larvae Feed', unit: 'kg', is_active: 1 },
    { unique_id: '2', item_code: 'IT-002', item_name: 'Organic Waste Input', unit: 'kg', is_active: 1 },
    { unique_id: '3', item_code: 'IT-003', item_name: 'Plastic Trays XL', unit: 'pcs', is_active: 0 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate next item code
  const getNextItemCode = () => {
    const codes = items.map((i) => {
      const match = i.item_code.match(/IT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxVal = codes.length > 0 ? Math.max(...codes) : 0;
    return `IT-${String(maxVal + 1).padStart(3, '0')}`;
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0ab39c',
      cancelButtonColor: '#f7b84b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setItems(items.filter((item) => item.unique_id !== id));
        Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
      }
    });
  };

  const handleSave = (itemData) => {
    if (editingItem) {
      // Update
      setItems(items.map((i) => (i.unique_id === itemData.unique_id ? itemData : i)));
      Swal.fire('Updated!', 'Item details updated successfully.', 'success');
    } else {
      // Create
      setItems([...items, itemData]);
      Swal.fire('Saved!', 'New item added successfully.', 'success');
    }
    setIsModalOpen(false);
  };

  const filteredItems = items.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      {/* Header section */}
      <div className="row mb-4 align-items-center">
        <div className="col-sm-6">
          <h4 className="text-primary font-weight-bold">Item Creation</h4>
          <p className="text-muted mb-0">Create and manage Zigma ERP inventory items.</p>
        </div>
        <div className="col-sm-6 text-sm-end mt-2 mt-sm-0">
          <button className="btn btn-success" onClick={handleAddClick}>
            <i className="ri-add-line align-middle me-1"></i> Add New Item
          </button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search items by code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle table-nowrap mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Item Code</th>
                  <th scope="col">Item Name</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.unique_id}>
                      <td><span className="badge bg-light-primary text-primary">{item.item_code}</span></td>
                      <td className="fw-semibold">{item.item_name}</td>
                      <td>{item.unit}</td>
                      <td>
                        {item.is_active === 1 ? (
                          <span className="badge bg-success-subtle text-success">Active</span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger">Inactive</span>
                        )}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-link text-success p-1"
                          onClick={() => handleEditClick(item)}
                        >
                          <i className="ri-pencil-fill fs-16"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-link text-danger p-1"
                          onClick={() => handleDeleteClick(item.unique_id)}
                        >
                          <i className="ri-delete-bin-fill fs-16"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal implementation using React state */}
      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light">
                <h5 className="modal-title font-weight-bold text-dark">
                  {editingItem ? 'Edit Item' : 'Create Item'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <ItemForm
                  item={editingItem}
                  nextItemCode={getNextItemCode()}
                  onSave={handleSave}
                  onCancel={() => setIsModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
