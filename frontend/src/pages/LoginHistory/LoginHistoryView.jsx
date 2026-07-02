import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

export default function LoginHistoryView() {
  const [searchParams] = useSearchParams();
  const unique_id = searchParams.get('unique_id');
  const entry_date = searchParams.get('entry_date');
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [totalHours, setTotalHours] = useState('');
  const [userInfo, setUserInfo] = useState({ name: '', type: '', date: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (unique_id && entry_date) fetchViewData();
  }, [unique_id, entry_date]);

  const fetchViewData = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(
        `folders/login_history/view.php?unique_id=${unique_id}&entry_date=${entry_date}`,
        { responseType: 'text' }
      );
      const doc = new DOMParser().parseFromString(res.data, 'text/html');

      setUserInfo({
        name: doc.querySelector('#user_id')?.textContent?.trim() || '',
        type: doc.querySelector('#user_type')?.textContent?.trim() || '',
        date: doc.querySelector('#entry_date')?.textContent?.trim() || entry_date,
      });

      const rows = Array.from(doc.querySelectorAll('tbody tr'));
      const parsed = [];
      let total = '';

      rows.forEach(tr => {
        const tds = Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
        if (tds.length === 6) {
          parsed.push({ sno: tds[0], date: tds[1], login: tds[2], logout: tds[3], worked: tds[4], type: tds[5] });
        } else if (tds.length === 3 && tds[0].includes('Total Worked Hours')) {
          total = tds[1];
        }
      });

      setSessions(parsed);
      setTotalHours(total);
    } catch (err) {
      console.error('Error fetching view data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const typeBadgeClass = (type) => {
    if (type === 'Logout') return 'badge-soft-success';
    if (type === 'Login')  return 'badge-soft-info';
    return 'badge-soft-warning';
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <div className="d-flex align-items-center justify-content-between">
              <h5>Login History Details</h5>
              <button
                onClick={() => navigate('/login_history/list')}
                className="btn btn-sm"
                style={{ fontSize: '0.78rem', color: 'var(--vz-secondary-color)', border: '1px solid var(--vz-border-color)', borderRadius: 6 }}
              >
                <i className="ri-arrow-left-s-line me-1"></i>Back to list
              </button>
            </div>
          </div>

          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status" style={{ color: '#25a96b', width: 28, height: 28, borderWidth: 2.5 }}>
                  <span className="visually-hidden">Loading…</span>
                </div>
                <p className="mt-2 mb-0" style={{ fontSize: '0.8rem', color: 'var(--vz-secondary-color)' }}>Loading sessions…</p>
              </div>
            ) : (
              <>
                {/* User info strip */}
                <div className="lh-user-strip">
                  <div>
                    <div className="lh-user-strip__label">User Name</div>
                    <div className="lh-user-strip__value">{userInfo.name || '—'}</div>
                  </div>
                  <div>
                    <div className="lh-user-strip__label">User Type</div>
                    <div className="lh-user-strip__value">{userInfo.type || '—'}</div>
                  </div>
                  <div>
                    <div className="lh-user-strip__label">Date</div>
                    <div className="lh-user-strip__value">{userInfo.date}</div>
                  </div>
                  <div>
                    <div className="lh-user-strip__label">Sessions</div>
                    <div className="lh-user-strip__value">{sessions.length}</div>
                  </div>
                </div>

                {/* Timeline */}
                {sessions.length === 0 ? (
                  <div className="text-center py-5" style={{ color: 'var(--vz-secondary-color)' }}>
                    <i className="ri-time-line" style={{ fontSize: 32, opacity: 0.3 }}></i>
                    <p className="mt-2 mb-0" style={{ fontSize: '0.85rem' }}>No login sessions found for this date.</p>
                  </div>
                ) : (
                  <>
                    <ul className="lh-timeline">
                      {sessions.map((s, idx) => (
                        <li key={idx} className="lh-session">
                          <span className="lh-session__dot"></span>
                          <div className="lh-session__times">
                            <div className="lh-session__time-row">
                              <span className="lh-session__time-label">Login</span>
                              <span className="lh-session__time-val">{s.login || '—'}</span>
                              <i className="ri-arrow-right-line" style={{ color: 'var(--vz-border-color)', fontSize: '0.75rem' }}></i>
                              <span className="lh-session__time-label">Logout</span>
                              <span className="lh-session__time-val">{s.logout || '—'}</span>
                            </div>
                            <div className="lh-session__meta">
                              <span className="lh-session__worked">
                                <i className="ri-time-line"></i>
                                Worked: <strong>{s.worked || '—'}</strong>
                              </span>
                              <span className={`badge ${typeBadgeClass(s.type)}`}>{s.type}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--vz-tertiary-color)', fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>
                            #{s.sno}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {totalHours && (
                      <div className="lh-total-bar">
                        <span className="lh-total-bar__label">
                          <i className="ri-timer-line me-2"></i>Total Worked Hours
                        </span>
                        <span className="lh-total-bar__value">{totalHours}</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
