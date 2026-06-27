import { useState, useEffect } from 'react';
import client from '../api/client';

export default function DataTable({
  columns,
  ajaxUrl,
  extraParams = {},
  onEdit,
  onDelete,
  onView,
  showActiveFilter = true,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [length, setLength] = useState(10);
  const [start, setStart] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('1');
  const [draw, setDraw] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('action', 'datatable');
      params.append('draw', draw.toString());
      params.append('start', start.toString());
      params.append('length', length.toString());
      params.append('search[value]', searchQuery);
      if (showActiveFilter) {
        params.append('active_status', activeStatus);
      }
      
      // Append extra parameters dynamically
      Object.entries(extraParams).forEach(([key, val]) => {
        params.append(key, val);
      });

      const response = await client.post(ajaxUrl, params);
      if (response.data) {
        setData(response.data.data || []);
        setTotalRecords(response.data.recordsFiltered || 0);
      }
    } catch (err) {
      console.error('Error fetching datatable data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [length, start, searchQuery, activeStatus, draw]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setStart(0);
    setDraw(prev => prev + 1);
  };

  const handleLengthChange = (e) => {
    setLength(Number(e.target.value));
    setStart(0);
    setDraw(prev => prev + 1);
  };

  const handleActiveStatusChange = (e) => {
    setActiveStatus(e.target.value);
    setStart(0);
    setDraw(prev => prev + 1);
  };

  const extractUniqueId = (row) => {
    for (const cell of row) {
      if (typeof cell === 'string') {
        const hrefMatch = cell.match(/unique_id=([^"&'\s>]+)/);
        if (hrefMatch) return hrefMatch[1];
        const onclickMatch = cell.match(/_delete\(['"]([^'"]+)['"]\)/);
        if (onclickMatch) return onclickMatch[1];
      }
    }
    return null;
  };

  const renderCell = (cell, colIndex, row) => {
    const isActionsCol = colIndex === row.length - 1;
    const uniqueId = extractUniqueId(row);

    if (isActionsCol && uniqueId) {
      return (
        <div className="hstack gap-2 flex-wrap justify-content-end">
          {onView && (
            <button
              onClick={() => onView(uniqueId)}
              className="btn btn-sm btn-ghost-info waves-effect waves-light"
              title="View"
            >
              <i className="ri-eye-line fs-15"></i>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(uniqueId)}
              className="btn btn-sm btn-ghost-success waves-effect waves-light"
              title="Edit"
            >
              <i className="ri-edit-2-line fs-15"></i>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(uniqueId)}
              className="btn btn-sm btn-ghost-danger waves-effect waves-light"
              title="Delete"
            >
              <i className="ri-delete-bin-line fs-15"></i>
            </button>
          )}
        </div>
      );
    }

    if (typeof cell === 'string' && (cell.includes('<span') || cell.includes('<a') || cell.includes('<button') || cell.includes('<div'))) {
      return <span dangerouslySetInnerHTML={{ __html: cell }} />;
    }

    return cell;
  };

  const currentPage = Math.floor(start / length) + 1;
  const totalPages = Math.ceil(totalRecords / length) || 1;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setStart((page - 1) * length);
    setDraw(prev => prev + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = window.innerWidth < 768 ? 3 : 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // ponytail: reusable DataTable component communicating with legacy PHP same-origin endpoints
  return (
    <div className="card">
      <div className="card-header border-0 align-items-center d-flex flex-wrap gap-3">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted text-nowrap">Show</span>
            <select
              className="form-select form-select-sm"
              style={{ width: '80px' }}
              value={length}
              onChange={handleLengthChange}
              aria-label="Rows per page"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="-1">All</option>
            </select>
            <span className="text-muted text-nowrap">entries</span>
          </div>
        </div>
        <div className="hstack gap-2 flex-wrap">
          {showActiveFilter && (
            <select
              className="form-select form-select-sm"
              style={{ width: '120px' }}
              value={activeStatus}
              onChange={handleActiveStatusChange}
              aria-label="Filter by status"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
              <option value="all">All</option>
            </select>
          )}
          <div className="search-box">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
      <div className="card-body pt-0">
        <div className="table-responsive table-card">
          <table className="table align-middle table-nowrap mb-0">
            <thead className="table-light">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={col.className || ''}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4 text-muted">
                    No matching records found
                  </td>
                </tr>
              ) : (
                data.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className={col.className || ''}>
                        {col.render
                          ? col.render(row[cIdx], row, extractUniqueId(row))
                          : renderCell(row[cIdx], cIdx, row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {length !== -1 && totalRecords > 0 && (
          <div className="align-items-center mt-4 pt-2 justify-content-between d-flex flex-wrap gap-2">
            <div className="text-muted fs-13">
              Showing <span className="fw-semibold">{start + 1}</span> to{' '}
              <span className="fw-semibold">
                {Math.min(start + length, totalRecords)}
              </span>{' '}
              of <span className="fw-semibold">{totalRecords}</span> entries
            </div>
            <ul className="pagination pagination-separated pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
              </li>
              {getPageNumbers().map((page, idx) => (
                <li
                  key={idx}
                  className={`page-item ${currentPage === page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => page !== '...' && handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
