import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import axios from "axios";

function AdminEntries({ token, role, targetEntryId, setTargetEntryId }) {
    const [applications, setApplications] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    const thStyle = {
        padding: "14px 10px",
        color: "var(--text-muted)",
        fontWeight: "600",
        fontSize: "11px",
        textTransform: "uppercase",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background:
            "linear-gradient(rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.5)), var(--card-bg)",
        boxShadow: "inset 0 -1px 0 rgba(99, 102, 241, 0.3)",
    };

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    useEffect(() => {
        if (targetEntryId && applications.length > 0) {
            if (statusFilter !== "All" && statusFilter !== "Pending") {
                setStatusFilter("All");
                return;
            }

            const scrollTimer = setTimeout(() => {
                const row = document.getElementById(`row-${targetEntryId}`);
                if (row) {
                    row.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 100);

            const clearTimer = setTimeout(() => {
                setTargetEntryId(null);
            }, 2000);

            return () => {
                clearTimeout(scrollTimer);
                clearTimeout(clearTimer);
            };
        }
    }, [targetEntryId, applications, statusFilter, setTargetEntryId]);

    const fetchApplications = async () => {
        try {
            const url =
                statusFilter === "All"
                    ? "/api/admin/applications"
                    : `/api/admin/applications?status=${statusFilter}`;
            const response = await axios.get(url, authConfig);
            if (response.data.success) setApplications(response.data.data);
        } catch (err) {
            setError("Failed to load applications.");
        }
    };

    const handleStatusChange = async (id, action) => {
        setError("");
        setSuccess("");
        try {
            const response = await axios.put(
                `/api/admin/applications/${id}/${action}`,
                {},
                authConfig,
            );
            if (response.data.success) {
                setSuccess(`Application #${id} updated.`);
                fetchApplications();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status.");
        }
    };

    const handleDelete = async (id) => {
        setError("");
        setSuccess("");
        try {
            const response = await axios.delete(
                `/api/admin/applications/${id}`,
                authConfig,
            );
            if (response.data.success) {
                setSuccess(`Application #${id} deleted.`);
                fetchApplications();
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to delete application.",
            );
        }
    };

    const handleSystemReset = async () => {
        if (!window.confirm("Clear all records?")) return;
        setError("");
        setSuccess("");
        try {
            const response = await axios.post(
                "/api/admin/reset",
                {},
                authConfig,
            );
            if (response.data.success) {
                setSuccess(response.data.message);
                setApplications([]);
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "SuperAdmin access required.",
            );
        }
    };

    const handleExport = () => {
        if (applications.length === 0) return setError("No data.");
        const formattedData = applications.map((app) => ({
            ID: app.Application_ID,
            Name: `${app.First_Name} ${app.Last_Name}`,
            "Merit Score": app.Merit_Score,
            Department: app.Dept_Name,
            Date: new Date(app.Application_Date).toLocaleDateString(),
            Status: app.Status,
        }));
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
        XLSX.writeFile(workbook, "Admissions.xlsx");
    };

    const displayedApplications = applications.filter((app) => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${app.First_Name} ${app.Last_Name}`.toLowerCase();
        const idString = app.Application_ID.toString();
        return fullName.includes(searchLower) || idString.includes(searchLower);
    });

    return (
        <div
            className="animate-fade-in"
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
            <style>
                {`
                @keyframes highlightPulse {
                    0% { background-color: rgba(56, 189, 248, 0.4); }
                    100% { background-color: transparent; }
                }
                tr.highlight-fade {
                    animation: highlightPulse 2s ease-out forwards;
                }
                tr.highlight-fade:hover {
                    background-color: rgba(56, 189, 248, 0.4) !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(148, 163, 184, 0.2);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(148, 163, 184, 0.4);
                }
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
                    alignItems: "center",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "10px",
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
                            fontSize: "20px",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        Data Entries
                    </h2>
                    <input
                        type="text"
                        placeholder="Search Name or ID..."
                        className="input-focus"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            fontSize: "12px",
                            color: "var(--text-main)",
                            backgroundColor: "var(--input-bg)",
                            outline: "none",
                            width: "200px",
                        }}
                    />
                    <select
                        className="input-focus"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            fontWeight: "600",
                            fontSize: "12px",
                            color: "var(--text-main)",
                            backgroundColor: "var(--input-bg)",
                            outline: "none",
                        }}
                    >
                        <option value="All">All Applications</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    {role === "SuperAdmin" && (
                        <button
                            className="btn-interactive"
                            onClick={handleSystemReset}
                            style={{
                                backgroundColor: "rgba(220, 53, 69, 0.15)",
                                color: "#f87171",
                                border: "1px solid rgba(248, 113, 113, 0.3)",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "11px",
                            }}
                        >
                            RESET
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
                        }}
                    >
                        EXPORT
                    </button>
                </div>
            </div>

            <div
                className="custom-scrollbar"
                style={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    backgroundColor: "var(--card-bg)",
                    borderRadius: "10px",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        tableLayout: "fixed",
                        borderCollapse: "collapse",
                        textAlign: "left",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ width: "6%", ...thStyle }}>ID</th>
                            <th style={{ width: "15%", ...thStyle }}>Name</th>
                            <th style={{ width: "8%", ...thStyle }}>Merit</th>
                            <th style={{ width: "18%", ...thStyle }}>
                                Department
                            </th>
                            <th style={{ width: "10%", ...thStyle }}>Date</th>
                            <th
                                style={{
                                    width: "12%",
                                    paddingLeft: "14px",
                                    ...thStyle,
                                }}
                            >
                                Status
                            </th>
                            <th
                                style={{
                                    width: "31%",
                                    paddingLeft: "26px",
                                    ...thStyle,
                                }}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedApplications.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    style={{
                                        padding: "30px",
                                        textAlign: "center",
                                        color: "var(--text-muted)",
                                        fontStyle: "italic",
                                        fontSize: "13px",
                                    }}
                                >
                                    No applications found.
                                </td>
                            </tr>
                        ) : (
                            displayedApplications.map((app) => (
                                <tr
                                    key={app.Application_ID}
                                    id={`row-${app.Application_ID}`}
                                    className={`table-row-hover ${targetEntryId === app.Application_ID ? "highlight-fade" : ""}`}
                                    style={{
                                        borderBottom:
                                            "1px solid rgba(148, 163, 184, 0.05)",
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: "10px",
                                            color: "var(--text-muted)",
                                            fontSize: "12px",
                                        }}
                                    >
                                        #{app.Application_ID}
                                    </td>
                                    <td
                                        style={{
                                            padding: "10px",
                                            color: "var(--text-main)",
                                            fontWeight: "500",
                                            fontSize: "13px",
                                        }}
                                    >
                                        {app.First_Name} {app.Last_Name}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        <span
                                            style={{
                                                color: "var(--highlight)",
                                                fontWeight: "700",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {app.Merit_Score}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: "10px",
                                            color: "var(--text-muted)",
                                            fontSize: "12px",
                                            whiteSpace: "normal",
                                            wordWrap: "break-word",
                                        }}
                                    >
                                        {app.Dept_Name}
                                    </td>
                                    <td
                                        style={{
                                            padding: "10px",
                                            color: "var(--text-muted)",
                                            fontSize: "12px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {new Date(
                                            app.Application_Date,
                                        ).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td style={{ padding: "10px" }}>
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "75px",
                                                textAlign: "center",
                                                padding: "4px 0",
                                                borderRadius: "12px",
                                                fontSize: "10px",
                                                fontWeight: "700",
                                                textTransform: "uppercase",
                                                backgroundColor:
                                                    app.Status === "Pending"
                                                        ? "rgba(251, 191, 36, 0.15)"
                                                        : app.Status ===
                                                            "Approved"
                                                          ? "rgba(74, 222, 128, 0.15)"
                                                          : app.Status ===
                                                              "Archived"
                                                            ? "rgba(148, 163, 184, 0.15)"
                                                            : "rgba(248, 113, 113, 0.15)",
                                                color:
                                                    app.Status === "Pending"
                                                        ? "#fbbf24"
                                                        : app.Status ===
                                                            "Approved"
                                                          ? "#4ade80"
                                                          : app.Status ===
                                                              "Archived"
                                                            ? "#cbd5e1"
                                                            : "#f87171",
                                                border: `1px solid ${app.Status === "Pending" ? "rgba(251, 191, 36, 0.3)" : app.Status === "Approved" ? "rgba(74, 222, 128, 0.3)" : app.Status === "Archived" ? "rgba(148, 163, 184, 0.3)" : "rgba(248, 113, 113, 0.3)"}`,
                                            }}
                                        >
                                            {app.Status}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: "10px 10px 10px 24px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                flexWrap: "nowrap",
                                                gap: "6px",
                                            }}
                                        >
                                            {app.Status === "Pending" && (
                                                <>
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
                                                                "rgba(74, 222, 128, 0.15)",
                                                            color: "#4ade80",
                                                            border: "1px solid rgba(74, 222, 128, 0.3)",
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            fontWeight: "700",
                                                            fontSize: "10px",
                                                        }}
                                                    >
                                                        APPROVE
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
                                                                "rgba(248, 113, 113, 0.15)",
                                                            color: "#f87171",
                                                            border: "1px solid rgba(248, 113, 113, 0.3)",
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            fontWeight: "700",
                                                            fontSize: "10px",
                                                        }}
                                                    >
                                                        REJECT
                                                    </button>
                                                </>
                                            )}
                                            {app.Status === "Approved" &&
                                                role === "SuperAdmin" && (
                                                    <button
                                                        className="btn-interactive"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                app.Application_ID,
                                                                "archive",
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                "rgba(148, 163, 184, 0.15)",
                                                            color: "#cbd5e1",
                                                            border: "1px solid rgba(148, 163, 184, 0.3)",
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            fontWeight: "700",
                                                            fontSize: "10px",
                                                        }}
                                                    >
                                                        ARCHIVE
                                                    </button>
                                                )}
                                            {app.Status === "Rejected" && (
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
                                                            "rgba(251, 191, 36, 0.15)",
                                                        color: "#fbbf24",
                                                        border: "1px solid rgba(251, 191, 36, 0.3)",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        fontWeight: "700",
                                                        fontSize: "10px",
                                                    }}
                                                >
                                                    RESTORE
                                                </button>
                                            )}
                                            {app.Status === "Archived" && (
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
                                                            "rgba(251, 191, 36, 0.15)",
                                                        color: "#fbbf24",
                                                        border: "1px solid rgba(251, 191, 36, 0.3)",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        fontWeight: "700",
                                                        fontSize: "10px",
                                                    }}
                                                >
                                                    RESTORE
                                                </button>
                                            )}
                                            {role === "SuperAdmin" &&
                                                app.Status !== "Pending" && (
                                                    <button
                                                        className="btn-interactive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                app.Application_ID,
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                "rgba(239, 68, 68, 0.15)",
                                                            color: "#ef4444",
                                                            border: "1px solid rgba(239, 68, 68, 0.3)",
                                                            padding: "4px 8px",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            fontWeight: "700",
                                                            fontSize: "10px",
                                                        }}
                                                    >
                                                        DELETE
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminEntries;
