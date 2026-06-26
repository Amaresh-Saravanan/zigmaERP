import React from 'react';

export default function TrayStatusWidget({ data, unutilizedTrays }) {
  const getIconColor = (index) => {
    const colors = ['#49c1bf', '#f1b44c', '#50a5f1', '#f46a6a', '#34c38f', '#74788d'];
    return colors[index % colors.length];
  };

  return (
    <div className="card card-height-100">
      <div className="card-header align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">Age Wise Tray Status</h4>
      </div>
      <div className="card-body p-0">
        <ul className="list-group list-group-flush border-dashed mb-0">
          {data && data.map((item, idx) => (
            <li key={idx} className="list-group-item ps-0" style={{cursor: 'pointer'}} onClick={() => window.open(`folders/dashboard/tray_status.php?day=${item.tray_age}`, '_blank')}>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 ms-3">
                  <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none">
                      <circle cx="16" cy="16" fill={getIconColor(idx)} r="16"/>
                      <g fill="#fff">
                        <path d="M9 7.281l11.114 5.383 2.845-1.282L11.891 6z" fillOpacity=".304"/>
                        <path d="M20.114 12.651l2.845-1.281v2.865l-2.845 1.281zm0 13.284v-8.937l2.845-1.295v8.951z" fillOpacity=".646"/>
                        <path d="M9 10.146v15.753l11.114-5.06V5.06z"/>
                      </g>
                    </g>
                  </svg>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">{item.tray_age === 'Above 5 Days' ? 'Above 5 Days' : `Day ${item.tray_age}`}</h6>
                  <p className="text-muted mb-0">Active Trays</p>
                </div>
                <div className="flex-shrink-0 text-end pe-3">
                  <h6 className="mb-1">{item.tray_utilized}</h6>
                </div>
              </div>
            </li>
          ))}
          <li className="list-group-item ps-0">
             <div className="d-flex align-items-center">
                <div className="flex-shrink-0 ms-3">
                  <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none">
                      <circle cx="16" cy="16" fill="#343a40" r="16"/>
                    </g>
                  </svg>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">Unutilized Trays</h6>
                  <p className="text-muted mb-0">Total available</p>
                </div>
                <div className="flex-shrink-0 text-end pe-3">
                  <h6 className="mb-1">{unutilizedTrays}</h6>
                </div>
              </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
