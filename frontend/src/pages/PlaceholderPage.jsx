import { useLocation } from 'react-router-dom';
import disname from '../utils/disname';

export default function PlaceholderPage() {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const folder = pathParts[0] || 'Dashboard';
  const action = pathParts[1] || '';

  const title = disname(folder);
  const subtitle = action ? disname(action) : '';

  // ponytail: simple shell page for unmigrated routes to keep build minimal
  return (
    <div className="row">
      <div className="col-12">
        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
          <h4 className="mb-sm-0">{title}</h4>
          <div className="page-title-right">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item"><a href="/">Zigma ERP</a></li>
              <li className="breadcrumb-item active">{title}</li>
              {subtitle && <li className="breadcrumb-item active">{subtitle}</li>}
            </ol>
          </div>
        </div>
      </div>
      <div className="col-12 mt-3">
        <div className="card">
          <div className="card-body text-center p-5">
            <div className="avatar-lg mx-auto mb-4">
              <div className="avatar-title bg-light text-primary rounded-circle fs-24">
                <i className="ri-building-line"></i>
              </div>
            </div>
            <h5>{title} {subtitle && `(${subtitle})`}</h5>
            <p className="text-muted">This module is part of the Zigma ERP React migration. The page shell and routing are successfully configured.</p>
            <a href="/" className="btn btn-primary btn-label waves-effect waves-light">
              <i className="ri-home-line label-icon align-middle fs-16 me-2"></i> Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
