import { useState } from "react";
import StudentPortal from "./components/StudentPortal";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

function App() {
    const [view, setView] = useState("student");
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminToken, setAdminToken] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);

    const handleLoginSuccess = (token) => {
        setAdminToken(token);
        setIsAdminAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAdminAuthenticated(false);
        setAdminToken("");
    };

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
                            onClick={() => setView("admin")}
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
                                fontWeight:
                                    view === "admin" ? "bold" : "normal",
                                border: "1px solid var(--border-color)",
                                borderRadius: "4px",
                            }}
                        >
                            Admin Dashboard
                        </button>
                    </div>
                </div>

                {view === "student" && <StudentPortal />}

                {view === "admin" && !isAdminAuthenticated && (
                    <AdminLogin onLogin={handleLoginSuccess} />
                )}

                {view === "admin" && isAdminAuthenticated && (
                    <AdminDashboard
                        token={adminToken}
                        onLogout={handleLogout}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
