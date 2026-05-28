import { useState } from "react";
import StudentPortal from "./components/StudentPortal";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

function App() {
    const [view, setView] = useState("student");
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminToken, setAdminToken] = useState("");
    const [adminRole, setAdminRole] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [adminUsername, setAdminUsername] = useState("");

    const handleLoginSuccess = (token) => {
        setAdminToken(token);
        setIsAdminAuthenticated(true);
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(window.atob(base64));
            setAdminRole(payload.role || "Reviewer");
            setAdminUsername(payload.username || "Admin");
        } catch (e) {
            setAdminRole("Reviewer");
            setAdminUsername("Admin");
        }
    };

    const handleLogout = () => {
        setIsAdminAuthenticated(false);
        setAdminToken("");
        setAdminRole("");
    };

    return (
        <div
            className="theme-transition"
            style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-main)",
                height: "100vh",
                width: "100vw",
                padding: "0",
                margin: "0",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                fontFamily: "system-ui",
            }}
        >
            <style>
                {`
          :root {
            --bg-color: ${isDarkMode ? "#12141c" : "#e5e7eb"};
            --card-bg: ${isDarkMode ? "#1a1d26" : "#f0f2f5"};
            --border-color: ${isDarkMode ? "#2d313f" : "#dee2e6"};
            --text-main: ${isDarkMode ? "#ffffff" : "#212529"};
            --text-muted: ${isDarkMode ? "#a0a5b5" : "#6c757d"};
            --input-bg: ${isDarkMode ? "#222633" : "#f0f2f5"};
            --highlight: ${isDarkMode ? "#00ffcc" : "#007BFF"};
            --table-head-bg: ${isDarkMode ? "#ffffff" : "#e9ecef"};
            --table-head-text: ${isDarkMode ? "#000000" : "#212529"};
            --table-row-text: ${isDarkMode ? "#d1d5db" : "#495057"};
            --hover-bg: ${isDarkMode ? "#222633" : "#e2e6ea"};
            --btn-inactive-bg: ${isDarkMode ? "#222633" : "#dee2e6"};
            --modal-shadow: ${isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"};
          }

          .theme-transition { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease; }

          @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

          .animate-fade-in {
              animation: fadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
              transform: translateZ(0);
              backface-visibility: hidden;
              perspective: 1000px;
          }

          .hover-lift {
              transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
              transform: translateZ(0);
              will-change: transform, box-shadow;
              backface-visibility: hidden;
          }

          .hover-lift:hover {
              transform: translateY(-5px) translateZ(0);
              box-shadow: 0 10px 25px var(--modal-shadow);
              border-color: var(--highlight);
          }

          .btn-interactive {
              transition: transform 0.2s ease, filter 0.2s ease;
              transform: translateZ(0);
          }

          .btn-interactive:hover {
              filter: brightness(1.1);
              transform: scale(1.02) translateZ(0);
          }

          .btn-interactive:active {
              transform: scale(0.97) translateZ(0);
          }

          .table-row-hover:hover { background-color: var(--hover-bg) !important; }
          .input-focus:focus { outline: none; border-color: var(--highlight) !important; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15); }
          select option { background-color: var(--card-bg); color: var(--text-main); }
        `}
            </style>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px 30px",
                    borderBottom: "1px solid var(--border-color)",
                    backgroundColor: "var(--bg-color)",
                    zIndex: 20,
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        color: "var(--text-main)",
                        fontSize: "20px",
                    }}
                >
                    Admission System
                </h1>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        style={{
                            width: "56px",
                            height: "30px",
                            borderRadius: "15px",
                            backgroundColor: isDarkMode ? "#222633" : "#dee2e6",
                            border: "1px solid var(--border-color)",
                            display: "flex",
                            alignItems: "center",
                            padding: "3px",
                            cursor: "pointer",
                            marginRight: "16px",
                            transition: "background-color 0.3s ease",
                        }}
                    >
                        <div
                            style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                backgroundColor: "var(--card-bg)",
                                transform: isDarkMode
                                    ? "translateX(26px)"
                                    : "translateX(0)",
                                transition: "transform 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 4px var(--modal-shadow)",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "12px",
                                    userSelect: "none",
                                    lineHeight: 1,
                                }}
                            >
                                {isDarkMode ? "🌙" : "☀️"}
                            </span>
                        </div>
                    </div>

                    <button
                        className="btn-interactive"
                        onClick={() => setView("student")}
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
                            fontWeight: view === "student" ? "bold" : "normal",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                        }}
                    >
                        Student Portal
                    </button>

                    <button
                        className="btn-interactive"
                        onClick={() => setView("admin")}
                        style={{
                            padding: "8px 16px",
                            cursor: "pointer",
                            backgroundColor:
                                view === "admin"
                                    ? "#007BFF"
                                    : "var(--btn-inactive-bg)",
                            color:
                                view === "admin" ? "#fff" : "var(--text-muted)",
                            fontWeight: view === "admin" ? "bold" : "normal",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                        }}
                    >
                        Admin Dashboard
                    </button>
                </div>
            </div>

            <div
                style={{
                    flex: 1,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {(view === "student" ||
                    (view === "admin" && !isAdminAuthenticated)) && (
                    <div
                        style={{ flex: 1, overflowY: "auto", padding: "20px" }}
                    >
                        <div
                            className="animate-fade-in"
                            style={{ maxWidth: "1000px", margin: "0 auto" }}
                        >
                            {view === "student" && <StudentPortal />}
                            {view === "admin" && !isAdminAuthenticated && (
                                <AdminLogin onLogin={handleLoginSuccess} />
                            )}
                        </div>
                    </div>
                )}

                {view === "admin" && isAdminAuthenticated && (
                    <AdminDashboard
                        token={adminToken}
                        role={adminRole}
                        username={adminUsername}
                        onLogout={handleLogout}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
