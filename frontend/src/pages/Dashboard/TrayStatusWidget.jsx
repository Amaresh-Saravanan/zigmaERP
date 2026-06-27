import React from 'react';

export default function TrayStatusWidget({ data, unutilizedTrays }) {
  const getIconColor = (index) => {
    const colors = ['#06B6D4', '#EF4444', '#F59E0B', '#F59E0B', '#10B981'];
    return colors[index % colors.length];
  };

  const getDayItems = () => {
    const items = [];
    for (let i = 1; i <= 5; i++) {
      const found = data?.find(item => item.tray_age === i);
      items.push({
        tray_age: i,
        tray_utilized: found?.tray_utilized || 0
      });
    }
    return items;
  };

  const getAboveFiveDays = () => {
    const found = data?.find(item => item.tray_age === 'Above 5 Days');
    return found?.tray_utilized || 0;
  };

  const dayItems = getDayItems();
  const aboveFiveDays = getAboveFiveDays();

  return (
    <div className="card card-height-100">
      <div className="card-header align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">Age Wise Tray Status</h4>
      </div>
      <div className="card-body p-0">
        <ul className="list-group list-group-flush mb-0">
          {dayItems.map((item, idx) => (
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
                  <h6 className="mb-0">Day {item.tray_age}</h6>
                </div>
                <div className="flex-shrink-0 text-end pe-3">
                  <h6 className="mb-0">{item.tray_utilized}</h6>
                </div>
              </div>
            </li>
          ))}
          <li className="list-group-item ps-0">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 ms-3">
                <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none">
                    <circle cx="16" cy="16" fill="#EF4444" r="16"/>
                    <g fill="#fff">
                      <path d="M9 7.281l11.114 5.383 2.845-1.282L11.891 6z" fillOpacity=".304"/>
                      <path d="M20.114 12.651l2.845-1.281v2.865l-2.845 1.281zm0 13.284v-8.937l2.845-1.295v8.951z" fillOpacity=".646"/>
                      <path d="M9 10.146v15.753l11.114-5.06V5.06z"/>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0">Above 5 Days</h6>
              </div>
              <div className="flex-shrink-0 text-end pe-3">
                <h6 className="mb-0">{aboveFiveDays}</h6>
              </div>
            </div>
          </li>
          <li className="list-group-item ps-0">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 ms-3">
                <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none">
                    <circle cx="16" cy="16" fill="#10B981" r="16"/>
                    <g fill="#fff">
                      <path d="M9 7.281l11.114 5.383 2.845-1.282L11.891 6z" fillOpacity=".304"/>
                      <path d="M20.114 12.651l2.845-1.281v2.865l-2.845 1.281zm0 13.284v-8.937l2.845-1.295v8.951z" fillOpacity=".646"/>
                      <path d="M9 10.146v15.753l11.114-5.06V5.06z"/>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-0">Unutilized Trays</h6>
                <p className="text-muted mb-0" style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>Total available</p>
              </div>
              <div className="flex-shrink-0 text-end pe-3">
                <h6 className="mb-0">{unutilizedTrays}</h6>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
