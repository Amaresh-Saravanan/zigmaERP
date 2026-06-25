import React, { useState, useEffect } from 'react';

export default function ItemForm({ item, onSave, onCancel, nextItemCode }) {
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [unit, setUnit] = useState('');
  const [isActive, setIsActive] = useState(1);

  // Load existing item details if editing
  useEffect(() => {
    if (item) {
      setItemCode(item.item_code || '');
      setItemName(item.item_name || '');
      setUnit(item.unit || '');
      setIsActive(item.is_active !== undefined ? item.is_active : 1);
    } else {
      setItemCode(nextItemCode || '');
      setItemName('');
      setUnit('');
      setIsActive(1);
    }
  }, [item, nextItemCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName || !unit) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload = {
      unique_id: item ? item.unique_id : Math.random().toString(36).substr(2, 9),
      item_code: itemCode,
      item_name: itemName,
      unit,
      is_active: Number(isActive)
    };

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="was-validated">
      <div className="mb-3">
        <label htmlFor="item_code" className="form-label">
          Item Code
        </label>
        <input
          type="text"
          className="form-control"
          id="item_code"
          value={itemCode}
          readOnly
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="item_name" className="form-label">
          Item Name
        </label>
        <input
          type="text"
          className="form-control"
          id="item_name"
          placeholder="Enter item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="unit" className="form-label">
          Unit
        </label>
        <select
          className="form-select"
          id="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        >
          <option value="">Select Unit Name</option>
          <option value="kg">kg (Kilogram)</option>
          <option value="g">g (Gram)</option>
          <option value="pcs">pcs (Pieces)</option>
          <option value="trays">trays (Trays)</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="is_active" className="form-label">
          Status
        </label>
        <select
          className="form-select"
          id="is_active"
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          required
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-light" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          {item ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
}
