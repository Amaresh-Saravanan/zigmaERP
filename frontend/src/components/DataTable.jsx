import { useState, useEffect } from 'react';
import client from '../api/client';

// Skeleton row — shown while loading (U-16)
function SkeletonRows({ cols, rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="dt-skeleton-row">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j}>
          <div
            className="dt-skeleton-cell"
            style={{ width: j === cols - 1 ? 80 : `${60 + ((i + j) % 3) * 15}%` }}
          />
        </td>
      ))}
    </tr>
  ));
}

// Empty state — icon + message (U-15)
function EmptyState({ cols, isFiltered }) {
  return (
    <tr>
      <td colSpan={cols} className="text-center py-5">
        <div className="dt-empty-state">
          <i className={isFiltered ? 'ri-search-line' : 'ri-inbox-2-line'}></i>
          <p className="dt-empty-title">
            {isFiltered ? 'No results found' : 'No records yet'}
          </p>
          <p className="dt-empty-sub">
            {isFiltered
              ? 'Try adjusting your search or filter.'
              : 'Records will appear here once added.'}
          </p>
        </div>
      </td>
    </tr>
  );
}

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
      if (showActiveFilter) params.append('active_status', activeStatus);
      Object.entries(extraParams).forEach(([k, v]) => params.append(k, v));

      const response = await client.post(ajaxUrl, params);
      if (response.data) {
        setData(response.data.data || []);
        setTotalRecords(response.data.recordsFiltered || 0);
      }
    } catch (err) {
      console.error('DataTable fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [length, start, searchQuery, activeStatus, draw]);

  const handleSearchChange = (e) => { setSearchQuery(e.target.value); setStart(0); setDraw(d => d + 1); };
  const handleLengthChange  = (e) => { setLength(Number(e.target.value)); setStart(0); setDraw(d => d + 1); };
  const handleStatusChange  = (e) => { setActiveStatus(e.target.value); setStart(0); setDraw(d => d + 1); };

  const extractUniqueId = (row) => {
    for (const cell of row) {
      if (typeof cell === 'string') {
        const m = cell.match(/unique_id=([^"&'\s>]+)/) || cell.match(/_delete\(['"]([^'"]+)['"]\)/);
        if (m) return m[1];
      }
    }
    return null;
  };

  const renderCell = (cell, colIndex, row) => {
    const isActionsCol = colIndex === row.length - 1;
    const uniqueId = extractUniqueId(row);

    if (isActionsCol && uniqueId) {
      return (
        <div className="hstack gap-1 justify-content-end">
          {onView && (
            <button onClick={() => onView(uniqueId)} className="dt-action-btn dt-action-view" title="View" aria-label="View">
              <i className="ri-eye-line"></i>
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(uniqueId)} className="dt-action-btn dt-action-edit" title="Edit" aria-label="Edit">
              <i className="ri-edit-2-line"></i>
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(uniqueId)} className="dt-action-btn dt-action-delete" title="Delete" aria-label="Delete">
              <i className="ri-delete-bin-line"></i>
            </button>
          )}
        </div>
      );
    }

    if (typeof cell === 'string' && /<[a-z][\s\S]*>/i.test(cell)) {
      return <span dangerouslySetInnerHTML={{ __html: cell }} />;
    }
    return cell;
  };

  const currentPage = Math.floor(start / length) + 1;
  const totalPages  = Math.ceil(totalRecords / length) || 1;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setStart((page - 1) * length);
    setDraw(d => d + 1);
  };

  const getPageNumbers = () => {
    const maxVisible = window.innerWidth < 768 ? 3 : 7;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('…');
    const lo = Math.max(2, currentPage - 1);
    const hi = Math.min(totalPages - 1, currentPage + 1);
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  // ponytail: reusable DataTable component communicating with legacy PHP same-origin endpoints
  return (
    <div className="card dt-card">

      {/* ── Toolbar ── */}
      <div className="card-header border-0 dt-toolbar">
        <div className="d-flex align-items-center gap-2">
          <span className="dt-label">Show</span>
          <select
            className="form-select form-select-sm dt-length-select"
            value={length}
            onChange={handleLengthChange}
            aria-label="Rows per page"
          >
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            <option value="-1">All</option>
          </select>
          <span className="dt-label">entries</span>
        </div>

        <div className="hstack gap-2 flex-wrap">
          {showActiveFilter && (
            <select
              className="form-select form-select-sm dt-status-select"
              value={activeStatus}
              onChange={handleStatusChange}
              aria-label="Filter by status"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
              <option value="all">All</option>
            </select>
          )}

          {/* Table-level search */}
          <div className="dt-search-wrap position-relative">
            <i className="ri-search-line dt-search-icon"></i>
            <input
              type="search"
              className="form-control form-control-sm dt-search-input"
              placeholder="Search table…"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search table"
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card-body pt-0 px-0">
        <div className="table-responsive">
          <table className="table dt-table align-middle mb-0">

            {/* Sticky header (U-12) */}
            <thead className="dt-thead">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={`dt-th ${col.className || ''}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading
                ? <SkeletonRows cols={columns.length} rows={length > 10 ? 8 : 5} />
                : data.length === 0
                  ? <EmptyState cols={columns.length} isFiltered={!!searchQuery} />
                  : data.map((row, rIdx) => (
                      <tr key={rIdx} className="dt-row">
                        {columns.map((col, cIdx) => (
                          <td key={cIdx} className={`dt-td ${col.className || ''}`}>
                            {col.render
                              ? col.render(row[cIdx], row, extractUniqueId(row))
                              : renderCell(row[cIdx], cIdx, row)}
                          </td>
                        ))}
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>

        {/* ── Pagination (U-17) ── */}
        {length !== -1 && totalRecords > 0 && (
          <div className="dt-pagination-bar">
            <span className="dt-count">
              Showing <strong>{start + 1}</strong>–<strong>{Math.min(start + length, totalRecords)}</strong> of <strong>{totalRecords}</strong>
            </span>

            <nav aria-label="Table pagination">
              <ul className="dt-pagination">
                <li className={currentPage === 1 ? 'dt-page-item disabled' : 'dt-page-item'}>
                  <button className="dt-page-btn" onClick={() => handlePageChange(currentPage - 1)} aria-label="Previous page">
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                </li>

                {getPageNumbers().map((page, idx) => (
                  <li key={idx} className={`dt-page-item ${page === currentPage ? 'active' : ''} ${page === '…' ? 'disabled' : ''}`}>
                    <button
                      className="dt-page-btn"
                      onClick={() => page !== '…' && handlePageChange(page)}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li className={currentPage === totalPages ? 'dt-page-item disabled' : 'dt-page-item'}>
                  <button className="dt-page-btn" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next page">
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
