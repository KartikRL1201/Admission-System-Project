import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import axios from "axios";

function AdminActivityLog({ token, role }) {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get("/api/admin/activity", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.success) {
                    setLogs(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            }
        };
        fetchLogs();
    }, [token]);

    const handleExport = () => {
        if (logs.length === 0) return setError("No data.");
        const formattedData = logs.map((log) => ({
            "Log ID": log.Log_ID,
            Action: log.Action_Type,
            Admin: log.Admin_Username,
            Description: log.Description,
            Date: new Date(log.Created_At).toLocaleString(),
        }));
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
        XLSX.writeFile(workbook, "Admin_Logs.xlsx");
    };

    const handleClearLogs = async () => {
        if (
            !window.confirm(
                "Are you sure you want to permanently clear all activity logs? This action cannot be undone.",
            )
        )
            return;

        setError("");
        setSuccess("");

        try {
            const response = await axios.delete("/api/admin/activity", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setSuccess("Audit logs successfully cleared.");
                setLogs([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to clear logs.");
        }
    };

    return (
        <div
            className="animate-fade-in"
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(148, 163, 184, 0.2); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(148, 163, 184, 0.4); }
                `}
            </style>

            {error && (
                <div
                    style={{
                        flexShrink: 0,
                        padding: "12px",
                        backgroundColor: "rgba(220, 53, 69, 0.1)",
                        borderLeft: "4px solid #ef4444",
                        color: "#f87171",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        fontSize: "13px",
                    }}
                >
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div
                    style={{
                        flexShrink: 0,
                        padding: "12px",
                        backgroundColor: "rgba(40, 167, 69, 0.1)",
                        borderLeft: "4px solid #22c55e",
                        color: "#4ade80",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        fontSize: "13px",
                    }}
                >
                    {success}
                </div>
            )}

            <div
                style={{
                    flexShrink: 0,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                }}
            >
                <div>
                    <h2
                        style={{
                            margin: 0,
                            color: "var(--text-main)",
                            fontSize: "20px",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        System Activity Log
                    </h2>
                    <p
                        style={{
                            margin: "5px 0 0 0",
                            color: "var(--text-muted)",
                            fontSize: "13px",
                        }}
                    >
                        Automated tracking of database state changes and
                        administrative actions.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {role === "SuperAdmin" && (
                        <button
                            className="btn-interactive"
                            onClick={handleClearLogs}
                            style={{
                                backgroundColor: "rgba(220, 53, 69, 0.15)",
                                color: "#f87171",
                                border: "1px solid rgba(248, 113, 113, 0.3)",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "11px",
                                marginTop: "4px",
                            }}
                        >
                            CLEAR LOGS
                        </button>
                    )}
                    <button
                        className="btn-interactive"
                        onClick={handleExport}
                        style={{
                            backgroundColor: "rgba(56, 189, 248, 0.15)",
                            color: "#38bdf8",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "700",
                            fontSize: "11px",
                            marginTop: "4px",
                        }}
                    >
                        EXPORT
                    </button>
                </div>
            </div>

            <div
                style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}
                className="custom-scrollbar"
            >
                {logs.length === 0 && !error ? (
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                            fontSize: "14px",
                            backgroundColor: "var(--card-bg)",
                            borderRadius: "10px",
                            border: "1px solid var(--border-color)",
                        }}
                    >
                        No system activity recorded yet. Change a student's
                        status to test the triggers.
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        {logs.map((log) => (
                            <div
                                key={log.Log_ID}
                                className="hover-lift"
                                style={{
                                    backgroundColor: "var(--card-bg)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    padding: "16px 20px",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "15px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "8px",
                                        backgroundColor:
                                            "rgba(56, 189, 248, 0.1)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <span style={{ fontSize: "16px" }}>⚡</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "var(--text-main)",
                                                    fontWeight: "600",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                {log.Action_Type}
                                            </span>
                                            <span
                                                style={{
                                                    backgroundColor:
                                                        "rgba(148, 163, 184, 0.1)",
                                                    color: "var(--highlight)",
                                                    padding: "2px 8px",
                                                    borderRadius: "12px",
                                                    fontSize: "10px",
                                                    fontWeight: "700",
                                                }}
                                            >
                                                BY {log.Admin_Username}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                color: "var(--text-muted)",
                                                fontSize: "11px",
                                                fontWeight: "500",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {new Date(
                                                log.Created_At,
                                            ).toLocaleString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "13px",
                                            lineHeight: "1.5",
                                        }}
                                    >
                                        {log.Description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminActivityLog;
