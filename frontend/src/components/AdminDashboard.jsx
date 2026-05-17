import { useState, useEffect } from 'react'
import axios from 'axios'

function AdminDashboard({ token, onLogout }) {
  const [applications, setApplications] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    fetchApplications()
    fetchAnalytics()
  }, [statusFilter])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/analytics', authConfig)
      if (response.data.success) setAnalytics(response.data.data)
    } catch (err) {
      console.error('Failed to load analytics')
    }
  }

  const fetchApplications = async () => {
    try {
      const url = statusFilter === 'All'
        ? '/api/admin/applications'
        : `/api/admin/applications?status=${statusFilter}`;

      const response = await axios.get(url, authConfig)
      if (response.data.success) setApplications(response.data.data)
    } catch (err) {
      setError('Failed to load applications. Please log in again.');
      onLogout();
    }
  }

  const handleStatusChange = async (id, action) => {
    setError('')
    setSuccess('')
    try {
      const response = await axios.put(`/api/admin/applications/${id}/${action}`, {}, authConfig)
      if (response.data.success) {
        const actionMap = { approve: 'approved', reject: 'rejected', restore: 'restored' }
        setSuccess(`Application #${id} successfully ${actionMap[action]}.`)
        fetchApplications()
        fetchAnalytics()
      }
    } catch (err) {
      setError(`Failed to update application status.`)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    setSuccess('')
    try {
      const response = await axios.delete(`/api/admin/applications/${id}`, authConfig)
      if (response.data.success) {
        setSuccess(`Application #${id} entry deleted from dashboard.`)
        fetchApplications()
        fetchAnalytics()
      }
    } catch (err) {
      setError('Failed to delete application entry.')
    }
  }

  const handleSystemReset = async () => {
    if (!window.confirm('Are you sure you want to clear all student profiles and applications? This cannot be undone.')) return
    setError('')
    setSuccess('')
    try {
      const response = await axios.post('/api/admin/reset', {}, authConfig)
      if (response.data.success) {
        setSuccess(response.data.message)
        setApplications([])
        fetchAnalytics()
      }
    } catch (err) {
      setError('Failed to reset the system data.')
    }
  }

  const getStatusCount = (statusName) => {
    if (!analytics || !analytics.statusCounts) return 0;
    const item = analytics.statusCounts.find(s => s.Status === statusName);
    return item ? item.Count : 0;
  }

  return (
    <div className="animate-fade-in">
      {error && <div className="animate-fade-in" style={{ padding: '12px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px', fontWeight: '500', textAlign: 'center' }}>{error}</div>}
      {success && <div className="animate-fade-in" style={{ padding: '12px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px', fontWeight: '500', textAlign: 'center' }}>{success}</div>}

      {analytics && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--text-main)', margin: '0 0 15px 0' }}>System Analytics Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

            <div className="hover-lift" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', marginTop: 0 }}>Application Funnel</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{getStatusCount('Pending')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{getStatusCount('Approved')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Approved</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{getStatusCount('Rejected')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rejected</div>
                </div>
              </div>
            </div>

            <div className="hover-lift" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', marginTop: 0 }}>Department Demand</h3>
              {analytics.deptStats.map(stat => (
                <div key={stat.Dept_Name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid var(--border-color)', padding: '8px 0' }}>
                  <span style={{ color: 'var(--text-main)' }}>{stat.Dept_Name}</span>
                  <span>
                    <span style={{ color: 'var(--highlight)', fontWeight: 'bold' }}>{stat.Total_Applicants}</span> apps
                    <span style={{ color: 'var(--text-muted)', margin: '0 5px' }}>|</span>
                    avg score: <span style={{ color: 'var(--text-main)' }}>{Number(stat.Avg_Merit).toFixed(1)}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="hover-lift" style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', marginTop: 0 }}>Top Candidates (Pending)</h3>
              {analytics.topCandidates.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No pending applications.</p>
              ) : (
                analytics.topCandidates.map((candidate, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                    <span style={{ color: 'var(--text-main)' }}>{candidate.First_Name} {candidate.Last_Name}</span>
                    <span style={{ color: 'var(--highlight)', fontWeight: 'bold' }}>{candidate.Merit_Score}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Application Records</h2>
          <select
            className="input-focus"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              fontWeight: 'bold',
              color: 'var(--text-main)',
              backgroundColor: 'var(--input-bg)',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Applications</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-interactive"
            onClick={handleSystemReset}
            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Start New Admission Process
          </button>
          <button
            className="btn-interactive"
            onClick={onLogout}
            style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px var(--modal-shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--table-head-bg)' }}>
              <th style={{ padding: '16px', borderBottom: '2px solid var(--border-color)', color: 'var(--table-head-text)', fontWeight: 'bold' }}>ID</th>
              <th style={{ padding: '16px', borderBottom: '2px solid var(--border-color)', color: 'var(--table-head-text)', fontWeight: 'bold' }}>Applicant Name</th>
              <th style={{ padding: '16px', borderBottom: '2px solid var(--border-color)', color: 'var(--table-head-text)', fontWeight: 'bold' }}>Merit Score</th>
              <th style={{ padding: '16px', borderBottom: '2px solid var(--border-color)', color: 'var(--table-head-text)', fontWeight: 'bold' }}>Department</th>
              <th style={{ padding: '16px', borderBottom: '2px solid var(--border-color)', color: 'var(--table-head-text)', fontWeight: 'bold' }}>Date</th>
              <th style={{ padding: '16px', borderBottom: '2px solid var(--border-color)', color: 'var(--table-head-text)', fontWeight: 'bold' }}>Status</th>
              <th style={{ padding: '16px', borderBottom: '2px solid var(--border-color)', color: 'var(--table-head-text)', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
               <tr style={{ borderBottom: '1px solid var(--border-color)', height: '61px' }}>
                 <td colSpan="7" className="animate-fade-in" style={{ padding: '0', margin: '0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '15px', verticalAlign: 'middle', boxSizing: 'border-box' }}>
                   No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} applications found.
                 </td>
               </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.Application_ID} className="table-row-hover animate-fade-in" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', color: 'var(--table-row-text)' }}>{app.Application_ID}</td>
                  <td style={{ padding: '16px', color: 'var(--table-row-text)' }}>{app.First_Name} {app.Last_Name}</td>
                  <td style={{ padding: '16px', color: 'var(--highlight)', fontWeight: 'bold' }}>{app.Merit_Score}</td>
                  <td style={{ padding: '16px', color: 'var(--table-row-text)' }}>{app.Dept_Name}</td>
                  <td style={{ padding: '16px', color: 'var(--table-row-text)' }}>{new Date(app.Application_Date).toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: app.Status === 'Pending' ? '#fff3cd' : app.Status === 'Approved' ? '#d4edda' : '#f8d7da',
                      color: app.Status === 'Pending' ? '#856404' : app.Status === 'Approved' ? '#155724' : '#721c24'
                    }}>
                      {app.Status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {app.Status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          className="btn-interactive"
                          onClick={() => handleStatusChange(app.Application_ID, 'approve')}
                          style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Approve
                        </button>
                        <button
                          className="btn-interactive"
                          onClick={() => handleStatusChange(app.Application_ID, 'reject')}
                          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Reject
                        </button>
                      </div>
                    )}

                    {app.Status === 'Approved' && (
                      <button
                        className="btn-interactive"
                        onClick={() => handleDelete(app.Application_ID)}
                        style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Delete Entry
                      </button>
                    )}

                    {app.Status === 'Rejected' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          className="btn-interactive"
                          onClick={() => handleStatusChange(app.Application_ID, 'restore')}
                          style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Restore
                        </button>
                        <button
                          className="btn-interactive"
                          onClick={() => handleDelete(app.Application_ID)}
                          style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminDashboard