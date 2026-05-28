import { useState } from "react";

function AdminSidebar({ activeTab, setActiveTab, role, username, onLogout }) {
    const [isOpen, setIsOpen] = useState(true);

    const navItems = [
        {
            id: "analytics",
            label: "Analytics Overview",
            icon: (
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            ),
        },
        {
            id: "entries",
            label: "Student Entries",
            icon: (
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
        },
        {
            id: "activity",
            label: "Activity Log",
            icon: (
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            ),
        },
        {
            id: "tickets",
            label: "Support Tickets",
            icon: (
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
            ),
        },
    ];

    if (role === "SuperAdmin") {
        navItems.push({
            id: "team",
            label: "Team Panel",
            icon: (
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
        });
    }

    return (
        <div
            style={{
                width: isOpen ? "250px" : "70px",
                backgroundColor: "var(--card-bg)",
                borderRight: "1px solid var(--border-color)",
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                zIndex: 10,
                flexShrink: 0,
            }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "absolute",
                    right: "-12px",
                    top: "20px",
                    background: "var(--highlight)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    fontSize: "10px",
                    zIndex: 20,
                }}
            >
                {isOpen ? "◀" : "▶"}
            </button>

            <div
                style={{
                    padding: "20px 15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        minWidth: "32px",
                        height: "32px",
                        background:
                            "linear-gradient(135deg, var(--highlight), #818cf8)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "14px",
                        flexShrink: 0,
                    }}
                >
                    AD
                </div>
                {isOpen && (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        <span
                            style={{
                                color: "var(--text-main)",
                                fontWeight: "700",
                                fontSize: "14px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {username || "Admin"}
                        </span>
                        <span
                            style={{
                                color: "var(--highlight)",
                                fontSize: "10px",
                                fontWeight: "700",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {role.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            <div
                style={{
                    flex: 1,
                    padding: "15px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    overflowX: "hidden",
                    overflowY: "auto",
                }}
            >
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="btn-interactive"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 15px",
                            backgroundColor:
                                activeTab === item.id
                                    ? "rgba(99, 102, 241, 0.15)"
                                    : "transparent",
                            color:
                                activeTab === item.id
                                    ? "var(--highlight)"
                                    : "var(--text-muted)",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            justifyContent: isOpen ? "flex-start" : "center",
                            borderLeft:
                                activeTab === item.id
                                    ? "3px solid var(--highlight)"
                                    : "3px solid transparent",
                            width: "100%",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            {item.icon}
                        </div>
                        {isOpen && (
                            <span
                                style={{
                                    fontWeight: "600",
                                    fontSize: "13px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {item.label}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div
                style={{
                    padding: "15px 10px",
                    borderTop: "1px solid rgba(148, 163, 184, 0.1)",
                    overflow: "hidden",
                }}
            >
                <button
                    onClick={onLogout}
                    className="btn-interactive"
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 15px",
                        backgroundColor: "rgba(248, 113, 113, 0.1)",
                        color: "#f87171",
                        border: "1px solid rgba(248, 113, 113, 0.2)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        justifyContent: isOpen ? "flex-start" : "center",
                        overflow: "hidden",
                    }}
                >
                    <svg
                        style={{ flexShrink: 0 }}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    {isOpen && (
                        <span
                            style={{
                                fontWeight: "600",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            LOGOUT
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

export default AdminSidebar;
