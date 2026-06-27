import React from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';

export default function MainScreenList() {
  const navigate = useNavigate();

  const columns = [
    { label: 'S.No' },
    { label: 'Screen Name' },
    { label: 'Screen Type' },
    { label: 'Screen Order' },
    { 
      label: 'Status',
      render: (val) => <span dangerouslySetInnerHTML={{ __html: val }} />
    },
    { 
      label: 'Action', 
      className: 'text-center',
      render: (val, row) => {
        if (!val) return null;
        const match = val.match(/get_model_load\(['"]([^'"]+)['"]/);
        if (match) {
          return (
            <button 
              className="btn btn-sm btn-ghost-primary waves-effect waves-light" 
              onClick={() => navigate(`/main_screen/form?unique_id=${match[1]}`)}
            >
              <i className="ri-pencil-line fs-15"></i>
            </button>
          );
        }
        return <span dangerouslySetInnerHTML={{ __html: val }} />;
      }
    }
  ];

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Main Screen List</h5>
              </div>
              <div className="col-auto ms-auto">
                <button className="btn btn-primary btn-sm waves-effect waves-light" onClick={() => navigate('/main_screen/form')}>
                  <i className="ri-add-line me-1"></i> Add Main Screen
                </button>
              </div>
            </div>
          </div>

          <div className="card-body pt-0">
            <DataTable
              ajaxUrl="folders/main_screen/crud.php"
              columns={columns}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
