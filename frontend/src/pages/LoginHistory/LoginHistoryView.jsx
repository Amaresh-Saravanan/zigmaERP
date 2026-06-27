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
    if (unique_id && entry_date) {
      fetchViewData();
    }
  }, [unique_id, entry_date]);

  const fetchViewData = async () => {
    setIsLoading(true);
    try {
      const res = await client.get(`folders/login_history/view.php?unique_id=${unique_id}&entry_date=${entry_date}`, { responseType: 'text' });
      const doc = new DOMParser().parseFromString(res.data, 'text/html');
      
      // Extract Header Info
      const userName = doc.querySelector('#user_id')?.textContent?.trim() || '';
      const userType = doc.querySelector('#user_type')?.textContent?.trim() || '';
      const dateStr = doc.querySelector('#entry_date')?.textContent?.trim() || entry_date;
      
      setUserInfo({ name: userName, type: userType, date: dateStr });

      // Extract Table Rows
      const rows = Array.from(doc.querySelectorAll('tbody tr'));
      const parsedSessions = [];
      let total = '';

      rows.forEach(tr => {
        const tds = Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
        
        if (tds.length === 6) {
          parsedSessions.push({
            sno: tds[0],
            date: tds[1],
            login: tds[2],
            logout: tds[3],
            worked: tds[4],
            type: tds[5]
          });
        } else if (tds.length === 3 && tds[0].includes('Total Worked Hours')) {
          total = tds[1];
        }
      });

      setSessions(parsedSessions);
      setTotalHours(total);
      
    } catch (err) {
      console.error('Error fetching view data', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row g-3 mb-3">
      <div className="col-12">
        <div className="card h-md-100 ecommerce-card-min-width">
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">Login History Details</h5>
              </div>
              <div className="col-auto">
                <button onClick={() => navigate('/login_history/list')} className="btn btn-secondary btn-sm">
                  Back to List
                </button>
              </div>
            </div>
          </div>

          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* User Info Header */}
                <div className="row bg-light p-3 rounded mb-4">
                  <div className="col-md-4">
                    <p className="mb-0 text-muted">User Name</p>
                    <h6 className="fw-bold fs-15">{userInfo.name || 'N/A'}</h6>
                  </div>
                  <div className="col-md-4">
                    <p className="mb-0 text-muted">User Type</p>
                    <h6 className="fw-bold fs-15">{userInfo.type || 'N/A'}</h6>
                  </div>
                  <div className="col-md-4">
                    <p className="mb-0 text-muted">Date</p>
                    <h6 className="fw-bold fs-15">{userInfo.date}</h6>
                  </div>
                </div>

                {/* Sessions Table */}
                <div className="table-responsive">
                  <table className="table table-bordered table-striped align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>S.No</th>
                        <th>Entry Date</th>
                        <th>Login Time</th>
                        <th>Logout Time</th>
                        <th>Total Worked Hours</th>
                        <th>Logout Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No login sessions found for this date.
                          </td>
                        </tr>
                      ) : (
                        sessions.map((s, idx) => (
                          <tr key={idx}>
                            <td>{s.sno}</td>
                            <td>{s.date}</td>
                            <td>{s.login}</td>
                            <td>{s.logout}</td>
                            <td>{s.worked}</td>
                            <td>
                              <span className={`badge bg-${s.type === 'Logout' ? 'success' : s.type === 'Login' ? 'info' : 'warning'}`}>
                                {s.type}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {totalHours && (
                      <tfoot>
                        <tr className="bg-light">
                          <td colSpan="4" className="text-end fw-bold text-dark fs-15">
                            Total Worked Hours:
                          </td>
                          <td className="fw-bold text-primary fs-15">{totalHours}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
