import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [view, setView] = useState('student')
  const [departments, setDepartments] = useState([])
  const [applications, setApplications] = useState([])
  const [analytics, setAnalytics] = useState(null)

  const [studentError, setStudentError] = useState('')
  const [studentSuccess, setStudentSuccess] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminSuccess, setAdminSuccess] = useState('')

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const [authData, setAuthData] = useState({ username: '', password: '', confirmPassword: '' })
  const [statusFilter, setStatusFilter] = useState('All')

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', merit_score: '', dept_id: ''
  })

  const authConfig = {
    headers: { Authorization: `Bearer ${adminToken}` }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (view === 'admin' && isAdminAuthenticated) {
      fetchApplications()
      fetchAnalytics()
    }
  }, [statusFilter, view, isAdminAuthenticated])

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments')
      if (response.data.success) setDepartments(response.data.data)
    } catch (err) {
      setStudentError('Failed to load departments.')
      setAdminError('Failed to load departments.')
    }
  }

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
      setAdminError('Failed to load applications. Please log in again.');
      setIsAdminAuthenticated(false);
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    if (authData.password !== authData.confirmPassword) {
      setAdminError("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post('/api/admin/register', {
        username: authData.username,
        password: authData.password
      });
      if (res.data.success) {
        setAdminSuccess(res.data.message);
        setAuthData({ username: '', password: '', confirmPassword: '' });
        setIsLoginMode(true);
      }
    } catch (err) {
      setAdminError(err.response?.data?.message || 'Failed to create account.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    try {
      const res = await axios.post('/api/admin/login', {
        username: authData.username,
        password: authData.password
      });
      if (res.data.success) {
        setAdminToken(res.data.token);
        setIsAdminAuthenticated(true);
        setAuthData({ username: '', password: '', confirmPassword: '' });
        setAdminSuccess('Login successful!');
        setTimeout(() => setAdminSuccess(''), 3000);
      }
    } catch (err) {
      setAdminError(err.response?.data?.message || 'Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminToken('');
    setApplications([]);
    setAnalytics(null);
    setAdminError('');
    setAdminSuccess('');
  };

  const handleStatusChange = async (id, action) => {
    setAdminError('')
    setAdminSuccess('')
    try {
      const response = await axios.put(`/api/admin/applications/${id}/${action}`, {}, authConfig)
      if (response.data.success) {
        const actionMap = { approve: 'approved', reject: 'rejected', restore: 'restored' }
        setAdminSuccess(`Application #${id} successfully ${actionMap[action]}.`)
        fetchApplications()
        fetchDepartments()
        if (isAdminAuthenticated) fetchAnalytics()
      }
    } catch (err) {
      setAdminError(`Failed to update application status.`)
    }
  }

  const handleDelete = async (id) => {
    setAdminError('')
    setAdminSuccess('')
    try {
      const response = await axios.delete(`/api/admin/applications/${id}`, authConfig)
      if (response.data.success) {
        setAdminSuccess(`Application #${id} entry deleted from dashboard.`)
        fetchApplications()
        if (isAdminAuthenticated) fetchAnalytics()
      }
    } catch (err) {
      setAdminError('Failed to delete application entry.')
    }
  }

  const handleSystemReset = async () => {
    if (!window.confirm('Are you sure you want to clear all student profiles and applications? This cannot be undone.')) return
    setAdminError('')
    setAdminSuccess('')
    try {
      const response = await axios.post('/api/admin/reset', {}, authConfig)
      if (response.data.success) {
        setAdminSuccess(response.data.message)
        setApplications([])
        fetchDepartments()
        if (isAdminAuthenticated) fetchAnalytics()
      }
    } catch (err) {
      setAdminError('Failed to reset the system data.')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStudentError('')
    setStudentSuccess('')

    try {
      const studentResponse = await axios.post('/api/students', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        merit_score: formData.merit_score
      })

      const appResponse = await axios.post('/api/applications', {
        student_id: studentResponse.data.studentId,
        dept_id: formData.dept_id
      })

      setStudentSuccess(`Application submitted successfully! Application ID: ${appResponse.data.applicationId}`)
      setFormData({ first_name: '', last_name: '', email: '', phone: '', merit_score: '', dept_id: '' })
      if (isAdminAuthenticated) fetchAnalytics()
    } catch (err) {
      setStudentError(err.response?.data?.message || 'Failed to submit application.')
    }
  }

  const getStatusCount = (statusName) => {
    if (!analytics || !analytics.statusCounts) return 0;
    const item = analytics.statusCounts.find(s => s.Status === statusName);
    return item ? item.Count : 0;
  }

  return (
      <div
          className="theme-transition"
          style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-main)",
              minHeight: "100vh",
              padding: "20px",
              fontFamily: "system-ui",
          }}
      >
          <style>
              {`
          :root {
            --bg-color: ${isDarkMode ? "#12141c" : "#dee2e6"};
            --card-bg: ${isDarkMode ? "#1a1d26" : "#ffffff"};
            --border-color: ${isDarkMode ? "#2d313f" : "#dee2e6"};
            --text-main: ${isDarkMode ? "#ffffff" : "#212529"};
            --text-muted: ${isDarkMode ? "#a0a5b5" : "#6c757d"};
            --input-bg: ${isDarkMode ? "#222633" : "#ffffff"};
            --highlight: ${isDarkMode ? "#00ffcc" : "#007BFF"};
            --table-head-bg: ${isDarkMode ? "#ffffff" : "#e9ecef"};
            --table-head-text: ${isDarkMode ? "#000000" : "#212529"};
            --table-row-text: ${isDarkMode ? "#d1d5db" : "#495057"};
            --hover-bg: ${isDarkMode ? "#222633" : "#f8f9fa"};
            --btn-inactive-bg: ${isDarkMode ? "#222633" : "#e9ecef"};
            --modal-shadow: ${isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"};
          }

          .theme-transition, .theme-transition * {
            transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          .hover-lift {
            transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
          }
          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px var(--modal-shadow);
            border-color: var(--highlight);
          }
          .btn-interactive {
            transition: transform 0.2s ease, filter 0.2s ease;
          }
          .btn-interactive:hover {
            filter: brightness(1.1);
            transform: scale(1.02);
          }
          .btn-interactive:active {
            transform: scale(0.97);
          }
          .table-row-hover:hover {
            background-color: var(--hover-bg) !important;
          }
          .input-focus:focus {
            outline: none;
            border-color: var(--highlight) !important;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
          }

          select option {
            background-color: var(--card-bg);
            color: var(--text-main);
          }
        `}
          </style>

          <div
              className="animate-fade-in"
              style={{ maxWidth: "1000px", margin: "0 auto" }}
          >
              <div
                  style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "2px solid var(--border-color)",
                      paddingBottom: "20px",
                      marginBottom: "20px",
                  }}
              >
                  <h1
                      style={{
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          color: "var(--text-main)",
                      }}
                  >
                      Admission System
                      <button
                          className="btn-interactive"
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          style={{
                              background: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: "20px",
                              padding: 0,
                              color: "var(--text-main)",
                          }}
                      >
                          {isDarkMode ? "☀️" : "🌙"}
                      </button>
                  </h1>
                  <div>
                      <button
                          className="btn-interactive"
                          onClick={() => {
                              setView("student");
                              setStudentError("");
                              setStudentSuccess("");
                          }}
                          style={{
                              marginRight: "10px",
                              padding: "8px 16px",
                              cursor: "pointer",
                              backgroundColor:
                                  view === "student"
                                      ? "#007BFF"
                                      : "var(--btn-inactive-bg)",
                              color:
                                  view === "student"
                                      ? "#fff"
                                      : "var(--text-muted)",
                              fontWeight:
                                  view === "student" ? "bold" : "normal",
                              border: "1px solid var(--border-color)",
                              borderRadius: "4px",
                          }}
                      >
                          Student Portal
                      </button>
                      <button
                          className="btn-interactive"
                          onClick={() => {
                              setView("admin");
                              setAdminError("");
                              setAdminSuccess("");
                          }}
                          style={{
                              padding: "8px 16px",
                              cursor: "pointer",
                              backgroundColor:
                                  view === "admin"
                                      ? "#007BFF"
                                      : "var(--btn-inactive-bg)",
                              color:
                                  view === "admin"
                                      ? "#fff"
                                      : "var(--text-muted)",
                              fontWeight: view === "admin" ? "bold" : "normal",
                              border: "1px solid var(--border-color)",
                              borderRadius: "4px",
                          }}
                      >
                          Admin Dashboard
                      </button>
                  </div>
              </div>

              {view === "student" ? (
                  <div key="student-view" className="animate-fade-in">
                      {studentError && (
                          <div
                              className="animate-fade-in"
                              style={{
                                  padding: "12px",
                                  backgroundColor: "#f8d7da",
                                  color: "#721c24",
                                  borderRadius: "4px",
                                  marginBottom: "15px",
                                  fontWeight: "500",
                                  textAlign: "center",
                              }}
                          >
                              {studentError}
                          </div>
                      )}
                      {studentSuccess && (
                          <div
                              className="animate-fade-in"
                              style={{
                                  padding: "12px",
                                  backgroundColor: "#d4edda",
                                  color: "#155724",
                                  borderRadius: "4px",
                                  marginBottom: "15px",
                                  fontWeight: "500",
                                  textAlign: "center",
                              }}
                          >
                              {studentSuccess}
                          </div>
                      )}

                      <h2
                          style={{
                              color: "var(--text-main)",
                              textAlign: "center",
                          }}
                      >
                          Available Departments
                      </h2>
                      <div
                          style={{
                              display: "flex",
                              gap: "20px",
                              flexWrap: "wrap",
                              justifyContent: "center",
                              marginBottom: "40px",
                          }}
                      >
                          {departments.map((dept) => (
                              <div
                                  key={dept.Dept_ID}
                                  className="hover-lift"
                                  style={{
                                      backgroundColor: "var(--card-bg)",
                                      border: "1px solid var(--border-color)",
                                      padding: "20px",
                                      borderRadius: "8px",
                                      minWidth: "220px",
                                      textAlign: "center",
                                  }}
                              >
                                  <h3
                                      style={{
                                          marginTop: 0,
                                          color: "var(--text-main)",
                                      }}
                                  >
                                      {dept.Dept_Name}
                                  </h3>
                                  <p
                                      style={{
                                          marginBottom: 0,
                                          color: "var(--text-muted)",
                                          fontWeight: "500",
                                      }}
                                  >
                                      Total Seats:{" "}
                                      <span
                                          style={{ color: "var(--highlight)" }}
                                      >
                                          {dept.Total_Seats}
                                      </span>
                                  </p>
                              </div>
                          ))}
                      </div>

                      <h2
                          style={{
                              color: "var(--text-main)",
                              textAlign: "center",
                          }}
                      >
                          Submit Application
                      </h2>
                      <form
                          onSubmit={handleSubmit}
                          style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "15px",
                              width: "100%",
                              maxWidth: "500px",
                              margin: "0 auto",
                          }}
                      >
                          <input
                              className="input-focus"
                              type="text"
                              name="first_name"
                              placeholder="First Name"
                              value={formData.first_name}
                              onChange={handleChange}
                              required
                              style={{
                                  padding: "12px",
                                  backgroundColor: "var(--input-bg)",
                                  border: "1px solid var(--border-color)",
                                  color: "var(--text-main)",
                                  borderRadius: "4px",
                              }}
                          />
                          <input
                              className="input-focus"
                              type="text"
                              name="last_name"
                              placeholder="Last Name"
                              value={formData.last_name}
                              onChange={handleChange}
                              required
                              style={{
                                  padding: "12px",
                                  backgroundColor: "var(--input-bg)",
                                  border: "1px solid var(--border-color)",
                                  color: "var(--text-main)",
                                  borderRadius: "4px",
                              }}
                          />
                          <input
                              className="input-focus"
                              type="email"
                              name="email"
                              placeholder="Email Address"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              style={{
                                  padding: "12px",
                                  backgroundColor: "var(--input-bg)",
                                  border: "1px solid var(--border-color)",
                                  color: "var(--text-main)",
                                  borderRadius: "4px",
                              }}
                          />
                          <input
                              className="input-focus"
                              type="text"
                              name="phone"
                              placeholder="Phone Number"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                              style={{
                                  padding: "12px",
                                  backgroundColor: "var(--input-bg)",
                                  border: "1px solid var(--border-color)",
                                  color: "var(--text-main)",
                                  borderRadius: "4px",
                              }}
                          />
                          <input
                              className="input-focus"
                              type="number"
                              step="0.01"
                              name="merit_score"
                              placeholder="Merit Score"
                              value={formData.merit_score}
                              onChange={handleChange}
                              required
                              style={{
                                  padding: "12px",
                                  backgroundColor: "var(--input-bg)",
                                  border: "1px solid var(--border-color)",
                                  color: "var(--text-main)",
                                  borderRadius: "4px",
                              }}
                          />

                          <select
                              className="input-focus"
                              name="dept_id"
                              value={formData.dept_id}
                              onChange={handleChange}
                              required
                              style={{
                                  padding: "12px",
                                  backgroundColor: "var(--input-bg)",
                                  border: "1px solid var(--border-color)",
                                  color: "var(--text-main)",
                                  borderRadius: "4px",
                              }}
                          >
                              <option value="" disabled>
                                  Select a Department
                              </option>
                              {departments.map((dept) => (
                                  <option
                                      key={dept.Dept_ID}
                                      value={dept.Dept_ID}
                                  >
                                      {dept.Dept_Name}
                                  </option>
                              ))}
                          </select>

                          <button
                              className="btn-interactive"
                              type="submit"
                              style={{
                                  padding: "14px",
                                  backgroundColor: "#007BFF",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  marginTop: "10px",
                              }}
                          >
                              Submit Application
                          </button>
                      </form>
                  </div>
              ) : (
                  <div key="admin-view" className="animate-fade-in">
                      {adminError && (
                          <div
                              className="animate-fade-in"
                              style={{
                                  padding: "12px",
                                  backgroundColor: "#f8d7da",
                                  color: "#721c24",
                                  borderRadius: "4px",
                                  marginBottom: "15px",
                                  fontWeight: "500",
                                  textAlign: "center",
                              }}
                          >
                              {adminError}
                          </div>
                      )}
                      {adminSuccess && (
                          <div
                              className="animate-fade-in"
                              style={{
                                  padding: "12px",
                                  backgroundColor: "#d4edda",
                                  color: "#155724",
                                  borderRadius: "4px",
                                  marginBottom: "15px",
                                  fontWeight: "500",
                                  textAlign: "center",
                              }}
                          >
                              {adminSuccess}
                          </div>
                      )}

                      {!isAdminAuthenticated ? (
                          <div
                              key={isLoginMode ? "login" : "register"}
                              className="animate-fade-in hover-lift"
                              style={{
                                  maxWidth: "400px",
                                  margin: "60px auto",
                                  backgroundColor: "var(--card-bg)",
                                  padding: "30px",
                                  borderRadius: "8px",
                                  border: "1px solid var(--border-color)",
                                  boxShadow: "0 4px 15px var(--modal-shadow)",
                              }}
                          >
                              <h2
                                  style={{
                                      color: "var(--text-main)",
                                      textAlign: "center",
                                      marginTop: 0,
                                      marginBottom: "20px",
                                  }}
                              >
                                  {isLoginMode
                                      ? "Admin Authentication"
                                      : "Create Admin Account"}
                              </h2>

                              <form
                                  onSubmit={
                                      isLoginMode ? handleLogin : handleRegister
                                  }
                                  style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "15px",
                                  }}
                              >
                                  <input
                                      className="input-focus"
                                      type="text"
                                      placeholder="Username"
                                      value={authData.username}
                                      onChange={(e) =>
                                          setAuthData({
                                              ...authData,
                                              username: e.target.value,
                                          })
                                      }
                                      required
                                      style={{
                                          padding: "12px",
                                          backgroundColor: "var(--input-bg)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-main)",
                                          borderRadius: "4px",
                                      }}
                                  />
                                  <input
                                      className="input-focus"
                                      type="password"
                                      placeholder="Password"
                                      value={authData.password}
                                      onChange={(e) =>
                                          setAuthData({
                                              ...authData,
                                              password: e.target.value,
                                          })
                                      }
                                      required
                                      style={{
                                          padding: "12px",
                                          backgroundColor: "var(--input-bg)",
                                          border: "1px solid var(--border-color)",
                                          color: "var(--text-main)",
                                          borderRadius: "4px",
                                      }}
                                  />

                                  {!isLoginMode && (
                                      <input
                                          className="input-focus animate-fade-in"
                                          type="password"
                                          placeholder="Confirm Password"
                                          value={authData.confirmPassword}
                                          onChange={(e) =>
                                              setAuthData({
                                                  ...authData,
                                                  confirmPassword:
                                                      e.target.value,
                                              })
                                          }
                                          required
                                          style={{
                                              padding: "12px",
                                              backgroundColor:
                                                  "var(--input-bg)",
                                              border: "1px solid var(--border-color)",
                                              color: "var(--text-main)",
                                              borderRadius: "4px",
                                          }}
                                      />
                                  )}

                                  <button
                                      className="btn-interactive"
                                      type="submit"
                                      style={{
                                          padding: "14px",
                                          backgroundColor: isLoginMode
                                              ? "#28a745"
                                              : "#007BFF",
                                          color: "white",
                                          border: "none",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          fontWeight: "bold",
                                          marginTop: "10px",
                                      }}
                                  >
                                      {isLoginMode
                                          ? "Secure Login"
                                          : "Register Account"}
                                  </button>
                              </form>

                              <div
                                  style={{
                                      textAlign: "center",
                                      marginTop: "20px",
                                  }}
                              >
                                  <button
                                      onClick={() => {
                                          setIsLoginMode(!isLoginMode);
                                          setAdminError("");
                                          setAdminSuccess("");
                                          setAuthData({
                                              username: "",
                                              password: "",
                                              confirmPassword: "",
                                          });
                                      }}
                                      style={{
                                          background: "none",
                                          border: "none",
                                          color: "var(--highlight)",
                                          cursor: "pointer",
                                          textDecoration: "underline",
                                          fontSize: "14px",
                                      }}
                                  >
                                      {isLoginMode
                                          ? "Don't have an account? Sign Up"
                                          : "Already have an account? Log In"}
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div key="dashboard" className="animate-fade-in">
                              {analytics && (
                                  <div style={{ marginBottom: "40px" }}>
                                      <h2
                                          style={{
                                              color: "var(--text-main)",
                                              margin: "0 0 15px 0",
                                          }}
                                      >
                                          System Analytics Overview
                                      </h2>
                                      <div
                                          style={{
                                              display: "grid",
                                              gridTemplateColumns:
                                                  "repeat(auto-fit, minmax(300px, 1fr))",
                                              gap: "20px",
                                          }}
                                      >
                                          <div
                                              className="hover-lift"
                                              style={{
                                                  backgroundColor:
                                                      "var(--card-bg)",
                                                  padding: "20px",
                                                  borderRadius: "8px",
                                                  border: "1px solid var(--border-color)",
                                              }}
                                          >
                                              <h3
                                                  style={{
                                                      color: "var(--text-muted)",
                                                      fontSize: "14px",
                                                      textTransform:
                                                          "uppercase",
                                                      marginTop: 0,
                                                  }}
                                              >
                                                  Application Funnel
                                              </h3>
                                              <div
                                                  style={{
                                                      display: "flex",
                                                      justifyContent:
                                                          "space-between",
                                                      marginTop: "15px",
                                                  }}
                                              >
                                                  <div
                                                      style={{
                                                          textAlign: "center",
                                                      }}
                                                  >
                                                      <div
                                                          style={{
                                                              fontSize: "24px",
                                                              fontWeight:
                                                                  "bold",
                                                              color: "#f59e0b",
                                                          }}
                                                      >
                                                          {getStatusCount(
                                                              "Pending",
                                                          )}
                                                      </div>
                                                      <div
                                                          style={{
                                                              fontSize: "12px",
                                                              color: "var(--text-muted)",
                                                          }}
                                                      >
                                                          Pending
                                                      </div>
                                                  </div>
                                                  <div
                                                      style={{
                                                          textAlign: "center",
                                                      }}
                                                  >
                                                      <div
                                                          style={{
                                                              fontSize: "24px",
                                                              fontWeight:
                                                                  "bold",
                                                              color: "#28a745",
                                                          }}
                                                      >
                                                          {getStatusCount(
                                                              "Approved",
                                                          )}
                                                      </div>
                                                      <div
                                                          style={{
                                                              fontSize: "12px",
                                                              color: "var(--text-muted)",
                                                          }}
                                                      >
                                                          Approved
                                                      </div>
                                                  </div>
                                                  <div
                                                      style={{
                                                          textAlign: "center",
                                                      }}
                                                  >
                                                      <div
                                                          style={{
                                                              fontSize: "24px",
                                                              fontWeight:
                                                                  "bold",
                                                              color: "#dc3545",
                                                          }}
                                                      >
                                                          {getStatusCount(
                                                              "Rejected",
                                                          )}
                                                      </div>
                                                      <div
                                                          style={{
                                                              fontSize: "12px",
                                                              color: "var(--text-muted)",
                                                          }}
                                                      >
                                                          Rejected
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>

                                          <div
                                              className="hover-lift"
                                              style={{
                                                  backgroundColor:
                                                      "var(--card-bg)",
                                                  padding: "20px",
                                                  borderRadius: "8px",
                                                  border: "1px solid var(--border-color)",
                                              }}
                                          >
                                              <h3
                                                  style={{
                                                      color: "var(--text-muted)",
                                                      fontSize: "14px",
                                                      textTransform:
                                                          "uppercase",
                                                      marginTop: 0,
                                                  }}
                                              >
                                                  Department Demand
                                              </h3>
                                              {analytics.deptStats.map(
                                                  (stat) => (
                                                      <div
                                                          key={stat.Dept_Name}
                                                          style={{
                                                              display: "flex",
                                                              justifyContent:
                                                                  "space-between",
                                                              fontSize: "13px",
                                                              borderBottom:
                                                                  "1px solid var(--border-color)",
                                                              padding: "8px 0",
                                                          }}
                                                      >
                                                          <span
                                                              style={{
                                                                  color: "var(--text-main)",
                                                              }}
                                                          >
                                                              {stat.Dept_Name}
                                                          </span>
                                                          <span>
                                                              <span
                                                                  style={{
                                                                      color: "var(--highlight)",
                                                                      fontWeight:
                                                                          "bold",
                                                                  }}
                                                              >
                                                                  {
                                                                      stat.Total_Applicants
                                                                  }
                                                              </span>{" "}
                                                              apps
                                                              <span
                                                                  style={{
                                                                      color: "var(--text-muted)",
                                                                      margin: "0 5px",
                                                                  }}
                                                              >
                                                                  |
                                                              </span>
                                                              avg score:{" "}
                                                              <span
                                                                  style={{
                                                                      color: "var(--text-main)",
                                                                  }}
                                                              >
                                                                  {Number(
                                                                      stat.Avg_Merit,
                                                                  ).toFixed(1)}
                                                              </span>
                                                          </span>
                                                      </div>
                                                  ),
                                              )}
                                          </div>

                                          <div
                                              className="hover-lift"
                                              style={{
                                                  backgroundColor:
                                                      "var(--card-bg)",
                                                  padding: "20px",
                                                  borderRadius: "8px",
                                                  border: "1px solid var(--border-color)",
                                              }}
                                          >
                                              <h3
                                                  style={{
                                                      color: "var(--text-muted)",
                                                      fontSize: "14px",
                                                      textTransform:
                                                          "uppercase",
                                                      marginTop: 0,
                                                  }}
                                              >
                                                  Top Candidates (Pending)
                                              </h3>
                                              {analytics.topCandidates
                                                  .length === 0 ? (
                                                  <p
                                                      style={{
                                                          fontSize: "13px",
                                                          color: "var(--text-muted)",
                                                          fontStyle: "italic",
                                                      }}
                                                  >
                                                      No pending applications.
                                                  </p>
                                              ) : (
                                                  analytics.topCandidates.map(
                                                      (candidate, idx) => (
                                                          <div
                                                              key={idx}
                                                              style={{
                                                                  display:
                                                                      "flex",
                                                                  justifyContent:
                                                                      "space-between",
                                                                  fontSize:
                                                                      "13px",
                                                                  padding:
                                                                      "4px 0",
                                                              }}
                                                          >
                                                              <span
                                                                  style={{
                                                                      color: "var(--text-main)",
                                                                  }}
                                                              >
                                                                  {
                                                                      candidate.First_Name
                                                                  }{" "}
                                                                  {
                                                                      candidate.Last_Name
                                                                  }
                                                              </span>
                                                              <span
                                                                  style={{
                                                                      color: "var(--highlight)",
                                                                      fontWeight:
                                                                          "bold",
                                                                  }}
                                                              >
                                                                  {
                                                                      candidate.Merit_Score
                                                                  }
                                                              </span>
                                                          </div>
                                                      ),
                                                  )
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              )}

                              <div
                                  style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      marginBottom: "20px",
                                  }}
                              >
                                  <div
                                      style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "15px",
                                      }}
                                  >
                                      <h2
                                          style={{
                                              margin: 0,
                                              color: "var(--text-main)",
                                          }}
                                      >
                                          Application Records
                                      </h2>
                                      <select
                                          className="input-focus"
                                          value={statusFilter}
                                          onChange={(e) =>
                                              setStatusFilter(e.target.value)
                                          }
                                          style={{
                                              padding: "8px 12px",
                                              borderRadius: "4px",
                                              border: "1px solid var(--border-color)",
                                              fontWeight: "bold",
                                              color: "var(--text-main)",
                                              backgroundColor:
                                                  "var(--input-bg)",
                                              cursor: "pointer",
                                          }}
                                      >
                                          <option value="All">
                                              All Applications
                                          </option>
                                          <option value="Pending">
                                              Pending
                                          </option>
                                          <option value="Approved">
                                              Approved
                                          </option>
                                          <option value="Rejected">
                                              Rejected
                                          </option>
                                      </select>
                                  </div>

                                  <div style={{ display: "flex", gap: "10px" }}>
                                      <button
                                          className="btn-interactive"
                                          onClick={handleSystemReset}
                                          style={{
                                              backgroundColor: "#dc3545",
                                              color: "white",
                                              border: "none",
                                              padding: "10px 20px",
                                              borderRadius: "4px",
                                              cursor: "pointer",
                                              fontWeight: "bold",
                                          }}
                                      >
                                          Start New Admission Process
                                      </button>
                                      <button
                                          className="btn-interactive"
                                          onClick={handleLogout}
                                          style={{
                                              backgroundColor: "#6c757d",
                                              color: "white",
                                              border: "none",
                                              padding: "10px 20px",
                                              borderRadius: "4px",
                                              cursor: "pointer",
                                              fontWeight: "bold",
                                          }}
                                      >
                                          Logout
                                      </button>
                                  </div>
                              </div>

                              <div
                                  style={{
                                      overflowX: "auto",
                                      backgroundColor: "var(--card-bg)",
                                      borderRadius: "8px",
                                      border: "1px solid var(--border-color)",
                                      boxShadow:
                                          "0 4px 6px var(--modal-shadow)",
                                  }}
                              >
                                  <table
                                      style={{
                                          width: "100%",
                                          borderCollapse: "collapse",
                                          textAlign: "left",
                                      }}
                                  >
                                      <thead>
                                          <tr
                                              style={{
                                                  backgroundColor:
                                                      "var(--table-head-bg)",
                                              }}
                                          >
                                              <th
                                                  style={{
                                                      padding: "16px",
                                                      borderBottom:
                                                          "2px solid var(--border-color)",
                                                      color: "var(--table-head-text)",
                                                      fontWeight: "bold",
                                                  }}
                                              >
                                                  ID
                                              </th>
                                              <th
                                                  style={{
                                                      padding: "16px",
                                                      borderBottom:
                                                          "2px solid var(--border-color)",
                                                      color: "var(--table-head-text)",
                                                      fontWeight: "bold",
                                                  }}
                                              >
                                                  Applicant Name
                                              </th>
                                              <th
                                                  style={{
                                                      padding: "16px",
                                                      borderBottom:
                                                          "2px solid var(--border-color)",
                                                      color: "var(--table-head-text)",
                                                      fontWeight: "bold",
                                                  }}
                                              >
                                                  Merit Score
                                              </th>
                                              <th
                                                  style={{
                                                      padding: "16px",
                                                      borderBottom:
                                                          "2px solid var(--border-color)",
                                                      color: "var(--table-head-text)",
                                                      fontWeight: "bold",
                                                  }}
                                              >
                                                  Department
                                              </th>
                                              <th
                                                  style={{
                                                      padding: "16px",
                                                      borderBottom:
                                                          "2px solid var(--border-color)",
                                                      color: "var(--table-head-text)",
                                                      fontWeight: "bold",
                                                  }}
                                              >
                                                  Date
                                              </th>
                                              <th
                                                  style={{
                                                      padding: "16px",
                                                      borderBottom:
                                                          "2px solid var(--border-color)",
                                                      color: "var(--table-head-text)",
                                                      fontWeight: "bold",
                                                  }}
                                              >
                                                  Status
                                              </th>
                                              <th
                                                  style={{
                                                      padding: "16px",
                                                      borderBottom:
                                                          "2px solid var(--border-color)",
                                                      color: "var(--table-head-text)",
                                                      fontWeight: "bold",
                                                  }}
                                              >
                                                  Actions
                                              </th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {applications.length === 0 ? (
                                              <tr
                                                  style={{
                                                      borderBottom:
                                                          "1px solid var(--border-color)",
                                                      height: "61px",
                                                  }}
                                              >
                                                  <td
                                                      colSpan="7"
                                                      className="animate-fade-in"
                                                      style={{
                                                          padding: "0",
                                                          margin: "0",
                                                          textAlign: "center",
                                                          color: "var(--text-muted)",
                                                          fontSize: "15px",
                                                          verticalAlign:
                                                              "middle",
                                                          boxSizing:
                                                              "border-box",
                                                      }}
                                                  >
                                                      No{" "}
                                                      {statusFilter !== "All"
                                                          ? statusFilter.toLowerCase()
                                                          : ""}{" "}
                                                      applications found.
                                                  </td>
                                              </tr>
                                          ) : (
                                              applications.map((app) => (
                                                  <tr
                                                      key={app.Application_ID}
                                                      className="table-row-hover animate-fade-in"
                                                      style={{
                                                          borderBottom:
                                                              "1px solid var(--border-color)",
                                                      }}
                                                  >
                                                      <td
                                                          style={{
                                                              padding: "16px",
                                                              color: "var(--table-row-text)",
                                                          }}
                                                      >
                                                          {app.Application_ID}
                                                      </td>
                                                      <td
                                                          style={{
                                                              padding: "16px",
                                                              color: "var(--table-row-text)",
                                                          }}
                                                      >
                                                          {app.First_Name}{" "}
                                                          {app.Last_Name}
                                                      </td>
                                                      <td
                                                          style={{
                                                              padding: "16px",
                                                              color: "var(--highlight)",
                                                              fontWeight:
                                                                  "bold",
                                                          }}
                                                      >
                                                          {app.Merit_Score}
                                                      </td>
                                                      <td
                                                          style={{
                                                              padding: "16px",
                                                              color: "var(--table-row-text)",
                                                          }}
                                                      >
                                                          {app.Dept_Name}
                                                      </td>
                                                      <td
                                                          style={{
                                                              padding: "16px",
                                                              color: "var(--table-row-text)",
                                                          }}
                                                      >
                                                          {new Date(
                                                              app.Application_Date,
                                                          ).toLocaleDateString()}
                                                      </td>
                                                      <td
                                                          style={{
                                                              padding: "16px",
                                                          }}
                                                      >
                                                          <span
                                                              style={{
                                                                  padding:
                                                                      "6px 10px",
                                                                  borderRadius:
                                                                      "4px",
                                                                  fontSize:
                                                                      "12px",
                                                                  fontWeight:
                                                                      "bold",
                                                                  backgroundColor:
                                                                      app.Status ===
                                                                      "Pending"
                                                                          ? "#fff3cd"
                                                                          : app.Status ===
                                                                              "Approved"
                                                                            ? "#d4edda"
                                                                            : "#f8d7da",
                                                                  color:
                                                                      app.Status ===
                                                                      "Pending"
                                                                          ? "#856404"
                                                                          : app.Status ===
                                                                              "Approved"
                                                                            ? "#155724"
                                                                            : "#721c24",
                                                              }}
                                                          >
                                                              {app.Status}
                                                          </span>
                                                      </td>
                                                      <td
                                                          style={{
                                                              padding: "16px",
                                                          }}
                                                      >
                                                          {app.Status ===
                                                              "Pending" && (
                                                              <div
                                                                  style={{
                                                                      display:
                                                                          "flex",
                                                                      gap: "10px",
                                                                  }}
                                                              >
                                                                  <button
                                                                      className="btn-interactive"
                                                                      onClick={() =>
                                                                          handleStatusChange(
                                                                              app.Application_ID,
                                                                              "approve",
                                                                          )
                                                                      }
                                                                      style={{
                                                                          backgroundColor:
                                                                              "#28a745",
                                                                          color: "white",
                                                                          border: "none",
                                                                          padding:
                                                                              "6px 12px",
                                                                          borderRadius:
                                                                              "4px",
                                                                          cursor: "pointer",
                                                                          fontWeight:
                                                                              "bold",
                                                                      }}
                                                                  >
                                                                      Approve
                                                                  </button>
                                                                  <button
                                                                      className="btn-interactive"
                                                                      onClick={() =>
                                                                          handleStatusChange(
                                                                              app.Application_ID,
                                                                              "reject",
                                                                          )
                                                                      }
                                                                      style={{
                                                                          backgroundColor:
                                                                              "#dc3545",
                                                                          color: "white",
                                                                          border: "none",
                                                                          padding:
                                                                              "6px 12px",
                                                                          borderRadius:
                                                                              "4px",
                                                                          cursor: "pointer",
                                                                          fontWeight:
                                                                              "bold",
                                                                      }}
                                                                  >
                                                                      Reject
                                                                  </button>
                                                              </div>
                                                          )}

                                                          {app.Status ===
                                                              "Approved" && (
                                                              <button
                                                                  className="btn-interactive"
                                                                  onClick={() =>
                                                                      handleDelete(
                                                                          app.Application_ID,
                                                                      )
                                                                  }
                                                                  style={{
                                                                      backgroundColor:
                                                                          "#6c757d",
                                                                      color: "white",
                                                                      border: "none",
                                                                      padding:
                                                                          "6px 12px",
                                                                      borderRadius:
                                                                          "4px",
                                                                      cursor: "pointer",
                                                                      fontWeight:
                                                                          "bold",
                                                                  }}
                                                              >
                                                                  Delete Entry
                                                              </button>
                                                          )}

                                                          {app.Status ===
                                                              "Rejected" && (
                                                              <div
                                                                  style={{
                                                                      display:
                                                                          "flex",
                                                                      gap: "10px",
                                                                  }}
                                                              >
                                                                  <button
                                                                      className="btn-interactive"
                                                                      onClick={() =>
                                                                          handleStatusChange(
                                                                              app.Application_ID,
                                                                              "restore",
                                                                          )
                                                                      }
                                                                      style={{
                                                                          backgroundColor:
                                                                              "#f59e0b",
                                                                          color: "white",
                                                                          border: "none",
                                                                          padding:
                                                                              "6px 12px",
                                                                          borderRadius:
                                                                              "4px",
                                                                          cursor: "pointer",
                                                                          fontWeight:
                                                                              "bold",
                                                                      }}
                                                                  >
                                                                      Restore
                                                                  </button>
                                                                  <button
                                                                      className="btn-interactive"
                                                                      onClick={() =>
                                                                          handleDelete(
                                                                              app.Application_ID,
                                                                          )
                                                                      }
                                                                      style={{
                                                                          backgroundColor:
                                                                              "#6c757d",
                                                                          color: "white",
                                                                          border: "none",
                                                                          padding:
                                                                              "6px 12px",
                                                                          borderRadius:
                                                                              "4px",
                                                                          cursor: "pointer",
                                                                          fontWeight:
                                                                              "bold",
                                                                      }}
                                                                  >
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
                      )}
                  </div>
              )}
          </div>
      </div>
  );
}

export default App