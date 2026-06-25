import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">
            {new Date().getFullYear()} © Zigma ERP.
          </div>
          <div className="col-sm-6 text-sm-end">
            Design & Developed by Zigma Team
          </div>
        </div>
      </div>
    </footer>
  );
}
